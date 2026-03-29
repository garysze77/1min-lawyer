import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Input validation constants
const MAX_NAME_LENGTH = 100
const MAX_CONTACT_LENGTH = 100

// Telegram notification (from environment variables)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '5647841505'

// Log env var status at module load time (helps debug missing vars)
console.log('[Referral API] TG bot token:', TELEGRAM_BOT_TOKEN ? `SET (${TELEGRAM_BOT_TOKEN.slice(0, 8)}...)` : 'NOT SET')
console.log('[Referral API] TG admin chat ID:', TELEGRAM_ADMIN_CHAT_ID || 'NOT SET')

async function sendTelegramNotification(name: string, contact: string, question?: string) {
  // Defensive: skip if bot token is not configured
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'your-telegram-bot-token') {
    console.warn('[TG Notification] Bot token not configured, skipping notification')
    return
  }

  let message = `🔔 律師轉介查詢\n\n👤 姓名: ${name}\n📞 聯絡: ${contact}`

  if (question) {
    message += `\n\n❓ 咨詢內容:\n${question}`
  }

  message += `\n\n⏰ 時間: ${new Date().toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' })}`

  try {
    console.log('[TG Notification] Sending request to Telegram API...')
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    console.log('[TG Notification] Response status:', response.status)

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[TG Notification] HTTP ${response.status}: ${errorBody}`)
    } else {
      const result = await response.json()
      console.log('[TG Notification] Response body:', JSON.stringify(result))
      if (!result.ok) {
        console.error('[TG Notification] TG API error:', result.description)
      } else {
        console.log('[TG Notification] Sent successfully, message_id:', result.result?.message_id)
      }
    }
  } catch (error) {
    console.error('[TG Notification] Failed:', error)
  }
}

function isValidEmail(contact: string): boolean {
  return contact.includes('@') && contact.includes('.') && contact.indexOf('@') < contact.indexOf('.')
}

function isValidPhone(contact: string): boolean {
  if (contact.startsWith('+')) return contact.replace(/[^0-9]/g, '').length >= 8
  return /^\d{8,}$/.test(contact.replace(/[\s\-()]/g, ''))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question_id, name, contact } = body

    // Validate required fields
    if (!name || !contact) {
      return NextResponse.json(
        { error: 'Missing required fields: name, contact' },
        { status: 400 }
      )
    }

    // Validate name length
    if (typeof name !== 'string' || name.trim().length === 0 || name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Name must be 1-${MAX_NAME_LENGTH} characters` },
        { status: 400 }
      )
    }

    // Validate contact length
    if (typeof contact !== 'string' || contact.length < 3 || contact.length > MAX_CONTACT_LENGTH) {
      return NextResponse.json(
        { error: `Contact must be 3-${MAX_CONTACT_LENGTH} characters` },
        { status: 400 }
      )
    }

    // Validate contact format: must be email OR phone
    const trimmedContact = contact.trim()
    if (!isValidEmail(trimmedContact) && !isValidPhone(trimmedContact)) {
      return NextResponse.json(
        { error: 'Contact must be a valid email address or phone number (start with + or have 8+ digits)' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Fetch question text if question_id is provided
    let questionText: string | undefined
    if (question_id) {
      const { data: questionData } = await supabase
        .from('questions')
        .select('question_text')
        .eq('id', question_id)
        .single()
      questionText = questionData?.question_text
    }

    const { data, error } = await supabase
      .from('referrals')
      .insert({
        question_id: question_id || null,
        name: name.trim(),
        contact: trimmedContact,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to submit referral' },
        { status: 500 }
      )
    }

    // Send Telegram notification (non-blocking)
    console.log(`[Referral API] Notifying TG - name=${name.trim()}, contact=${trimmedContact}, question_id=${question_id ?? 'none'}, questionText=${questionText ? 'present' : 'none'}`)
    sendTelegramNotification(name.trim(), trimmedContact, questionText)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

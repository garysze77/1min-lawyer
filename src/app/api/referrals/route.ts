import { NextRequest, NextResponse } from 'next/server'
import { createBrowserClient } from '@supabase/ssr'

// Input validation constants
const MAX_NAME_LENGTH = 100
const MAX_CONTACT_LENGTH = 100

// Supabase Edge Function URL for Telegram notifications
const SUPABASE_EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/bright-service`

async function sendTelegramNotification(name: string, contact: string, question?: string) {
  try {
    console.log('[TG Notification] Calling Supabase Edge Function...')

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contact, question }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    console.log('[TG Notification] Edge function response status:', response.status)

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[TG Notification] Edge function error ${response.status}: ${errorBody}`)
    } else {
      const result = await response.json()
      console.log('[TG Notification] Edge function response:', JSON.stringify(result))
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('[TG Notification] Request timed out after 15s')
    } else {
      console.error('[TG Notification] Failed:', error)
    }
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

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

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

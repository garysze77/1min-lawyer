import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Rate limiting: simple in-memory Map (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function getRateLimitInfo(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count }
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitInfo = getRateLimitInfo(ip)

    if (!rateLimitInfo.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { category, subcategory, question_text } = body

    if (!category || !subcategory || !question_text) {
      return NextResponse.json(
        { error: 'Missing required fields: category, subcategory, question_text' },
        { status: 400 }
      )
    }

    // Validate question_text length
    if (typeof question_text !== 'string' || question_text.length > 2000) {
      return NextResponse.json(
        { error: 'question_text must be at most 2000 characters' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Insert question into database
    const { data, error } = await supabase
      .from('questions')
      .insert({
        category,
        subcategory,
        question_text,
        ai_response: null, // Will be updated by edge function
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to submit question' },
        { status: 500 }
      )
    }

    // Call MiniMax AI Edge Function for analysis
    const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        question_id: data.id,
        category,
        subcategory,
        question_text,
      }),
    })

    if (aiResponse.ok) {
      try {
        const aiData = await aiResponse.json()
        // Update the record with the AI response
        await supabase
          .from('questions')
          .update({ ai_response: aiData })
          .eq('id', data.id)
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
      }
    } else {
      console.error('AI analysis failed:', await aiResponse.text())
    }

    // Fetch updated record with AI response
    const { data: updatedData } = await supabase
      .from('questions')
      .select('*')
      .eq('id', data.id)
      .single()

    return NextResponse.json({
      success: true,
      data: updatedData,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Question ID is required' },
      { status: 400 }
    )
  }

  // Validate UUID format
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: 'Invalid question ID format' },
      { status: 400 }
    )
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

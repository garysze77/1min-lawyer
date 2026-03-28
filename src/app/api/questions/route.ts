import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, subcategory, question_text } = body

    if (!category || !subcategory || !question_text) {
      return NextResponse.json(
        { error: 'Missing required fields: category, subcategory, question_text' },
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

    if (!aiResponse.ok) {
      console.error('AI analysis failed:', await aiResponse.text())
      // Still return the question ID, AI response will be null
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

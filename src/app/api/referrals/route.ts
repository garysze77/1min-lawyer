import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Input validation constants
const MAX_NAME_LENGTH = 100
const MAX_CONTACT_LENGTH = 100
const MAX_PREFERRED_LAWYER_LENGTH = 200

function isValidEmail(contact: string): boolean {
  return contact.includes('@') && contact.includes('.') && contact.indexOf('@') < contact.indexOf('.')
}

function isValidPhone(contact: string): boolean {
  // Phone: starts with + OR is 8+ digits
  if (contact.startsWith('+')) return contact.replace(/[^0-9]/g, '').length >= 8
  return /^\d{8,}$/.test(contact.replace(/[\s\-()]/g, ''))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question_id, name, contact, preferred_lawyer } = body

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

    // Validate preferred_lawyer length if provided
    if (preferred_lawyer !== undefined && preferred_lawyer !== null) {
      if (typeof preferred_lawyer !== 'string' || preferred_lawyer.length > MAX_PREFERRED_LAWYER_LENGTH) {
        return NextResponse.json(
          { error: `Preferred lawyer must be at most ${MAX_PREFERRED_LAWYER_LENGTH} characters` },
          { status: 400 }
        )
      }
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from('referrals')
      .insert({
        question_id: question_id || null,
        name: name.trim(),
        contact: trimmedContact,
        preferred_lawyer: preferred_lawyer?.trim() || null,
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

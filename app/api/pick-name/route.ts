import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for server-side operations to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { ticketNumber } = await request.json();

    if (!ticketNumber || ticketNumber < 1 || ticketNumber > 20) {
      return NextResponse.json(
        { error: 'Invalid ticket number' },
        { status: 400 }
      );
    }

    // Check if this ticket is already taken
    const { data: existingTicket } = await supabase
      .from('participants')
      .select('*')
      .eq('ticket_number', ticketNumber)
      .single();

    if (existingTicket) {
      return NextResponse.json(
        { error: 'This ticket has already been used!' },
        { status: 409 }
      );
    }

    // Get a random available name
    const { data: availableNames, error: fetchError } = await supabase
      .from('participants')
      .select('*')
      .eq('is_taken', false);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch available names' },
        { status: 500 }
      );
    }

    if (!availableNames || availableNames.length === 0) {
      return NextResponse.json(
        { error: 'No names left to pick!' },
        { status: 404 }
      );
    }

    // Pick a random name from available ones
    const randomIndex = Math.floor(Math.random() * availableNames.length);
    const selectedPerson = availableNames[randomIndex];

    // Update the record to mark it as taken and assign ticket number
    const { error: updateError } = await supabase
      .from('participants')
      .update({
        is_taken: true,
        ticket_number: ticketNumber
      })
      .eq('id', selectedPerson.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to claim name. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      name: selectedPerson.name,
      ticketNumber
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

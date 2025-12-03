import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get all participants to see which ticket numbers are taken
    const { data: participants, error } = await supabase
      .from('participants')
      .select('ticket_number')
      .not('ticket_number', 'is', null);

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tickets' },
        { status: 500 }
      );
    }

    // Create array of taken ticket numbers
    const takenTickets = participants?.map(p => p.ticket_number) || [];

    return NextResponse.json({ takenTickets });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

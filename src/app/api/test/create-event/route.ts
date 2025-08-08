import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Creating test calendar event...');
    
    // Get the user's access token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.accessToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'No access token found' 
      }, { status: 401 });
    }

    // Read optional payload
    const body = await request.json().catch(() => ({} as any));
    const summary: string = body?.summary || 'Test Event - Cron Job Test';
    const minutesAhead: number = Number.isFinite(body?.minutesAhead) ? Number(body.minutesAhead) : 3;
    const durationMinutes: number = Number.isFinite(body?.durationMinutes) ? Number(body.durationMinutes) : 30;

    // Create an event minutesAhead from now
    const now = new Date();
    const eventTime = new Date(now.getTime() + Math.max(0, minutesAhead) * 60 * 1000);
    
    const event = {
      summary,
      description: 'This is a test event to test the cron job functionality',
      start: {
        dateTime: eventTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(eventTime.getTime() + Math.max(1, durationMinutes) * 60 * 1000).toISOString(),
        timeZone: 'UTC',
      },
    };

    // Create the event in Google Calendar
    const response = await axios.post(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      event,
      {
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Test event created: ${response.data.summary} at ${eventTime.toISOString()}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Test event created successfully',
      event: {
        id: response.data.id,
        summary: response.data.summary,
        startTime: response.data.start.dateTime,
        endTime: response.data.end.dateTime
      },
      note: `The cron job should detect this event within ${minutesAhead} minutes and make a call`
    });
  } catch (error) {
    console.error('Create test event error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create test event' 
    }, { status: 500 });
  }
} 
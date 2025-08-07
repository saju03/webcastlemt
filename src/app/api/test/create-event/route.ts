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

    // Create an event 3 minutes from now
    const now = new Date();
    const eventTime = new Date(now.getTime() + 3 * 60 * 1000); // 3 minutes from now
    
    const event = {
      summary: 'Test Event - Cron Job Test',
      description: 'This is a test event to test the cron job functionality',
      start: {
        dateTime: eventTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(eventTime.getTime() + 30 * 60 * 1000).toISOString(), // 30 minutes duration
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
      note: 'The cron job should detect this event within 3 minutes and make a call'
    });
  } catch (error) {
    console.error('Create test event error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create test event' 
    }, { status: 500 });
  }
} 
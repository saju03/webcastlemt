import { NextRequest, NextResponse } from 'next/server';
import { twilioService } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing Twilio connection...');
    
    // Test the connection first
    const connectionTest = await twilioService.testConnection();
    
    if (!connectionTest) {
      return NextResponse.json({ 
        success: false, 
        error: 'Twilio connection failed' 
      }, { status: 500 });
    }

    // Test a call to your number
    const testCall = await twilioService.makeReminderCall(
      '+918075488869', // Your test number
      {
        eventName: 'Test Event',
        eventTime: new Date(),
        userName: 'Test User'
      }
    );

    if (testCall) {
      return NextResponse.json({ 
        success: true, 
        message: 'Twilio Studio flow test call initiated successfully'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to initiate test call' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Twilio test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Twilio test failed' 
    }, { status: 500 });
  }
} 
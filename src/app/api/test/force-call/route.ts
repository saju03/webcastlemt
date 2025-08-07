import { NextRequest, NextResponse } from 'next/server';
import { twilioService } from '@/lib/twilio';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Force call test triggered');
    
    // Get the first user with a phone number
    const user = await prisma.user.findFirst({
      where: {
        phone: { not: null },
        accessToken: { not: null }
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
      }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'No user found with phone number and access token'
      });
    }

    console.log(`📞 Force calling ${user.name} at ${user.phone}`);

    // Force a call without checking calendar events
    const callSuccess = await twilioService.makeReminderCall(
      user.phone!,
      {
        eventName: 'Test Event (Forced Call)',
        eventTime: new Date(),
        userName: user.name || 'there'
      }
    );

    if (callSuccess) {
      return NextResponse.json({ 
        success: true, 
        message: 'Force call initiated successfully',
        user: {
          name: user.name,
          phone: user.phone,
          email: user.email
        }
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to initiate force call'
      });
    }
  } catch (error) {
    console.error('Force call test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Force call test failed' 
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { twilioService } from '@/lib/twilio';
import { prisma } from '@/lib/prisma';
import { FULL_E164_REGEX } from '@/lib/phone';

export async function POST(request: NextRequest) {
  try {
    console.log('Force call test triggered');
    const cfg = twilioService.getConfigStatus();
    console.log('Twilio config:', cfg);
    if (!cfg.hasAccountSid || !cfg.hasAuthToken || !cfg.hasFromNumber || !cfg.hasStudioFlowSid) {
      return NextResponse.json({
        success: false,
        error: 'Twilio is not fully configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, TWILIO_STUDIO_FLOW_SID',
        config: cfg,
      }, { status: 500 });
    }

    // Optional: allow direct target via body
    let targetPhone: string | null = null;
    let targetUserName: string = 'there';
    try {
      const body = await request.json().catch(() => ({}));
      if (body?.phone && typeof body.phone === 'string') {
        if (!FULL_E164_REGEX.test(body.phone)) {
          return NextResponse.json({ success: false, error: 'Invalid phone format. Use E.164 like +14155552671' }, { status: 400 });
        }
        targetPhone = body.phone;
        targetUserName = body?.userName || targetUserName;
      } else if (body?.email && typeof body.email === 'string') {
        const u = await prisma.user.findUnique({
          where: { email: body.email },
          select: { name: true, phone: true },
        });
        if (u?.phone) {
          targetPhone = u.phone;
          targetUserName = u.name || targetUserName;
        }
      }
    } catch {}

    // Fallback: first user with a phone number
    if (!targetPhone) {
      const user = await prisma.user.findFirst({
        where: { phone: { not: null } },
        select: { id: true, email: true, name: true, phone: true },
      });
      if (!user || !user.phone) {
        return NextResponse.json({ success: false, error: 'No user found with a saved phone number' }, { status: 404 });
      }
      targetPhone = user.phone;
      targetUserName = user.name || targetUserName;
    }

    console.log(`Force calling ${targetUserName} at ${targetPhone}`);

    // Force a call without checking calendar events
    const callSuccess = await twilioService.makeReminderCall(
      targetPhone!,
      {
        eventName: 'Test Event (Forced Call)',
        eventTime: new Date(),
        userName: targetUserName
      }
    );

    if (callSuccess) {
      return NextResponse.json({ 
        success: true, 
        message: 'Force call initiated successfully',
        target: {
          phone: targetPhone,
          userName: targetUserName,
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
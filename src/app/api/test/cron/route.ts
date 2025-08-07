import { NextRequest, NextResponse } from 'next/server';
import { triggerReminderCheck } from '@/lib/cron';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Manual cron test triggered');
    
    // First, let's check what users we have
    const users = await prisma.user.findMany({
      where: {
        phone: { not: null },
        accessToken: { not: null }
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        accessToken: true,
      }
    });

    console.log(`👥 Found ${users.length} users with phone numbers and access tokens`);
    
    if (users.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No users found with phone numbers and access tokens',
        users: []
      });
    }

    // Show user details
    const userDetails = users.map(user => ({
      email: user.email,
      name: user.name,
      phone: user.phone,
      hasAccessToken: !!user.accessToken
    }));

    // Trigger the reminder check manually
    await triggerReminderCheck();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cron job test completed - check console for detailed logs',
      users: userDetails,
      note: 'If no calls were made, check if you have Google Calendar events within the next 5 minutes'
    });
  } catch (error) {
    console.error('Cron test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Cron test failed' 
    }, { status: 500 });
  }
} 
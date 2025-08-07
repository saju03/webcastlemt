import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Create or update user with phone number
    const user = await prisma.user.upsert({
      where: { email: token.email as string },
      update: { 
        phone,
        name: token.name as string,
        updatedAt: new Date()
      },
      create: {
        email: token.email as string,
        name: token.name as string,
        phone,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Phone number saved successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
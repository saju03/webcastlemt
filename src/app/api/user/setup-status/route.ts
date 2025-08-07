import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists and has phone number
    const user = await prisma.user.findUnique({
      where: { email: token.email as string },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
      }
    });

    return NextResponse.json({ 
      hasPhone: !!user?.phone,
      user: user || null
    });

  } catch (error) {
    console.error('Setup status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
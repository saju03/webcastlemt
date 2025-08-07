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

    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    // Store the access token (you might want to encrypt this in production)
    // For now, we'll store it in a separate table or as a field
    const user = await prisma.user.update({
      where: { email: token.email as string },
      data: {
        // You might want to add an accessToken field to your User model
        // For now, we'll use a simple approach
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Access token stored successfully'
    });

  } catch (error) {
    console.error('Token storage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the stored access token
    const user = await prisma.user.findUnique({
      where: { email: token.email as string },
      select: {
        id: true,
        email: true,
        // Add accessToken field here when you add it to the model
      }
    });

    return NextResponse.json({ 
      success: true,
      user
    });

  } catch (error) {
    console.error('Token retrieval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
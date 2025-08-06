import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Create a separate axios instance for external API calls (Google Calendar)
const googleApiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for Google API calls
googleApiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Google API Response: ${response.status}`, {
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ Google API Error:`, {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
    }
    return Promise.reject(error);
  }
);

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    console.log('Token:', token); // Debug log

    if (!token || !token.accessToken) {
      console.log('No token or access token found');
      return NextResponse.json({ error: 'Unauthorized - No valid token' }, { status: 401 });
    }

    const calendarRes = await googleApiClient.get(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        params: {
          maxResults: 10,
          orderBy: 'startTime',
          singleEvents: true,
          timeMin: new Date().toISOString(),
        },
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
        },
      }
    );

    return NextResponse.json(calendarRes.data);
  } catch (error) {
    console.error('API route error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data || error.message;
      console.error('Google Calendar API error:', error.response?.status, errorMessage);
      return NextResponse.json({ 
        error: 'Failed to fetch calendar events', 
        details: errorMessage 
      }, { status: error.response?.status || 500 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
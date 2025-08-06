"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { api } from "@/lib/axios";

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("Home component rendered - Status:", status, "Session:", session);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchCalendarEvents = async () => {
    console.log("fetchCalendarEvents called - Session:", session);
    
    if (!session) {
      console.log("No session, skipping calendar fetch");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching calendar events...");
      const response = await api.getCalendarEvents();
      
      console.log("Calendar events response:", response.data);
      
      if (response.data.items && Array.isArray(response.data.items)) {
        setEvents(response.data.items);
        console.log("Events set:", response.data.items.length, "events");
      } else {
        console.log("No events found in response:", response.data);
        setEvents([]);
      }
    } catch (error: any) {
      console.error("Error fetching calendar events:", error);
      
      // The interceptor already logs detailed error info
      if (error.response?.data?.error) {
        setError(`API Error: ${error.response.status} - ${error.response.data.error}`);
      } else if (error.message) {
        setError(`Error: ${error.message}`);
      } else {
        setError("Failed to fetch calendar events");
      }
    } finally {
      setLoading(false);
    }
  };

  const testSession = async () => {
    try {
      console.log("Testing session...");
      const response = await api.getSession();
      console.log("Session test response:", response.data);
    } catch (error) {
      console.error("Session test error:", error);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered - Session:", session, "Status:", status);
    if (session) {
      console.log("Session exists, calling fetchCalendarEvents");
      fetchCalendarEvents();
    } else {
      console.log("No session in useEffect");
    }
  }, [session, status]);

  console.log("Rendering with status:", status, "session:", session, "events:", events.length);

  // Show loading while checking authentication
  if (status === "loading") {
    console.log("Showing loading state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show redirecting message
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  console.log("Rendering main content with session:", session?.user?.name);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Calendar Events</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session?.user?.name}</span>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Panel */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Session Status: {status}</p>
          <p>User: {session?.user?.name} ({session?.user?.email})</p>
          <p>Has Access Token: {(session as any).accessToken ? 'Yes' : 'No'}</p>
          <div className="mt-2 space-x-2">
            <button 
              onClick={testSession}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
            >
              Test Session
            </button>
            <button 
              onClick={fetchCalendarEvents}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              Test Calendar API
            </button>
          </div>
        </div>
        
        {/* Events Section */}
        <div className="bg-white rounded-lg shadow p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading events...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {!loading && !error && events.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No events found. You might not have any upcoming events in your calendar.</p>
            </div>
          )}
          
          {events.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Events ({events.length})</h2>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg">{event.summary}</h3>
                    <p className="text-gray-600">
                      {event.start.dateTime 
                        ? new Date(event.start.dateTime).toLocaleString()
                        : event.start.date
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button 
            onClick={fetchCalendarEvents}
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Refresh Events
          </button>
        </div>
      </main>
    </div>
  );
}

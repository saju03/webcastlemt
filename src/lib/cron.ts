import cron from 'node-cron';
import { prisma } from './prisma';
import { twilioService } from './twilio';
import axios from 'axios';

// Track recent calls to prevent duplicates
const recentCalls = new Map<string, number>();

// Function to get user's access token from database
async function getUserAccessToken(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accessToken: true }
    });
    
    return user?.accessToken || null;
  } catch (error) {
    console.error('Error getting user access token:', error);
    return null;
  }
}

// Function to fetch upcoming events from Google Calendar
async function fetchUpcomingEvents(accessToken: string, minutesAhead: number = 5) {
  try {
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + minutesAhead * 60 * 1000).toISOString();

    console.log(`📅 Fetching events from ${timeMin} to ${timeMax}`);

    const response = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        params: {
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 10,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const events = response.data.items || [];
    console.log(`📅 Found ${events.length} upcoming events`);
    
    return events;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    }
    return [];
  }
}

// Function to check if we should make a call (prevent duplicates)
function shouldMakeCall(phoneNumber: string, eventId: string): boolean {
  const now = Date.now();
  const key = `${phoneNumber}-${eventId}`;
  const lastCallTime = recentCalls.get(key);
  
  // If we called this number for this event in the last 10 minutes, skip
  if (lastCallTime && (now - lastCallTime) < 10 * 60 * 1000) {
    console.log(`⏰ Skipping call to ${phoneNumber} for event ${eventId} - called recently`);
    return false;
  }
  
  // Update the call time
  recentCalls.set(key, now);
  
  // Clean up old entries (older than 1 hour)
  for (const [key, time] of recentCalls.entries()) {
    if (now - time > 60 * 60 * 1000) {
      recentCalls.delete(key);
    }
  }
  
  return true;
}

// Function to check for upcoming events and send reminders
async function checkAndSendReminders() {
  const timestamp = new Date().toISOString();
  console.log(`🕐 [${timestamp}] Running reminder check...`);
  
  try {
    // Get all users with phone numbers and access tokens
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
      console.log('⚠️ No users found with phone numbers and access tokens');
      return;
    }

    for (const user of users) {
      try {
        console.log(`🔍 Processing user: ${user.email} (${user.name})`);
        
        if (!user.accessToken) {
          console.log(`⚠️ No access token for user ${user.email}`);
          continue;
        }

        if (!user.phone) {
          console.log(`⚠️ No phone number for user ${user.email}`);
          continue;
        }

        // Fetch upcoming events
        const events = await fetchUpcomingEvents(user.accessToken, 5); // 5 minutes ahead

        console.log(`📅 User ${user.email} has ${events.length} upcoming events`);

        for (const event of events) {
          const eventTime = new Date(event.start.dateTime || event.start.date);
          const now = new Date();
          
          // Check if event is within the next 5 minutes
          const timeDiff = eventTime.getTime() - now.getTime();
          const minutesDiff = timeDiff / (1000 * 60);
          
          console.log(`📅 Event: "${event.summary}" at ${eventTime.toISOString()}, ${minutesDiff.toFixed(1)} minutes from now`);
          
          if (minutesDiff >= 0 && minutesDiff <= 5) {
            console.log(`⏰ Event "${event.summary}" is within 5 minutes!`);
            
            // Check if we should make a call (prevent duplicates)
            if (!shouldMakeCall(user.phone!, event.id)) {
              continue;
            }
            
            // Check if we've already called for this event in the database
            const existingLog = await prisma.eventLog.findFirst({
              where: {
                userId: user.id,
                eventId: event.id,
                called: true,
              }
            });

            if (!existingLog) {
              console.log(`📞 Sending reminder for event: "${event.summary}" to ${user.name} at ${user.phone}`);
              
              // Add a small delay to prevent rapid successive calls
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Send phone call reminder
              const callSuccess = await twilioService.makeReminderCall(
                user.phone!,
                {
                  eventName: event.summary,
                  eventTime: eventTime,
                  userName: user.name || 'there'
                }
              );

              // Log the reminder attempt
              await prisma.eventLog.create({
                data: {
                  userId: user.id,
                  eventId: event.id,
                  eventName: event.summary,
                  eventTime: eventTime,
                  called: callSuccess,
                  callTime: callSuccess ? new Date() : null,
                }
              });

              if (callSuccess) {
                console.log(`✅ Reminder call sent to ${user.name} for event: "${event.summary}"`);
              } else {
                console.log(`❌ Failed to send reminder call to ${user.name} for event: "${event.summary}"`);
              }
            } else {
              console.log(`⚠️ Already sent reminder for event: "${event.summary}" to ${user.name}`);
            }
          } else {
            console.log(`⏰ Event "${event.summary}" is not within 5 minutes (${minutesDiff.toFixed(1)} minutes away)`);
          }
        }
        
        // Add delay between processing different users
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error processing user ${user.email}:`, error);
      }
    }
    
    console.log(`✅ Reminder check completed at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('❌ Error in reminder check:', error);
  }
}

// Start the cron job
export function startReminderCron() {
  console.log('⏰ Starting reminder cron job...');
  
  // Run every minute
  const task = cron.schedule('* * * * *', checkAndSendReminders, {
    timezone: "UTC"
  });

  console.log('⏰ Reminder cron job started - checking every minute');
  
  // Run an initial check immediately
  console.log('🚀 Running initial reminder check...');
  checkAndSendReminders();
  
  return task;
}

// Manual trigger for testing
export async function triggerReminderCheck() {
  console.log('🧪 Manual reminder check triggered');
  await checkAndSendReminders();
} 
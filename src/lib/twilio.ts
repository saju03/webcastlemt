/* eslint-disable @typescript-eslint/no-explicit-any */
import twilio from 'twilio';

// Twilio configuration with user's specific details
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN; // Keep auth token in environment for security
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const studioFlowSid = process.env.TWILIO_STUDIO_FLOW_SID;

if (!authToken) {
  console.error('Missing Twilio Auth Token. Please set TWILIO_AUTH_TOKEN environment variable.');
}

const client = twilio(accountSid, authToken);

export interface EventReminder {
  eventName: string;
  eventTime: Date;
  userName: string;
}

export const twilioService = {
  // Make a phone call using Twilio Studio flow
  async makeReminderCall(toNumber: string, reminder: EventReminder): Promise<boolean> {
    try {
      if (!authToken) {
        throw new Error('Twilio not configured - missing auth token');
      }

      console.log(`Initiating Studio flow call to ${toNumber} for event: ${reminder.eventName}`);

      // Use Twilio Studio flow for the call
      if (!studioFlowSid) {
        throw new Error('Twilio not configured - missing Studio Flow SID');
      }
      if (!fromNumber) {
        throw new Error('Twilio not configured - missing phone number');
      }
      const execution = await client.studio.v2.flows(studioFlowSid)
        .executions
        .create({
          to: toNumber,
          from: fromNumber,
          // You can pass parameters to your Studio flow if needed
          parameters: {
            eventName: reminder.eventName,
            eventTime: reminder.eventTime.toLocaleString(),
            userName: reminder.userName
          }
        });

      console.log(`Twilio initiated: ${execution.sid} to ${toNumber}`);
      return true;
    } catch (error: any) {
      // Handle the specific error for already active execution
      if (error.message && error.message.includes('already active for this contact')) {
        console.log(`⚠️ Skipping call to ${toNumber} - already has an active execution`);
        return true; // Return true to prevent retry attempts
      }
      
      // Handle other Twilio errors
      if (error.code === 20404) {
        console.log(`⚠️ Skipping call to ${toNumber} - flow not found or inactive`);
        return false;
      }
      
      if (error.code === 21211) {
        console.log(`⚠️ Skipping call to ${toNumber} - invalid phone number`);
        return false;
      }
      
      console.error(' Twilio Studio flow call failed:', error);
      return false;
    }
  },

  // Test function to verify Twilio configuration
  async testConnection(): Promise<boolean> {
    try {
      if (!authToken) {
        throw new Error('Twilio not configured - missing auth token');
      }

      if (!accountSid) {
        throw new Error('Twilio not configured - missing account SID');
      }
      // Test the connection by getting account info
      const account = await client.api.accounts(accountSid).fetch();
      console.log(`✅ Twilio connection successful - Account: ${account.friendlyName}`);
      return true;
    } catch (error) {
      console.error('❌ Twilio connection test failed:', error);
      return false;
    }
  },

  // Function to check if there's an active execution for a contact
  async checkActiveExecution(toNumber: string): Promise<boolean> {
    try {
      if (!authToken) {
        return false;
      }

      if (!studioFlowSid) {
        throw new Error('Twilio not configured - missing Studio Flow SID');
      }

      // List recent executions for the flow
      const executions = await client.studio.v2.flows(studioFlowSid as string)
        .executions
        .list({ limit: 20 });
      const activeExecution = executions.find(execution => 
        execution.contactChannelAddress === toNumber && 
        execution.status === 'active'
      );

      return !!activeExecution;
    } catch (error) {
      console.error('Error checking active execution:', error);
      return false;
    }
  }
}; 
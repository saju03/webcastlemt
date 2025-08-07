# WebCastle MT

A Next.js application for managing calendar events with automated phone call reminders using Twilio integration.

## 🚀 Features

- **Google Calendar Integration** - Sync and manage calendar events
- **Automated Phone Calls** - Send reminders via Twilio
- **User Authentication** - Google OAuth integration with NextAuth
- **Database Management** - PostgreSQL with Prisma ORM
- **Cron Jobs** - Automated event processing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd webcastlemt
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Twilio Configuration
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="your-twilio-phone-number"
TWILIO_STUDIO_FLOW_SID="your-twilio-studio-flow-sid"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 4. Database Setup

#### Option A: Using Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string from your dashboard
4. Replace the `DATABASE_URL` in your `.env` file with the Neon connection string

#### Option B: Using Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database
3. Update the `DATABASE_URL` in your `.env` file

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Push Database Schema

```bash
npx prisma db push
```

### 7. Set Up External Services

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
6. Copy the Client ID and Client Secret to your `.env` file

#### Twilio Setup

1. Sign up for a [Twilio account](https://www.twilio.com/)
2. Get your Account SID and Auth Token from the Twilio Console
3. Purchase a phone number for sending calls
4. (Optional) Set up a Studio Flow for call handling
5. Add the credentials to your `.env` file

### 8. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📁 Project Structure

```
webcastlemt/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   ├── login/            # Login page
│   │   ├── setup/            # User setup page
│   │   └── page.tsx          # Home page
│   └── lib/                  # Utility libraries
│       ├── prisma.ts         # Prisma client
│       ├── twilio.ts         # Twilio integration
│       ├── axios.ts          # HTTP client
│       └── cron.ts           # Cron job utilities
├── public/                   # Static assets
└── package.json              # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🗄️ Database Models

### User
- `id` - Unique identifier
- `email` - User email (unique)
- `name` - User name
- `phone` - Phone number
- `accessToken` - Google OAuth access token
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### EventLog
- `id` - Unique identifier
- `userId` - Reference to User
- `eventId` - Google Calendar event ID
- `eventName` - Event name
- `eventTime` - Event timestamp
- `called` - Whether reminder call was made
- `callTime` - When call was made
- `createdAt` - Record creation timestamp
- `updatedAt` - Last update timestamp

## 🔐 Authentication

The application uses NextAuth.js with Google OAuth for authentication. Users can:
- Sign in with their Google account
- Grant calendar access permissions
- Manage their profile and settings

## 📞 Twilio Integration

The application integrates with Twilio to:
- Make automated phone calls for event reminders
- Handle call responses and interactions
- Track call status and outcomes

## 🕐 Cron Jobs

Automated tasks run periodically to:
- Check for upcoming events
- Trigger reminder calls
- Update event status

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Prisma Client not generated**
   ```bash
   npx prisma generate
   ```

2. **Database connection issues**
   - Check your `DATABASE_URL` in `.env`
   - Ensure your database is running
   - Verify network connectivity

3. **Google OAuth errors**
   - Verify redirect URIs in Google Cloud Console
   - Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

4. **Twilio integration issues**
   - Verify Twilio credentials
   - Check phone number format
   - Ensure sufficient Twilio credits

### Getting Help

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the logs in your terminal
3. Check the browser console for errors
4. Verify all environment variables are set correctly

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

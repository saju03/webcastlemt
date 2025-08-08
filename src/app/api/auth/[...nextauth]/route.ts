/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
          // Request offline access to enable long-lived refresh tokens if needed later
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      return session;
    },
    async signIn({ user, account }) {
      if (account?.access_token) {
        // Store the access token in the database
        try {
          await prisma.user.upsert({
            where: { email: user.email! },
            update: { 
              accessToken: account.access_token,
              name: user.name,
              updatedAt: new Date()
            },
            create: {
              email: user.email!,
              name: user.name,
              accessToken: account.access_token,
            },
          });
        } catch (error) {
          console.error('Error storing access token:', error);
        }
      }
      return true;
    },
  },
});

export const { GET, POST } = handlers; 
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "./mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Create a JWT secret for signing tokens
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          await connectDB();
          
          const user = await User.findOne({ email: credentials.email.toLowerCase().trim() });
          
          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.password) {
            throw new Error("Please use Google sign-in for this account");
          }

          // Check if email is verified (for email/password users)
          if (user.email && !user.emailVerified) {
            throw new Error("Please verify your email first");
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isCorrectPassword) {
            throw new Error("Incorrect password");
          }

          // Create JWT token
          const token = jwt.sign(
            { 
              userId: user._id.toString(),
              email: user.email,
              name: user.name 
            },
            JWT_SECRET,
            { expiresIn: "7d" }
          );

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            accessToken: token, // Add the JWT token here
          };
        } catch (error: any) {
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.accessToken = (user as any).accessToken;
      }
      
      // For Google OAuth users
      if (account?.provider === "google" && user) {
        try {
          await connectDB();
          
          // Find or create user
          let dbUser = await User.findOne({ email: user.email });
          
          if (!dbUser) {
            dbUser = new User({
              email: user.email,
              name: user.name,
              image: user.image,
              emailVerified: true,
            });
            await dbUser.save();
          }
          
          // Create JWT token for Google users too
          const jwtToken = jwt.sign(
            { 
              userId: dbUser._id.toString(),
              email: dbUser.email,
              name: dbUser.name 
            },
            JWT_SECRET,
            { expiresIn: "7d" }
          );
          
          token.id = dbUser._id.toString();
          token.accessToken = jwtToken;
        } catch (error) {
          console.error("Error updating Google user:", error);
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.accessToken = token.accessToken as string; // Add token to session
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
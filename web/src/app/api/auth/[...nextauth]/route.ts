import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        await connectDB();

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email first");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || "user",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        // Generate JWT token for API
        const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET!;
        
        const apiToken = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role || "user",
          },
          jwtSecret,
          { expiresIn: "30d" }
        );
        
        // Store in token
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role || "user";
        token.accessToken = apiToken;
      }
      
      return token;
    },

    async session({ session, token }) {
      // Type-safe assignment
      if (session.user) {
        session.user = {
          ...session.user,
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as string,
        };
        
        session.accessToken = token.accessToken as string;
      }
      
      return session;
    },
  },
});

export { handler as GET, handler as POST };
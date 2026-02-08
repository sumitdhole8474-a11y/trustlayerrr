import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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

        // 🔑 IMPORTS MOVED INSIDE FUNCTION (VERY IMPORTANT)
        const { connectDB } = await import("@/lib/mongodb");
        const User = (await import("@/models/User")).default;
        const bcrypt = (await import("bcryptjs")).default;

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
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET as string,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const jwtLib = await import("jsonwebtoken");

        const jwtSecret =
          process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET!;

        const apiToken = jwtLib.sign(
          {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: (user as any).role || "user",
          },
          jwtSecret,
          { expiresIn: "30d" }
        );

        token.id = user.id;
        token.role = (user as any).role || "user";
        token.accessToken = apiToken;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };

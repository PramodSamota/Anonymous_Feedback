import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials", // Changed to standard capitalization
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Removed explicit typing for cleaner code
        await dbConnect();
        try {
          // More robust validation
          if (!credentials?.email?.trim() || !credentials?.password?.trim()) {
            throw new Error("Both email and password are required");
          }

          const user = await UserModel.findOne({
            $or: [
              { email: credentials.email.trim().toLowerCase() }, // Normalize email
              { username: credentials.email.trim() }, // Case-sensitive username
            ],
          }).select("+password"); // Ensure password field is included

          if (!user) {
            throw new Error("Invalid credentials");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your email before logging in");
          }

          const isPasswordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordMatch) {
            throw new Error("Invalid credentials"); // Generic message for security
          }

          // Clean user object for session
          return {
            id: user._id.toString(), // Must be 'id' (not '_id')
            _id: user._id.toString(), // Also include as _id if needed
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
          };
        } catch (error: any) {
          console.error("Authorization error:", error); // Log for debugging
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Use 'id' instead of '_id' for consistency
        token._id = user._id; // Optional, only if you need it
        token.username = user.username;
        token.email = user.email;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in?error=true", // Added error parameter
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days session
  },
  secret: process.env.NEXTAUTH_SECRET,
};

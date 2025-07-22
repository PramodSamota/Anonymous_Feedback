import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    _id?: string;
    isVerified?: string;
    username?: string;
  }

  interface Session {
    user: {
      id?: string;
      _id?: string;
      isVerified?: boolean;
      username?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
}

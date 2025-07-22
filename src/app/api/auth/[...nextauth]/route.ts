import NextAuth from "next-auth";
import { authOptions } from "./option";

const handler = NextAuth(authOptions);
console.log("handler in next auth", handler);

export { handler as GET, handler as POST };

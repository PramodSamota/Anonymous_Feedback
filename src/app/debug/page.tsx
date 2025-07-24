"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn, signOut } from "next-auth/react";

export default function DebugPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Dashboard Redirect</h1>

      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Session Status</h2>
          <p>
            <strong>Status:</strong> {status}
          </p>
          <p>
            <strong>Has Session:</strong> {session ? "Yes" : "No"}
          </p>
          {session && (
            <div className="mt-2">
              <p>
                <strong>User:</strong> {session.user?.username || "No username"}
              </p>
              <p>
                <strong>Email:</strong> {session.user?.email || "No email"}
              </p>
              <p>
                <strong>ID:</strong> {session.user?.id || "No ID"}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Navigation Tests</h2>
          <div className="space-x-2">
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button onClick={() => router.push("/sign-in")}>
              Go to Sign In
            </Button>
            <Button onClick={() => router.push("/")}>Go to Home</Button>
          </div>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Auth Actions</h2>
          <div className="space-x-2">
            {!session ? (
              <Button onClick={() => signIn()}>Sign In</Button>
            ) : (
              <Button onClick={() => signOut()}>Sign Out</Button>
            )}
          </div>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Current URL</h2>
          <p>
            {typeof window !== "undefined"
              ? window.location.href
              : "Loading..."}
          </p>
        </div>
      </div>
    </div>
  );
}

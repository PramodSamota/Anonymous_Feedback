"use client";

import { useSession } from "next-auth/react";

export default function DebugPage() {
  const { data: session, status } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      <div className="space-y-4">
        <div>
          <strong>Status:</strong> {status}
        </div>
        <div>
          <strong>Session:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
        <div>
          <strong>Environment:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
            NEXTAUTH_URL: {process.env.NEXTAUTH_URL || "Not set"}
          </pre>
        </div>
      </div>
    </div>
  );
}

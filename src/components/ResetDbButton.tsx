"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Trash2, Loader2, Mail } from "lucide-react";

export default function ResetDbButton() {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (
      !confirm(
        "WARNING: This will DELETE ALL DATA (Users, Firestore, Storage, Realtime DB). Are you sure?"
      )
    ) {
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Resetting database...");

    try {
      const response = await fetch("/api/test/reset-db", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset");
      }

      toast.success("Database reset successfully!", { id: toastId });
      
      // Optional: Redirect to home or refresh to clear local state
      setTimeout(() => {
          window.location.href = "/";
      }, 1000);

    } catch (error) {
      console.error("Reset failed:", error);
      toast.error(`Reset failed: ${(error as Error).message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Only show in development or if explicitly enabled? 
  // User requested "for testing purpose", usually implies dev/staging.
  // We'll leave it always visible as requested, but maybe add a safeguard in checking env if needed.
  // For now, render always.

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      <button
        onClick={async () => {
          const toastId = toast.loading("Sending OTP...");
          try {
            const res = await fetch('/api/auth/send-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: 'user_nutty_fans1@yopmail.com', uid: 'test-global-uid' })
            });
            if (!res.ok) throw new Error('Failed');
            toast.success('OTP sent to user_nutty_fans1@yopmail.com', { id: toastId });
          } catch {
            toast.error('Failed to send OTP', { id: toastId });
          }
        }}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg transition-colors font-medium border border-purple-500"
        title="Send Test OTP"
      >
        <Mail className="w-5 h-5" />
        <span className="hidden md:inline">Test OTP</span>
      </button>

      <button
        onClick={handleReset}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors font-medium border border-red-500"
        title="Delete All Data"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Trash2 className="w-5 h-5" />
        )}
        <span className="hidden md:inline">DELETE ALL</span>
      </button>
    </div>
  );
}

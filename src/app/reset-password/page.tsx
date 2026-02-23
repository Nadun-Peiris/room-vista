"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link"; // For navigation

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Success! Check your inbox for reset instructions.");
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : "Failed to send reset email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 overflow-hidden font-sans">
      {/* Consistent Background Accents */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-60" />

      <form
        onSubmit={handleReset}
        className="relative z-10 flex flex-col gap-6 w-full max-w-md p-10 
                   bg-white/80 border border-white/50 backdrop-blur-md 
                   rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Reset Password
          </h1>
          <p className="text-gray-600 text-sm font-medium">
            We&apos;ll send a recovery link to your email
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reset-email" className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-widest">
              Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="p-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 
                         focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              required
              aria-describedby={message ? "reset-form-message" : undefined}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3.5 rounded-xl 
                       transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>

          <p className="text-sm text-center text-gray-600 font-medium">
            Remembered your password?{" "}
            <Link 
              href="/login" 
              className="text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-sm transition-colors"
            >
              Back to Login
            </Link>
          </p>
        </div>

        {message && (
          <div
            id="reset-form-message"
            role={message.includes("Success") ? "status" : "alert"}
            aria-live={message.includes("Success") ? "polite" : "assertive"}
            className={`text-sm text-center p-3 rounded-xl border animate-in fade-in duration-300 ${
            message.includes("Success") 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-red-50 border-red-200 text-red-700"
          }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

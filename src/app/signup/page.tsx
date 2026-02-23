"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link"; // Import Link for navigation

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      const token = await user.getIdToken();

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Signup successful! Await admin approval.");
      } else {
        setMessage(data.error || "Signup failed");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Signup failed";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 overflow-hidden font-sans">
      {/* Matching Background Blobs from Login (Emerald & Blue) */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-60" />

      <form
        onSubmit={handleSignup}
        className="relative z-10 flex flex-col gap-6 w-full max-w-md p-10 
                   bg-white/80 border border-white/50 backdrop-blur-md 
                   rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Create Account
          </h1>
          <p className="text-gray-600 text-sm font-medium">Join our team of designers</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="signup-name" className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-widest">Full Name</label>
            <input
              id="signup-name"
              type="text"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="p-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 
                         focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              required
              aria-describedby={message ? "signup-form-message" : undefined}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="signup-email" className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-widest">Email Address</label>
            <input
              id="signup-email"
              type="email"
              placeholder="jane@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="p-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 
                         focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              required
              aria-describedby={message ? "signup-form-message" : undefined}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="signup-password" className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-widest">Password</label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full p-3 pr-11 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 
                         focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                required
                aria-describedby={message ? "signup-form-message" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-md"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 4l16 16" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.7 10.7a2 2 0 002.6 2.6" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.5 5.3A10.2 10.2 0 0112 5c4.7 0 8.7 2.9 10.3 7-0.6 1.4-1.5 2.7-2.7 3.8" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6.5 6.5A11.5 11.5 0 001.7 12C3.3 16.1 7.3 19 12 19c1.6 0 3.1-0.3 4.5-0.8" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3.5 rounded-xl 
                       transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Get Started"}
          </button>

          {/* Redirect to Login */}
          <p className="text-sm text-center text-gray-600 font-medium">
            Already have an account?{" "}
            <Link 
              href="/login" 
              className="text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-sm transition-colors"
            >
              Login
            </Link>
          </p>
        </div>

        {message && (
          <div
            id="signup-form-message"
            role={message.includes("successful") ? "status" : "alert"}
            aria-live={message.includes("successful") ? "polite" : "assertive"}
            className={`text-sm text-center p-3 rounded-xl border animate-in fade-in duration-300 ${
            message.includes("successful") 
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

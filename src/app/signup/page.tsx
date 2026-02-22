"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link"; // Import Link for navigation

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    } catch (error: any) {
      setMessage(error.message);
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
          <p className="text-gray-500 text-sm font-medium">Join our team of designers</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-widest">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 
                         focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              placeholder="jane@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 
                         focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-widest">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 
                         focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
              required
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
            {loading ? "Creating Account..." : "Get Started"}
          </button>

          {/* Redirect to Login */}
          <p className="text-sm text-center text-gray-600 font-medium">
            Already have an account?{" "}
            <Link 
              href="/login" 
              className="text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-4 transition-colors"
            >
              Login
            </Link>
          </p>
        </div>

        {message && (
          <div className={`text-sm text-center p-3 rounded-xl border animate-in fade-in duration-300 ${
            message.includes("successful") 
              ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
              : "bg-red-50 border-red-100 text-red-700"
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
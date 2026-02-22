"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 🔐 Firebase login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      if (!user) {
        throw new Error("Authentication failed.");
      }

      const token = await user.getIdToken();

      // 🔐 Validate with backend
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Login failed.");
        setLoading(false);
        return;
      }

      // ✅ Always redirect to single dashboard
      router.push("/dashboard");

    } catch (error: any) {
      setMessage(error.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 overflow-hidden font-sans">
      {/* Background accents */}
      <div className="absolute top-[-5%] left-[-5%] w-80 h-80 bg-emerald-100 rounded-full blur-[100px] opacity-60" />
      <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-blue-100 rounded-full blur-[100px] opacity-60" />

      <form
        onSubmit={handleLogin}
        className="relative z-10 flex flex-col gap-6 w-full max-w-md p-10 
                   bg-white/70 border border-white/40 backdrop-blur-md 
                   rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Please enter your details
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 
                       focus:outline-none focus:ring-4 focus:ring-emerald-500/10 
                       focus:border-emerald-500 transition-all shadow-sm"
            required
          />

          {/* Password */}
          <div className="flex flex-col gap-2">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 
                         focus:outline-none focus:ring-4 focus:ring-emerald-500/10 
                         focus:border-emerald-500 transition-all shadow-sm"
              required
            />

            <div className="flex justify-end px-1">
              <Link
                href="/reset-password"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3.5 rounded-xl 
                     transition-all shadow-lg shadow-emerald-500/20 
                     active:scale-[0.98] disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center text-gray-600 font-medium">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-4 transition-colors"
          >
            Create Account
          </Link>
        </p>

        {message && (
          <div className="text-xs text-center p-3 rounded-xl border bg-red-50 border-red-100 text-red-600">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

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

    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong.";
      setMessage(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center bg-gray-50 overflow-hidden font-sans px-4 py-16">
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
          <p className="text-gray-600 text-sm font-medium">
            Please enter your details
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Email */}
          <label
            htmlFor="login-email"
            className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-widest"
          >
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="p-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 
                       focus:outline-none focus:ring-4 focus:ring-emerald-500/20 
                       focus:border-emerald-500 transition-all shadow-sm"
            required
            aria-describedby={message ? "login-form-message" : undefined}
          />

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="login-password"
              className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-widest"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full p-3 pr-11 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 
                         focus:outline-none focus:ring-4 focus:ring-emerald-500/20 
                         focus:border-emerald-500 transition-all shadow-sm"
                required
                aria-describedby={message ? "login-form-message" : undefined}
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

            <div className="flex justify-end px-1">
              <Link
                href="/reset-password"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-sm transition-colors"
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
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-sm transition-colors"
          >
            Create Account
          </Link>
        </p>

        {message && (
          <div
            id="login-form-message"
            role="alert"
            aria-live="assertive"
            className="text-xs text-center p-3 rounded-xl border bg-red-50 border-red-200 text-red-700"
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

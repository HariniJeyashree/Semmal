"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/register", {
        email,
        password,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0604] text-[#F5EFE6]">
        <div className="text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-2xl font-bold text-green-400">Account Created!</h2>
          <p className="text-[#F5EFE6]/70">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0604] text-[#F5EFE6]">
      <div className="w-full max-w-md p-8 space-y-6 bg-[#5C141F] rounded-2xl shadow-xl">
        <div className="flex justify-center mb-6">
          <Image src="/Semmal_Logo_Final.png" alt="Semmal Logo" width={180} height={197} className="object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-center text-[#D9A646]">
          Create Account
        </h1>
        {error && <div className="p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 bg-[#120807] border border-[#5C141F] rounded-lg focus:ring-2 focus:ring-[#D9A646] focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 bg-[#120807] border border-[#5C141F] rounded-lg focus:ring-2 focus:ring-[#D9A646] focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 bg-[#120807] border border-[#5C141F] rounded-lg focus:ring-2 focus:ring-[#D9A646] focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-[#D9A646] hover:bg-[#F6D88A] text-[#3A0A11] rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p className="text-center text-sm text-[#F5EFE6]/70">
          Already have an account?{" "}
          <Link href="/login" className="text-[#D9A646] hover:text-[#F6D88A]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

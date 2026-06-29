"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Use URLSearchParams for application/x-www-form-urlencoded expected by OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const loginRes = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const token = loginRes.data.access_token;
      
      // Fetch user data
      const userRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      login(token, userRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0604] text-[#F5EFE6]">
      <div className="w-full max-w-md p-8 space-y-6 bg-[#5C141F] rounded-2xl shadow-xl">
        <div className="flex justify-center mb-6">
          <Image src="/Semmal_Logo_Final.png" alt="Semmal Logo" width={180} height={197} className="object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-center text-[#D9A646]">
          Welcome Back
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
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-[#D9A646] hover:bg-[#F6D88A] text-[#3A0A11] rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-[#F5EFE6]/70">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#D9A646] hover:text-[#F6D88A]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

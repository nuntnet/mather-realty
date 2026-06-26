"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Home, Building2 } from "lucide-react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { SITE_NAME } from "@/lib/site";

type Role = "tenant" | "landlord";

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("tenant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.message ?? "Registration failed. Please try again.");
        return;
      }

      // Auto sign in after registration
      await signIn.email({ email, password });
      router.push("/en");
    } catch {
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F6F5] to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#0F1C1B] flex items-center justify-center mb-3 shadow-lg">
            <span className="font-cormorant font-medium text-3xl text-[#F7F4EF] leading-none">M</span>
          </div>
          <h1 className="font-cormorant font-medium uppercase tracking-[0.15em] text-3xl text-[#1A2624]">{SITE_NAME}</h1>
          <p className="text-sm text-gray-500 mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-5">
              {errorMsg}
            </div>
          )}

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">I am a...</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("tenant")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                  role === "tenant"
                    ? "border-[#1E6B69] bg-[#E8F6F5] text-[#1E6B69]"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <Home className="w-6 h-6" />
                <span className="text-sm font-semibold">Tenant</span>
                <span className="text-xs opacity-70">Looking to rent</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("landlord")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                  role === "landlord"
                    ? "border-[#1E6B69] bg-[#E8F6F5] text-[#1E6B69]"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <Building2 className="w-6 h-6" />
                <span className="text-sm font-semibold">Landlord</span>
                <span className="text-xs opacity-70">Listing a property</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-600 text-sm">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="mt-1.5"
                required
                autoComplete="name"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-600 text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-600 text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="mt-1.5"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirm" className="text-gray-600 text-sm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                className="mt-1.5"
                required
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E6B69] hover:bg-[#18605E] text-white font-semibold h-11 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1E6B69] hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

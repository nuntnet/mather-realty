"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(
    error === "unauthorized" ? "คุณไม่มีสิทธิ์เข้าถึง Admin Panel" : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await signIn.email({ email, password });
      if (res.error) {
        setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }
      router.push(callbackUrl);
    } catch {
      setErrorMsg("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 mb-4">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M18 2L4 8V18C4 25.73 10.24 32.98 18 35C25.76 32.98 32 25.73 32 18V8L18 2Z" fill="url(#lg)" />
              <path d="M18 7L8 11.5V18C8 23.4 12.48 28.52 18 30.5C23.52 28.52 28 23.4 28 18V11.5L18 7Z" fill="#2E5EA8" opacity="0.5" />
              <text x="18" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="serif">ช</text>
              <defs>
                <linearGradient id="lg" x1="18" y1="2" x2="18" y2="35" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2563EB" /><stop offset="1" stopColor="#1B3A6B" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#131F3C]">CH.ERAWAN Admin</h1>
          <p className="text-sm text-gray-500 mt-1">เข้าสู่ระบบเพื่อจัดการเว็บไซต์</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-5">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-gray-600 text-sm">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@ch-erawan.com"
                className="mt-1.5"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-600 text-sm">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5"
                required
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#131F3C] hover:bg-[#1a2a50] text-white font-semibold h-11"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  เข้าสู่ระบบ
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#131F3C] border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

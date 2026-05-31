"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { role, login } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (role) {
    return <>{children}</>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    const result = await login(code.trim());
    if (!result.ok) {
      setError(result.error || "邀请码无效");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">群精华板</h1>
          <p className="text-sm text-gray-400 mt-1">输入邀请码进入</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="请输入邀请码"
            className="w-full border border-gray-200 rounded-lg p-3 text-center text-lg tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!code.trim() || loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-40"
          >
            {loading ? "验证中..." : "进入"}
          </button>
        </form>
      </div>
    </div>
  );
}

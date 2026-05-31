"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthState {
  role: "admin" | "member" | null;
  code: string;
  login: (code: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  role: null,
  code: "",
  login: async () => ({ ok: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<"admin" | "member" | null>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("gh_code");
    const savedRole = localStorage.getItem("gh_role") as "admin" | "member" | null;
    if (saved && savedRole) {
      setCode(saved);
      setRole(savedRole);
    }
  }, []);

  async function login(inputCode: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inputCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || "验证失败" };
      }
      setCode(inputCode);
      setRole(data.role);
      localStorage.setItem("gh_code", inputCode);
      localStorage.setItem("gh_role", data.role);
      return { ok: true };
    } catch {
      return { ok: false, error: "网络错误" };
    }
  }

  function logout() {
    setCode("");
    setRole(null);
    localStorage.removeItem("gh_code");
    localStorage.removeItem("gh_role");
  }

  return (
    <AuthContext.Provider value={{ role, code, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiBaseUrl } from "../../lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "collector" | "citizen">("citizen");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  function extractApiError(data: any, fallback: string) {
    if (!data) return fallback;
    if (typeof data.error === "string" && data.error.trim().length > 0) {
      const fieldErrors = data?.details?.fieldErrors;
      if (fieldErrors && typeof fieldErrors === "object") {
        const firstField = Object.keys(fieldErrors)[0];
        const firstMessage = Array.isArray(fieldErrors[firstField]) ? fieldErrors[firstField][0] : undefined;
        if (firstField && firstMessage) {
          return `${data.error}: ${firstField} - ${firstMessage}`;
        }
      }
      return data.error;
    }
    return fallback;
  }

  async function submitAuth(requestMode: "login" | "register") {
    setError("");
    setInfo("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (requestMode === "register") {
      if (!name || name.trim().length < 2) {
        setError("Full Name must be at least 2 characters.");
        return;
      }
    }

    try {
      const endpoint = requestMode === "login" ? "/api/v1/auth/login" : "/api/v1/auth/register";
      const body =
        requestMode === "login"
          ? { email: email.trim(), password }
          : {
              name: name.trim(),
              email: email.trim(),
              password,
              role
            };

      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(extractApiError(data, requestMode === "login" ? "Login failed" : "Account creation failed"));
        return;
      }

      localStorage.setItem("swms_token", data.token);
      setInfo(requestMode === "login" ? "Login successful." : "Account created successfully.");

      if (data?.user?.role === "collector") {
        router.push("/collector");
        return;
      }

      if (data?.user?.role === "citizen") {
        router.push("/citizen");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Unable to reach backend API. Ensure `npm run dev:api` is running.");
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await submitAuth(mode);
  }

  function handleModeAction(targetMode: "login" | "register") {
    if (mode !== targetMode) {
      setMode(targetMode);
      setError("");
      setInfo("");
      return;
    }

    submitAuth(targetMode).catch(() => undefined);
  }

  useEffect(() => {
    const token = localStorage.getItem("swms_token");
    if (!token) return;

    fetch(`${apiBaseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (response) => {
        if (!response.ok) {
          localStorage.removeItem("swms_token");
          return;
        }

        const data = await response.json().catch(() => ({}));
        const currentRole = data?.user?.role;

        if (currentRole === "collector") {
          router.push("/collector");
          return;
        }

        if (currentRole === "citizen") {
          router.push("/citizen");
          return;
        }

        router.push("/dashboard");
      })
      .catch(() => undefined);
  }, [router]);

  return (
    <main className="auth-main">
      <section className="auth-shell panel">
        <div className="auth-visual">
          <img
            src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=1200&q=80"
            alt="Urban recycling and clean city concept"
          />
        </div>
        <div className="auth-form-panel">
          <div className="top-bar">
            <h1>SWMS Access</h1>
          </div>

          <p>Use your real account credentials.</p>

          <form id="auth-form" onSubmit={onSubmit}>
            {mode === "register" && (
              <>
                <label>Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value as "admin" | "collector" | "citizen")}>
                  <option value="citizen">Citizen</option>
                  <option value="collector">Collector</option>
                  <option value="admin">Admin</option>
                </select>
              </>
            )}
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </form>

          <div style={{ marginTop: "auto", paddingTop: 14 }}>
            <div className="center-actions" style={{ marginTop: 10 }}>
              <button
                type="button"
                className={mode === "login" ? "" : "ghost"}
                onClick={() => handleModeAction("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={mode === "register" ? "" : "ghost"}
                onClick={() => handleModeAction("register")}
              >
                Create Account
              </button>
            </div>
            {info && <p style={{ textAlign: "center", color: "var(--accent)" }}>{info}</p>}
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}

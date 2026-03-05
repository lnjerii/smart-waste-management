"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiBaseUrl } from "../../lib/config";

type Stop = {
  binId: string;
  order: number;
  status: "pending" | "collected" | "skipped" | "damaged";
};

type Route = {
  _id: string;
  status: string;
  algorithm: string;
  stops: Stop[];
};

export default function CollectorPage() {
  const router = useRouter();
  const [route, setRoute] = useState<Route | null>(null);
  const [message, setMessage] = useState("");
  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("swms_token") : null), []);

  async function loadRoute() {
    if (!token) {
      router.push("/login");
      return;
    }

    const response = await fetch(`${apiBaseUrl}/api/v1/routes/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const json = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("swms_token");
      router.push("/login");
      return;
    }

    if (!response.ok) {
      setMessage(json?.error ?? "No active route");
      setRoute(null);
      return;
    }

    setMessage("");
    setRoute(json.route);
  }

  async function updateStop(binId: string, status: "collected" | "skipped" | "damaged") {
    if (!token || !route) return;

    const response = await fetch(`${apiBaseUrl}/api/v1/routes/${route._id}/stops/${binId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(json?.error ?? "Failed to update stop");
      return;
    }

    setRoute(json.route);
  }

  useEffect(() => {
    loadRoute().catch(() => setMessage("Failed to load route"));
  }, []);

  const stopStats = useMemo(() => {
    if (!route) return { total: 0, collected: 0, skipped: 0, damaged: 0, pending: 0, progress: 0 };
    const total = route.stops.length;
    const collected = route.stops.filter((s) => s.status === "collected").length;
    const skipped = route.stops.filter((s) => s.status === "skipped").length;
    const damaged = route.stops.filter((s) => s.status === "damaged").length;
    const pending = route.stops.filter((s) => s.status === "pending").length;
    const progress = total ? Math.round(((total - pending) / total) * 100) : 0;
    return { total, collected, skipped, damaged, pending, progress };
  }, [route]);

  function logout() {
    localStorage.removeItem("swms_token");
    router.replace("/login");
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  }

  return (
    <main>
      <div className="top-bar">
        <h1>Collector Portal</h1>
      </div>
      <div className="center-actions" style={{ marginBottom: 10 }}>
        <button type="button" className="ghost" onClick={logout}>
          Log out
        </button>
      </div>
      {message && <p className="error">{message}</p>}
      {!route && <p>No route currently assigned.</p>}
      {route && (
        <>
          <section className="panel" style={{ marginBottom: 14 }}>
            <h2>Route Overview</h2>
            <div className="card-grid">
              <article className="metric-card">
                <p>Route ID</p>
                <div className="metric-value" style={{ fontSize: "1rem" }}>{route._id.slice(-8)}</div>
              </article>
              <article className="metric-card">
                <p>Status</p>
                <div className="metric-value" style={{ fontSize: "1rem" }}>{route.status}</div>
              </article>
              <article className="metric-card">
                <p>Algorithm</p>
                <div className="metric-value" style={{ fontSize: "1rem" }}>{route.algorithm}</div>
              </article>
              <article className="metric-card">
                <p>Progress</p>
                <div className="metric-value">{stopStats.progress}%</div>
              </article>
              <article className="metric-card">
                <p>Pending Stops</p>
                <div className="metric-value">{stopStats.pending}</div>
              </article>
              <article className="metric-card">
                <p>Collected Stops</p>
                <div className="metric-value">{stopStats.collected}</div>
              </article>
            </div>
          </section>

          <section className="panel">
            <h2>Assigned Stops</h2>
            <div className="collector-stops">
              {route.stops
                .sort((a, b) => a.order - b.order)
                .map((stop) => (
                  <article key={stop.binId} className="collector-stop-card">
                    <p><strong>Stop {stop.order}:</strong> {stop.binId}</p>
                    <p>Status: <span className="collector-status">{stop.status}</span></p>
                    <div className="center-actions" style={{ marginTop: 8, justifyContent: "flex-start" }}>
                      <button onClick={() => updateStop(stop.binId, "collected")}>Collected</button>
                      <button className="ghost" onClick={() => updateStop(stop.binId, "skipped")}>Skipped</button>
                      <button className="ghost" onClick={() => updateStop(stop.binId, "damaged")}>Damaged</button>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

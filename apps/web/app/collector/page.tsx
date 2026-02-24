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

  function logout() {
    localStorage.removeItem("swms_token");
    router.push("/login");
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
        <section className="panel">
          <p>Route ID: {route._id}</p>
          <p>Status: {route.status}</p>
          <p>Algorithm: {route.algorithm}</p>
          <ol className="list">
            {route.stops
              .sort((a, b) => a.order - b.order)
              .map((stop) => (
                <li key={stop.binId} style={{ marginBottom: 10 }}>
                  {stop.binId} - {stop.status}
                  <div className="center-actions" style={{ marginTop: 8, justifyContent: "flex-start" }}>
                    <button onClick={() => updateStop(stop.binId, "collected")}>Collected</button>
                    <button className="ghost" onClick={() => updateStop(stop.binId, "skipped")}>Skipped</button>
                    <button className="ghost" onClick={() => updateStop(stop.binId, "damaged")}>Damaged</button>
                  </div>
                </li>
              ))}
          </ol>
        </section>
      )}
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { socket } from "../../lib/socket";
import { apiBaseUrl } from "../../lib/config";

const LiveMap = dynamic(() => import("../../components/LiveMap"), { ssr: false });

type Bin = {
  binId: string;
  fillLevel: number;
  temperatureC: number;
  location: { lat: number; lng: number };
};

type Overview = {
  bins: Bin[];
  activeAlerts: Array<{ type: string; level: string; message: string }>;
  metrics?: { openRoutes: number; openReports: number };
};

type Collector = { _id: string; name: string; email: string };

type RouteSummary = {
  _id: string;
  status: string;
  algorithm: string;
  collectorId?: { name?: string; email?: string } | null;
  stops: Array<{ binId: string; status: string }>;
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Overview>({ bins: [], activeAlerts: [] });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [selectedCollector, setSelectedCollector] = useState("");
  const [routes, setRoutes] = useState<RouteSummary[]>([]);

  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("swms_token") : null), []);

  async function authFetch(path: string, init?: RequestInit) {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {})
      }
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("swms_token");
      router.push("/login");
      throw new Error("Unauthorized");
    }

    return response;
  }

  async function loadOverview() {
    if (!token) {
      router.push("/login");
      return;
    }

    const response = await authFetch("/api/v1/dashboard/overview");
    if (!response.ok) {
      setError("Backend unavailable for dashboard overview.");
      return;
    }

    setData(await response.json());
  }

  async function loadCollectors() {
    if (!token) return;

    const response = await authFetch("/api/v1/users/collectors");
    if (!response.ok) return;

    const json = await response.json();
    setCollectors(json.collectors ?? []);
  }

  async function loadRoutes() {
    if (!token) return;

    const response = await authFetch("/api/v1/routes");
    if (!response.ok) return;

    const json = await response.json();
    setRoutes(json.routes ?? []);
  }

  async function generateRoute() {
    if (!token) return;

    setError("");
    setInfo("");

    const response = await authFetch("/api/v1/routes/generate", {
      method: "POST",
      body: JSON.stringify({ collectorId: selectedCollector || undefined })
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(json?.error ?? "Route generation failed.");
      return;
    }

    if (json?.message) {
      setInfo(json.message);
    } else {
      setInfo("Route generated successfully.");
    }

    await loadRoutes();
    await loadOverview();
  }

  useEffect(() => {
    loadOverview().catch(() => setError("Failed to load overview"));
    loadCollectors().catch(() => undefined);
    loadRoutes().catch(() => undefined);

    socket.on("bin.updated", () => {
      loadOverview().catch(() => undefined);
    });

    return () => {
      socket.off("bin.updated");
    };
  }, []);

  function logout() {
    localStorage.removeItem("swms_token");
    router.push("/login");
  }

  return (
    <main>
      <div className="top-bar">
        <h1>Admin Dashboard</h1>
      </div>
      <div className="center-actions" style={{ marginBottom: 10 }}>
        <button type="button" className="ghost" onClick={logout}>
          Log out
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {info && <p style={{ textAlign: "center", color: "var(--accent)" }}>{info}</p>}

      <div className="card-grid" style={{ marginBottom: 16 }}>
        <article className="metric-card">
          <p>Total Bins</p>
          <div className="metric-value">{data.bins.length}</div>
        </article>
        <article className="metric-card">
          <p>Open Routes</p>
          <div className="metric-value">{data.metrics?.openRoutes ?? 0}</div>
        </article>
        <article className="metric-card">
          <p>Open Reports</p>
          <div className="metric-value">{data.metrics?.openReports ?? 0}</div>
        </article>
      </div>

      <div className="row">
        <section className="panel">
          <h2>Live Bin Map</h2>
          <LiveMap bins={data.bins} />
          <p>Legend: Green &lt;80%, Orange 80-89%, Red &gt;=90%</p>
        </section>

        <section className="panel">
          <h2>Active Alerts ({data.activeAlerts.length})</h2>
          <ul className="list">
            {data.activeAlerts.map((alert, i) => (
              <li key={i}>[{alert.level}] {alert.message}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Route Assignment</h2>
        <div className="center-actions">
          <select value={selectedCollector} onChange={(e) => setSelectedCollector(e.target.value)} style={{ minWidth: 260, maxWidth: 380 }}>
            <option value="">Unassigned route</option>
            {collectors.map((collector) => (
              <option key={collector._id} value={collector._id}>
                {collector.name} ({collector.email})
              </option>
            ))}
          </select>
          <button onClick={generateRoute}>Generate Route</button>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Recent Routes ({routes.length})</h2>
        <ul className="list">
          {routes.map((route) => (
            <li key={route._id}>
              {route.status} | {route.algorithm} | stops: {route.stops.length} | collector: {route.collectorId?.name ?? "unassigned"}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

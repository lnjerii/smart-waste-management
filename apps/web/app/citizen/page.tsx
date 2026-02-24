"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiBaseUrl } from "../../lib/config";

type Report = {
  _id: string;
  type: string;
  status: string;
  description: string;
};

export default function CitizenPage() {
  const router = useRouter();
  const [type, setType] = useState("overflow");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("-1.286389");
  const [lng, setLng] = useState("36.817223");
  const [photoUrl, setPhotoUrl] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [myReports, setMyReports] = useState<Report[]>([]);

  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("swms_token") : null), []);

  async function submitReport(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${apiBaseUrl}/api/v1/reports`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        type,
        description,
        location: { lat: Number(lat), lng: Number(lng) },
        photoUrl: photoUrl || undefined,
        reporterName: name || undefined,
        reporterEmail: email || undefined
      })
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(json?.error ?? "Failed to submit report");
      return;
    }

    setMessage(`Report submitted: ${json.report._id}`);
    setDescription("");
  }

  async function loadMyReports() {
    if (!token) {
      setMessage("Login as citizen to view your report history.");
      return;
    }

    const response = await fetch(`${apiBaseUrl}/api/v1/reports/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(json?.error ?? "Failed to fetch reports");
      return;
    }

    setMyReports(json.reports ?? []);
  }

  function logout() {
    localStorage.removeItem("swms_token");
    router.push("/login");
  }

  return (
    <main>
      <div className="top-bar">
        <h1>Citizen Portal</h1>
      </div>
      <div className="center-actions" style={{ marginBottom: 10 }}>
        <button type="button" className="ghost" onClick={logout}>
          Log out
        </button>
      </div>
      {message && <p className="error">{message}</p>}

      <section className="panel">
        <h2>Submit Report</h2>
        <form onSubmit={submitReport}>
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="overflow">Overflowing Bin</option>
            <option value="damaged_bin">Damaged Bin</option>
            <option value="illegal_dumping">Illegal Dumping</option>
            <option value="new_bin_request">New Bin Request</option>
          </select>

          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />

          <label>Latitude</label>
          <input value={lat} onChange={(e) => setLat(e.target.value)} />

          <label>Longitude</label>
          <input value={lng} onChange={(e) => setLng(e.target.value)} />

          <label>Photo URL (optional)</label>
          <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />

          <label>Name (optional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />

          <label>Email (optional)</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />

          <div className="center-actions" style={{ marginTop: 10 }}>
            <button type="submit">Submit Report</button>
            <button type="button" className="ghost" onClick={loadMyReports}>
              Load My Reports
            </button>
          </div>
        </form>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>My Reports ({myReports.length})</h2>
        <ul className="list">
          {myReports.map((report) => (
            <li key={report._id}>
              [{report.status}] {report.type} - {report.description}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

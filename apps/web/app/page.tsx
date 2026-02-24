import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <div className="top-bar">
        <h1>Smart Waste Management System</h1>
      </div>

      <section className="panel">
        <p>Modern municipal operations with live telemetry, route intelligence, and citizen engagement.</p>
        <div className="center-actions">
          <Link href="/login"><button>Login</button></Link>
          <Link href="/dashboard"><button className="ghost">Dashboard</button></Link>
          <Link href="/collector"><button className="ghost">Collector</button></Link>
          <Link href="/citizen"><button className="ghost">Citizen</button></Link>
        </div>
      </section>
    </main>
  );
}

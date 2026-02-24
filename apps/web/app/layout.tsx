import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata = {
  title: "SWMS"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="app-footer">
          <div className="app-footer-inner">
            <div className="footer-brand">
              <h3>Smart Waste Management System</h3>
              <p>Real-time monitoring, route intelligence, and citizen engagement.</p>
            </div>
            <div className="footer-grid">
              <div>
                <h4>Platform</h4>
                <p>Admin Dashboard</p>
                <p>Collector Workflow</p>
                <p>Citizen Reports</p>
              </div>
              <div>
                <h4>Operations</h4>
                <p>Telemetry Alerts</p>
                <p>Route Optimization</p>
                <p>Live Status Updates</p>
              </div>
              <div>
                <h4>Contact</h4>
                <p>swms@city-ops.local</p>
                <p>+254 700 000 000</p>
                <p>Nairobi City Ops</p>
              </div>
            </div>
            <p className="footer-copy">© 2026 SWMS. Built for clean, data-driven cities.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

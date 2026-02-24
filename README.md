# Smart Waste Management System

AI-powered, IoT-integrated smart waste platform with real-time monitoring, route optimization, and citizen reporting.

## Monorepo Structure

- `apps/web`: Next.js web app for admin dashboard, collectors, and citizens
- `apps/api`: Node.js + Express + Socket.io backend (JWT + RBAC)
- `apps/optimizer`: Route optimization microservice (OR-Tools-ready interface)
- `iot`: ESP32 firmware and local simulator for sensor payloads
- `docs`: SRS, architecture, roadmap

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
- Copy `apps/api/.env.example` to `apps/api/.env`
- Copy `apps/web/.env.example` to `apps/web/.env.local`

3. Run services in separate terminals:
```bash
npm run dev:optimizer
npm run dev:api
npm run dev:web
```

4. Open web app and seed test users:
- Visit `http://localhost:3000/login`
- Click `Seed Admin`, `Seed Collector`, `Seed Citizen` once

## Functional Modules Included

- Device-authenticated telemetry ingest endpoint
- Threshold-based alert creation and Socket.io broadcasts
- JWT auth endpoints (`register`, `login`, `me`)
- RBAC-protected dashboard and route generation APIs
- Persistent route plans with collector stop-status updates
- Citizen report submission and status lifecycle APIs
- Live Leaflet map with color-coded bin markers
- Optimized route generation via separate optimizer service

## Main API Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/dashboard/overview`
- `POST /api/v1/routes/generate` (admin)
- `GET /api/v1/routes` (admin)
- `GET /api/v1/routes/my` (collector)
- `PATCH /api/v1/routes/:routeId/stops/:binId/status` (collector/admin)
- `POST /api/v1/reports`
- `GET /api/v1/reports/my`
- `GET /api/v1/reports` (admin/collector)

## Next Build Targets

- Replace optimizer heuristic with OR-Tools VRP solver
- Add image upload storage for citizen reports
- Add notifications (SMS/email/push)
- Add audit trail UI and analytics exports

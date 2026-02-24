# System Architecture

## High-Level Layers

1. IoT Layer: ESP32 smart bins with ultrasonic + temperature sensors
2. Network Layer: GSM/WiFi HTTPS transport
3. Cloud Layer: Express API, MongoDB, Socket.io
4. Application Layer: Next.js dashboard and role-based portals
5. Intelligence Layer: route optimization + predictive analytics

## Data Flow

1. Sensor device sends telemetry to `/api/v1/telemetry`.
2. API validates payload and stores telemetry + current bin snapshot.
3. Alert service evaluates thresholds and creates alert records.
4. Socket.io emits `bin.updated` and `alert.created` events.
5. Dashboard and collector clients update UI in real time.
6. Route service periodically generates optimized route plans.

## Proposed Services

- Auth Service
- Bin Telemetry Service
- Alert Service
- Route Optimization Service
- Report Management Service
- Notification Service

## Deployment (MVP)

- Web: Vercel
- API: Render/Railway
- DB: MongoDB Atlas
- Object Storage: Cloudinary/S3 for report images

## Security Controls

- JWT auth and role middleware
- Request validation (zod)
- Rate limiting on public endpoints
- Device token validation for IoT ingest
- Structured audit logs

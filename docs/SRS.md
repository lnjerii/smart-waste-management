# Software Requirements Specification (SRS)

## 1. Purpose
Build a Smart Waste Management System that uses IoT sensors, a cloud backend, AI optimization, and web/mobile interfaces to improve municipal waste collection efficiency.

## 2. Scope
The platform includes:
- IoT smart bins transmitting fill and temperature telemetry
- Backend API and event system for real-time status
- Admin dashboard for operations and analytics
- Collector interface for route execution
- Citizen interface for issue reporting
- Alerting and route optimization services

## 3. Stakeholders
- Municipality operations teams
- Waste collection drivers
- Citizens
- System administrators

## 4. Functional Requirements

### FR-01 Bin Telemetry Ingestion
System shall receive payloads: `binId`, `fillLevel`, `temperatureC`, `batteryLevel`, `timestamp`, `location`.

### FR-02 Real-Time Bin Status
System shall push status updates to dashboard clients within 5 seconds of ingest.

### FR-03 Capacity Alerts
System shall generate alerts when fill level >= 80% and critical alerts when >= 90%.

### FR-04 Fire Hazard Alerts
System shall generate critical alerts when temperature exceeds configured threshold.

### FR-05 Route Assignment
System shall assign optimized routes to collectors based on full bins and priority alerts.

### FR-06 Collection Workflow
Collector shall mark bins as collected, skipped, or damaged, with optional photo evidence.

### FR-07 Citizen Reports
Citizen shall report overflow/damage with GPS coordinates and image attachment.

### FR-08 Analytics
System shall provide trends by area, peak times, and monthly operational summaries.

### FR-09 User and Role Management
System shall enforce RBAC for admin, collector, and citizen roles.

### FR-10 Notification Dispatch
System shall send configurable SMS/email/push notifications for high-priority events.

## 5. Non-Functional Requirements
- Availability target: 99.5%
- API response time: < 500 ms for standard requests
- Data encryption in transit via HTTPS/TLS
- JWT-based auth with refresh strategy
- Audit logs for administrative actions

## 6. Data Entities
- Bin
- TelemetryRecord
- Alert
- RoutePlan
- CollectionEvent
- CitizenReport
- User

## 7. Assumptions and Constraints
- Initial deployment uses cloud-hosted MongoDB Atlas.
- Mobile app may be implemented as responsive web in MVP.
- IoT devices publish over GSM/WiFi using HTTPS.

## 8. Success Metrics
- 30-50% reduction in route distance/fuel compared to fixed schedule
- < 2 hours average time-to-collect for critical bins
- > 90% telemetry completeness per day

# SmartBus AI Backend API Documentation

## Base URL

```text
http://localhost:5000
```

---

# Authentication

## Admin Register

```http
POST /api/auth/admin/register
```

## Admin Login

```http
POST /api/auth/admin/login
```

## Student Register

```http
POST /api/auth/student/register
```

## Student Login

```http
POST /api/auth/student/login
```

## Driver Register

```http
POST /api/auth/driver/register
```

## Driver Login

```http
POST /api/auth/driver/login
```

---

# Buses

```http
GET    /api/buses
GET    /api/buses/:id
POST   /api/buses
PUT    /api/buses/:id
DELETE /api/buses/:id
```

---

# Routes

```http
GET    /api/routes
GET    /api/routes/:id
POST   /api/routes
PUT    /api/routes/:id
DELETE /api/routes/:id
```

---

# Bus Routes

```http
GET    /api/bus-routes
POST   /api/bus-routes
DELETE /api/bus-routes/:id
```

---

# Students

```http
GET    /api/students
GET    /api/students/:id
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id
```

---

# Drivers

```http
GET    /api/drivers
GET    /api/drivers/:id
POST   /api/drivers
PUT    /api/drivers/:id
DELETE /api/drivers/:id
```

---

# Schedules

```http
GET    /api/schedules
GET    /api/schedules/:id
POST   /api/schedules
PUT    /api/schedules/:id
DELETE /api/schedules/:id
```

---

# Student Bus Assignment

```http
GET    /api/student-bus
POST   /api/student-bus
DELETE /api/student-bus/:id
```

---

# Route Stops

```http
GET    /api/route-stops
GET    /api/route-stops/:id
POST   /api/route-stops
PUT    /api/route-stops/:id
DELETE /api/route-stops/:id
```

---

# Attendance

```http
POST /api/attendance
GET  /api/attendance/today
GET  /api/attendance/student/:studentId
PUT  /api/attendance/checkout/:id
```

---

# Live Bus Location

```http
POST /api/bus-locations
GET  /api/bus-locations
GET  /api/bus-locations/:busId
```

---

# Notifications

```http
POST   /api/notifications
GET    /api/notifications/user/:userId
PUT    /api/notifications/:id/read
PUT    /api/notifications/user/:userId/read-all
DELETE /api/notifications/:id
```

---

# Dashboards

## Admin Dashboard

```http
GET /api/admin/dashboard
```

Requires:

```text
Authorization: Bearer ADMIN_TOKEN
```

## Driver Dashboard

```http
GET /api/driver/dashboard/:driverId
```

## Student Dashboard

```http
GET /api/student/dashboard/:studentId
```

---

# Reports

```http
GET /api/reports/attendance
GET /api/reports/drivers
GET /api/reports/buses
```

Attendance report requires:

```text
Authorization: Bearer TOKEN
```

---

# Common Responses

## Success

```json
{
  "success": true
}
```

## Validation Error

```json
{
  "success": false,
  "message": "All fields are required"
}
```

## Missing Token

```json
{
  "success": false,
  "message": "Access denied. Token missing."
}
```

## Invalid or Expired Token

```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```

## Forbidden Role

```json
{
  "success": false,
  "message": "Access forbidden"
}
```

## Route Not Found

```json
{
  "success": false,
  "message": "API route not found"
}
```

## Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```
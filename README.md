# 🚌 SmartBus AI System

A full-stack Smart Bus Management System built using React, Node.js, Express, and MySQL.

The system helps administrators, drivers, and students manage university transportation efficiently with authentication, dashboards, attendance tracking, notifications, and live bus tracking.

---

# 🚀 Features

## Authentication
- Admin Login & Registration
- Driver Login & Registration
- Student Login & Registration
- JWT Authentication
- Role-Based Authorization

## Bus Management
- Add, Update, Delete Buses
- View Bus Details

## Route Management
- Manage Routes
- Manage Route Stops
- Bus-Route Assignment

## Student Management
- Student CRUD
- Student Bus Assignment

## Driver Management
- Driver CRUD
- Driver Assignment

## Schedule Management
- Create & Manage Bus Schedules

## Attendance
- Mark Attendance
- Student Attendance History
- Daily Attendance
- Checkout Attendance

## Notifications
- Send Notifications
- Mark Read
- Read All
- Delete Notifications

## Live Bus Tracking
- Update Bus Location
- View Live Bus Location

## Dashboards
- Admin Dashboard
- Driver Dashboard
- Student Dashboard

## Reports
- Attendance Report
- Driver Report
- Bus Report

---

# 🛠 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MySQL

### Authentication
- JWT
- bcrypt

---

# 📂 Project Structure

```
SmartBus-AI
│
├── frontend
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── routes
│   ├── db.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone <repository-url>
```

## Backend

```bash
cd backend
npm install
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 🔐 Environment Variables

Create a `.env` file inside the backend folder.

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smartbus_db

JWT_SECRET=your_secret

ADMIN_SECRET_KEY=your_secret
```

---

# 📌 API Modules

- Authentication
- Students
- Drivers
- Buses
- Routes
- Route Stops
- Bus Routes
- Schedules
- Attendance
- Notifications
- Live Bus Tracking
- Dashboards
- Reports

---

# 👩‍💻 Developed By

**Ditya Manral**
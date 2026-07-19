# 🚍 SmartBus AI System

A full-stack Smart Bus Management System developed to streamline university transportation through real-time bus tracking, route management, attendance monitoring, and role-based dashboards.

The system provides separate portals for **Admin**, **Driver**, and **Student**, making transportation management efficient, secure, and user-friendly.

---

##Live Demo

###Frontend - https://smart-bus-ai-system.vercel.app

###Backend - https://smartbus-ai-system.onrender.com

## ✨ Features

### 👨‍💼 Admin Module

- Secure Authentication
- Dashboard Analytics
- Bus Management
- Driver Management
- Student Management
- Route Management
- Bus Assignment
- Attendance Reports
- Driver Reports
- Bus Reports
- Notifications
- Live Bus Tracking

---

### 🚌 Driver Module

- Secure Login
- Dashboard
- Assigned Route
- Assigned Students
- Live Location Sharing
- Profile Management
- Settings
- Change Password
- Forgot Password

---

### 🎓 Student Module

- Secure Login
- Dashboard
- My Bus Details
- Live Bus Tracking
- Attendance
- Notifications
- Profile
- Settings
- Change Password
- Forgot Password

---

## 🔐 Authentication

- JWT Authentication
- Role-Based Authorization
- Password Encryption using bcrypt
- Forgot Password Verification

Student verification:
- Email + Roll Number

Driver verification:
- Email + License Number

Admin verification:
- Email + Secret Key

---

## 🛠 Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Leaflet.js

### Backend

- Node.js
- Express.js
- MySQL
- JWT
- bcrypt

---

## 📂 Project Structure

```
SmartBus-AI-System
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── routes
│   ├── services
│   ├── db.js
│   └── server.js
│
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── layouts
│   │   ├── services
│   │   └── App.jsx
│
└── README.md
```

---

## ⚙ Installation

### Backend

```bash
cd backend

npm install

npm run dev
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## 🔑 Environment Variables

Backend `.env`

```env
PORT=5000

DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=smartbus_db

JWT_SECRET=your_jwt_secret

ADMIN_SECRET_KEY=your_admin_secret
```

---

## 📊 Modules

- Authentication
- Student Management
- Driver Management
- Bus Management
- Route Management
- Attendance
- Reports
- Notifications
- Live Bus Tracking
- Settings
- Password Recovery

---

## 🚀 Future Enhancements

- Google Maps Integration
- Push Notifications
- AI-based Route Optimization
- Parent Portal
- Mobile Application
- QR Code Attendance
- GPS Hardware Integration

---

## 👩‍💻 Author

**Ditya Manral**

GitHub:
https://github.com/DityaManral11

---

## ⭐ Support

If you like this project,

⭐ Star this repository.

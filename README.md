# 🧓 Nivaran – Age Care System

## 📌 Project Overview

**Nivaran: Age Care System** is a web-based caregiving management platform designed to connect elderly individuals and their families with verified caregivers. The system simplifies caregiver discovery, booking, real-time tracking, notifications, and secure payment while ensuring safety, transparency, and reliability.

The platform provides role-based access for **Admin, Caregiver, and Client** users and supports complete caregiving workflow management.

---

## ✨ Features

### 🔐 Authentication & Authorization
- User Registration (Client, Caregiver, Admin)
- Secure Login using JWT Authentication
- Password Validation and Hashing
- Forgot Password
- Google Login (OAuth)
- Role-Based Access Control (RBAC)

### 👩‍⚕️ Caregiver Management
- Create and Edit Caregiver Profile
- Add Skills and Experience
- Availability Scheduling
- Skill-Based Caregiver Search

### 📅 Booking System
- Parent Details Management
- Caregiver Availability Display
- Booking Request System
- Double Booking Prevention

### 📍 GPS Tracking System
- Real-Time Caregiver Location Tracking
- OpenStreetMap Integration
- Live Location Monitoring using React Leaflet

### 🔔 Notification System
- Booking Notifications
- Approval / Rejection Notifications
- Arrival and Exit Radius Alerts
- Real-Time Notification Updates using Socket.io

### 💳 Payment Integration
- Khalti Payment Gateway (Testing Mode)
- Payment Success / Failure Handling
- Booking Status Update after Payment

---

## 🛠 Technology Stack

### Frontend
- React.js
- TypeScript
- HTML5
- CSS3
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose
  
### Authentication & Security
- JWT Authentication
- Google OAuth
- Password Hashing

### Real-Time Communication
- Socket.io

### Mapping & GPS Tracking
- React Leaflet
- OpenStreetMap
- Browser Geolocation API

### File Upload & Email
- Multer
- Nodemailer
  
---

## 📂 Project Structure

```bash
Nivaran-AgeCare-Management-System/
│
├── 📁 frontend/                        # React + Vite + TypeScript
│   ├── 📁 public/
│   ├── 📁 src/
│   │   ├── 📁 Components/
│   │   ├── 📁 Pages/
│   │   ├── 📁 assets/
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
└── 📁 backend/                         # Node.js + Express
    ├── 📁 config/
    ├── 📁 controllers/
    ├── 📁 middlewares/
    ├── 📁 models/
    ├── 📁 routes/
    ├── 📁 sockets/
    ├── 📁 uploads/
    ├── 📁 utils/
    ├── .gitignore
    ├── package-lock.json
    ├── package.json
    └── server.js
```

---

## 👥 User Roles

### Admin
- Approve or decline caregiver registration
- Manage system users
- Monitor activities

### Caregiver
- Create and manage profile
- Set availability
- Accept or decline bookings
- Share real-time location

### Client / Family Member
- Search caregivers
- Book caregiving services
- Track caregiver location
- Receive notifications
- Make payments

---

## 🎯 Project Objectives

- Improve accessibility to elderly caregiving services
- Ensure transparency and trust
- Simplify caregiver booking and monitoring
- Improve safety using GPS tracking
- Support secure digital payments

---

## 📄 License

This project is developed for academic and educational purposes.

# NexusAuth

<p align="center">
  <img src="https://img.shields.io/badge/MERN-FullStack-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Live-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Auth-JWT%20%7C%20Google%20OAuth-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Frontend-Netlify-00C7B7?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Backend-Render-5A29E4?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge" />
</p>

<p align="center">
  Enterprise-Grade MERN Authentication Platform — Secure · Scalable · Modern · Production Ready
</p>


---

## Overview

**NexusAuth** is a fully deployed, production-ready authentication and authorization platform built with the **MERN Stack**. It provides enterprise-level features including secure registration, Google OAuth, OTP email verification, password recovery, JWT security, protected routes, and cloud deployment.

**Ideal for:** SaaS products, startups, admin dashboards, enterprise panels, agencies, and full-stack applications.

---

## Features

### Authentication
- Email & Password Registration
- Secure Login / Logout
- Google OAuth Sign-In
- OTP Email Verification
- Forgot Password & Password Reset via Email Token
- Persistent Login Sessions

### Security
- JWT Access Tokens & Refresh Token System
- HTTP-Only Secure Cookies
- Password Hashing with bcrypt
- Protected API Routes
- Role-Based Access Control (RBAC Ready)
- Helmet Security Middleware
- CORS Protection & Rate Limiting
- Secure Environment Variables

### Frontend
- Fully Responsive, Modern UI
- React Context for Auth State Management
- Axios with Auto Token Refresh
- Protected React Routes
- Mobile-Friendly UX

---
##  Live Website
🔗 [Visit NexusAuth](https://nexusauth-app.netlify.app)

---
## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React.js, Vite, Tailwind CSS, React Router DOM, Axios, Context API, React Hook Form, Zod |
| **Backend** | Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcryptjs, Cookie Parser, Express Validator, Nodemailer |
| **DevOps** | GitHub, Netlify, Render, MongoDB Atlas, Google Cloud Console |

---

## Project Structure

```
NexusAuth/
├── frontend/              # React Client Application
│   ├── src/
│   ├── public/
│   └── vite.config.js
│
├── backend/               # Express REST API
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── server.js
│
└── README.md
```

---

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/Irfanullah-khan/NexusAuth.git
cd NexusAuth
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Production Deployment

### Frontend — Netlify
- Connected to GitHub for auto-deploy on push
- SPA route redirects configured
- Production domain live

### Backend — Render
- Express server live with secured environment variables
- MongoDB Atlas connected with CORS configured for production

### Database — MongoDB Atlas
- Cloud-hosted NoSQL database
- Secure access control with live user data

---

## Authentication Flow

```
User Registration
       ↓
OTP Email Verification
       ↓
Login
       ↓
JWT Access Token Issued
       ↓
Protected Dashboard Access
       ↓
Refresh Token Session Renewal
```

---

## Author

**Irfanullah Khan** — Full Stack Developer focused on building secure, scalable, production-grade web applications.

- GitHub: [@Irfanullah-khan](https://github.com/Irfanullah-khan)

---

## License

This project is licensed for educational, portfolio, and learning purposes.

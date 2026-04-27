# NexusAuth 🔐

<p align="center">
  <b>Enterprise-Grade MERN Authentication Platform</b><br>
  Secure • Scalable • Modern • Self-Hosted
</p>

<p align="center">
  JWT Sessions • Google OAuth • OTP Verification • Password Reset • RBAC
</p>

---

##  Overview

**NexusAuth** is a production-ready full-stack authentication and authorization platform built using the MERN stack.

It delivers the security and user experience of modern identity providers while giving full ownership of your users, tokens, and infrastructure.

Designed for startups, SaaS products, agencies, and developers who need secure authentication without vendor lock-in.

---

##  Core Features

### 🔐 Authentication

* Email & Password Registration
* Secure Login System
* Google OAuth Sign-In
* OTP Email Verification
* Forgot Password Flow
* Password Reset via Secure Token
* Logout Functionality

### 🛡 Security

* JWT Access + Refresh Tokens
* HTTP-only Secure Cookies
* Role Based Access Control (RBAC)
* Protected Routes
* Password Hashing with bcrypt
* Helmet Security Headers
* Rate Limiting
* CSRF Protection Ready

### 🎨 Frontend Experience

* Modern Responsive UI
* React Context Authentication State
* Axios Auto Refresh Interceptors
* Clean Dashboard Experience
* Mobile Friendly Design

---

## 🛠 Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router DOM
* Axios
* React Hook Form
* Zod

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Cookie Parser
* Express Validator

### Deployment

* GitHub
* Netlify
* Render
* MongoDB Atlas

---

## 📂 Project Structure

```text
NexusAuth/
├── frontend/     # React Client
├── backend/      # Express API
└── .gitignore
```

---

## ⚙️ Local Development Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Irfanullah-khan/NexusAuth.git
cd NexusAuth
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

### Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🌐 Live Demo

🚧 Coming Soon

* Frontend: Deploying on Netlify
* Backend API: Deploying on Render

---

## 📸 Screenshots

🚧 Coming Soon

* Landing Page
* Login Page
* Register Page
* Dashboard
* Password Reset Flow

---

## 🔮 Future Roadmap

* Two Factor Authentication (2FA)
* Admin Dashboard
* Login Activity History
* Multi Device Session Management
* GitHub Login
* Passkeys / Face Login
* AI Fraud Detection

---

## 🤝 Why NexusAuth?

Instead of paying monthly fees to managed auth providers, NexusAuth gives you:

✅ Full Data Ownership
✅ Full Code Ownership
✅ Enterprise Security Standards
✅ Zero Per-User Cost
✅ Fully Customizable Platform

---

## 👨‍💻 Author

**Irfanullah Khan**

Passionate Full Stack Developer focused on building secure modern web applications.

---

## ⭐ Support

If you like this project, give it a **star** on GitHub and follow for future updates.

---

## 📜 License

This project is licensed for educational and portfolio purposes.

# A² ReVamp Gym — Enterprise SaaS Gym Management Platform

> A production-ready, scalable **Gym Management SaaS Platform** built with **HTML5, CSS3, JavaScript, Node.js, Express.js, MongoDB (Mongoose), and Redis**. Designed to support **1,000+ concurrent users** with sub-100ms response times.

---

## 🌟 Key Features

### 🛡️ 1. Admin Dashboard
- **Analytics & Revenue**: Real-time revenue charts (₹4,85,000/mo), active member counts (352), certified trainers (8), and daily check-ins.
- **CRUD Operations**: Complete management for Members, Trainers, Staff, Membership Plans, Payments & Invoices, Classes, Coupons, Blogs, Reviews, and System Settings.
- **Report Exports**: One-click **PDF Report Generator** and **Excel (.csv)** exporter.

### 🏋️ 2. Trainer Dashboard
- **Assigned Members**: Member roster & individual fitness goals.
- **Plan Builders**: Interactive **AI Workout Generator** and **AI Diet Planner**.
- **Class Scheduling**: Calendar session scheduler, member progress tracking, direct chat, and video uploads.

### 👤 3. Member Dashboard
- **Member Overview**: Plan status, workout routine, and attendance streak.
- **Digital QR Check-in**: Personal digital QR pass for instant camera scan check-in.
- **BMI & Calorie Calculator**: Body Mass Index & daily caloric recommendation calculator.
- **Class Booking & Invoices**: Group fitness booking catalog & PDF receipt downloads.

### 🤖 4. AI Fitness Suite
- **AI Workout & Diet Generator**: Automated workout and macro meal plan generation based on body metrics and target goals.
- **AI Progress Predictor**: Calculates 12-week body weight and fat % transformation timeline.
- **Floating AI Assistant Chatbot**: Widget answering member queries 24/7.

---

## 🏗️ Technology Stack

- **Frontend**: HTML5, CSS3 (Vanilla Design System with HSL tokens, Glassmorphic blurs, dark/light themes), JavaScript (ES Modules, Vite 8.1.5), Canvas Analytics Graphs, PWA Service Worker.
- **Backend API**: Node.js 20, Express.js (MVC Architecture), Winston Logger, Morgan.
- **Database & Cache**: MongoDB 7.0 (Mongoose Schemas & Indexing), Redis 7.2 Cache Store.
- **Security & Uploads**: Helmet HTTP headers, CORS controls, Bcryptjs, JWT (Dual token access/refresh rotation), express-mongo-sanitize, Multer & Cloudinary v2 API.
- **DevOps & Testing**: Docker, Docker Compose, GitHub Actions CI/CD Pipeline, Jest & Supertest API tests.

---

## ⚡ Quick Start & Running Locally

### Prerequisites
- Node.js >= 20.x
- MongoDB (local or MongoDB Atlas URI)
- Redis (optional, fallback in-memory cache included)

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/AshishKumar161/gym-webpage.git
cd gym-webpage

# 2. Install Frontend Dependencies
npm install

# 3. Install Backend Dependencies
cd server
npm install
cd ..

# 4. Start Development Servers
# Terminal 1 — Frontend (Vite)
npm run dev

# Terminal 2 — Backend API (Express)
node server/server.js
```

- **Frontend App**: `http://localhost:5173/`
- **Backend API Health Check**: `http://localhost:5000/health`

---

## 🐳 Docker Deployment

Run the complete multi-container stack (Express API + MongoDB + Redis) with one command:

```bash
docker-compose up --build -d
```

---

## 🧪 Running Automated Tests

```bash
cd server
npm test
```

---

## 📖 Documentation & Deployment Guides

- 📘 [API Documentation](file:///a:/gym%20webpage/DOCS/API_DOCUMENTATION.md)
- 🚀 [Deployment Guide (Vercel, Railway, Render, AWS, MongoDB Atlas)](file:///a:/gym%20webpage/DOCS/DEPLOYMENT_GUIDE.md)

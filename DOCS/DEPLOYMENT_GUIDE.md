# A² ReVamp Gym — Enterprise Deployment Guide

This guide outlines step-by-step instructions for deploying the **Frontend** (Vercel / Netlify), **Backend API** (Railway / Render / AWS), and **Database** (MongoDB Atlas).

---

## 🌐 1. Deploying Frontend to Vercel

1. Push code to your GitHub repository (`AshishKumar161/gym-webpage`).
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Select your repository.
4. Set Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Your frontend will be live at `https://gym-webpage.vercel.app`.

---

## 🚂 2. Deploying Backend to Railway / Render

1. Log in to [Render](https://render.com/) or [Railway](https://railway.app/).
2. Create a new **Web Service** connected to your repository.
3. Set Root Directory to `server`.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGODB_URI=your_mongodb_atlas_connection_string`
   - `JWT_SECRET=your_jwt_secret`

---

## 🍃 3. Setting Up MongoDB Atlas Database

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a user with read/write permissions.
3. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere).
4. Copy the connection string (e.g., `mongodb+srv://admin:password@cluster.mongodb.net/a2revampgym?retryWrites=true&w=majority`).
5. Set this URI as `MONGODB_URI` in `server/.env`.

# FarmFusion 🌱

Online agricultural marketplace for seeds, farming tools, and crop care essentials.

## 🌐 Live Website & Production URL
- **Live Application**: [https://farmfusion-api.onrender.com](https://farmfusion-api.onrender.com)
- **API Health Check**: [https://farmfusion-api.onrender.com/api/health](https://farmfusion-api.onrender.com/api/health)

## 📁 Project Structure

- `frontend/` - React 19 + Vite + Tailwind CSS
- `backend/` - Node.js + Express + MongoDB REST API (serves UI & API)
- `render.yaml` - 1-Click Unified Full-Stack Blueprint for Render

## 💻 Run Locally

### 1. Install Dependencies
```bash
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure Environment
Copy `backend/.env.example` to `backend/.env`:
```bash
Copy-Item backend\.env.example backend\.env   # Windows
cp backend/.env.example backend/.env          # Linux/Mac
```
Set values in `backend/.env`:
- `MONGO_URI` = MongoDB Atlas or local connection URL
- `JWT_SECRET` = Your secret key for auth tokens
- `ADMIN_PASSWORD` = Password for default admin
- `FRONTEND_URL` = `http://localhost:5173`

### 3. Start Development
Run backend (Terminal 1):
```bash
npm run dev --prefix backend
```
Run frontend (Terminal 2):
```bash
npm run dev --prefix frontend
```
- Website: `http://localhost:5173`
- API Health: `http://localhost:7854/api/health`

## 🚀 1-Click Deploy to Render (Blueprint)

### Step 1: MongoDB Network Access
In [MongoDB Atlas](https://cloud.mongodb.com/) > **Network Access** > **IP Access List**:
- Add IP: `0.0.0.0/0` (Allow Access from Anywhere).

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Deploy to Render"
git push origin main
```

### Step 3: Launch Blueprint on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) > **New +** > **Blueprint**.
2. Connect your GitHub repository (`Farmfusion`).
3. Render automatically provisions:
   - **`farmfusion-api`** (Unified Web Service serving both UI and API)
4. Enter the prompted variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `ADMIN_PASSWORD`: Your admin password
5. Click **Apply**.

## 🔑 Access & Admin Login

- **Direct Website URL**: `https://farmfusion-api.onrender.com`
- **API Health Check**: `https://farmfusion-api.onrender.com/api/health`
- **Admin Email**: `admin@farmfusion.com`
- **Admin Password**: Your configured `ADMIN_PASSWORD`
- **Admin Dashboard**: Sign in at `/login`, then visit `/admin`

> **Note**: Free tier backends sleep after 15 min of inactivity and take ~40s to wake up on the first request.

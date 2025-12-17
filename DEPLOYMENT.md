# 🚀 Deployment Guide - Expense Tracker

## Overview
- **Backend:** Render (Node.js)
- **Database:** MongoDB Atlas (Cloud)
- **Frontend:** Vercel (Static Hosting)

---

## 📦 STEP 1: Deploy Database (MongoDB Atlas)

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub or email
3. Verify your email

### 1.2 Create Free Cluster
1. Click **"Build a Database"**
2. Choose **M0 FREE** tier
3. Provider: **AWS**
4. Region: Choose closest to you (e.g., Mumbai for India)
5. Cluster Name: `expense-tracker`
6. Click **"Create"**

### 1.3 Setup Database User
1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `expenseuser`
5. Password: Click **"Autogenerate Secure Password"** and **COPY IT!**
6. Database User Privileges: **Read and write to any database**
7. Click **"Add User"**

### 1.4 Allow Network Access
1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds 0.0.0.0/0)
4. Click **"Confirm"**

### 1.5 Get Connection String
1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Drivers"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string:
   ```
   mongodb+srv://expenseuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name before the `?`:
   ```
   mongodb+srv://expenseuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/expenseTracker?retryWrites=true&w=majority
   ```

---

## 🖥️ STEP 2: Deploy Backend (Render)

### 2.1 Create Render Account
1. Go to https://render.com/
2. Sign up with **GitHub** (easiest)
3. Authorize Render to access your GitHub

### 2.2 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: **`Expense-Tracker`**
3. Click **"Connect"**

### 2.3 Configure Web Service
Fill in these details:
- **Name:** `expense-tracker-backend`
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free`

### 2.4 Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generate random string (use: https://randomkeygen.com/) |
| `NODE_ENV` | `production` |

Example:
```
PORT=5000
MONGODB_URI=mongodb+srv://expenseuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/expenseTracker?retryWrites=true&w=majority
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c
NODE_ENV=production
```

### 2.5 Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Once live, you'll get a URL like: `https://expense-tracker-backend.onrender.com`
4. **COPY THIS URL!** You'll need it for frontend

### 2.6 Test Backend
Open in browser: `https://expense-tracker-backend.onrender.com/`
You should see: `"Expense Tracker API is running"`

---

## 🌐 STEP 3: Deploy Frontend (Vercel)

### 3.1 Update API URL in Frontend
1. Open `frontend/public/js/auth.js`
2. Find line 17:
   ```javascript
   const API_URL = window.location.hostname === 'localhost'
       ? `http://localhost:5000/api`
       : 'https://your-backend-url.onrender.com/api'; // UPDATE THIS!
   ```
3. Replace `your-backend-url.onrender.com` with your Render backend URL
4. Do the same in `dashboard.js` and `budget.js`
5. Commit changes:
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push
   ```

### 3.2 Create Vercel Account
1. Go to https://vercel.com/
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel

### 3.3 Import Project
1. Click **"Add New..."** → **"Project"**
2. Find your **`Expense-Tracker`** repository
3. Click **"Import"**

### 3.4 Configure Project
- **Framework Preset:** `Other`
- **Root Directory:** `frontend`
- **Build Command:** Leave empty (static site)
- **Output Directory:** Leave empty
- Click **"Deploy"**

### 3.5 Get Frontend URL
After deployment completes (1-2 minutes):
1. You'll get a URL like: `https://expense-tracker-nikhil.vercel.app`
2. Click **"Visit"** to test your app!

---

## 🔧 STEP 4: Final Configuration

### 4.1 Update CORS in Backend
1. Go to Render dashboard
2. Click your backend service
3. Go to **"Environment"** tab
4. Add your Vercel frontend URL to allowed origins

Or update `backend/index.js` and redeploy:
```javascript
const allowedOrigins = [
  'https://your-vercel-app.vercel.app', // Your actual Vercel URL
  'http://localhost:3002'
];
```

### 4.2 Test Full Application
1. Open your Vercel frontend URL
2. Try signing up with a new account
3. Login and add expenses
4. Everything should work!

---

## ✅ Verification Checklist

- [ ] MongoDB Atlas cluster is running
- [ ] Backend deployed on Render (shows API message)
- [ ] Frontend deployed on Vercel
- [ ] Can signup new account
- [ ] Can login
- [ ] Can add/edit/delete expenses
- [ ] Can set budgets

---

## 🐛 Troubleshooting

### Backend won't start on Render
- Check environment variables are set correctly
- Check MongoDB URI has correct password
- View Render logs: **Service → Logs**

### Frontend can't connect to backend
- Check browser console for CORS errors
- Verify API_URL in frontend JavaScript files
- Make sure backend URL is added to CORS allowed origins

### MongoDB connection fails
- Verify password in connection string
- Check Network Access allows 0.0.0.0/0
- Verify database user exists

---

## 💰 Cost

**Everything is FREE!**
- ✅ MongoDB Atlas: M0 Free Tier (512 MB storage)
- ✅ Render: Free tier (spins down after 15 min inactivity)
- ✅ Vercel: Free tier (unlimited deployments)

**Note:** Render free tier sleeps after inactivity. First request after sleep may take 30-60 seconds.

---

## 🔄 Future Updates

When you make changes:

1. **Update code locally**
2. **Test locally**
3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
4. **Auto-deploy:** Both Render and Vercel will auto-deploy from GitHub!

---

## 📝 Your Deployment URLs

Fill these in after deployment:

- **Frontend:** https://_____________________.vercel.app
- **Backend:** https://_____________________.onrender.com
- **MongoDB:** cluster0._____.mongodb.net

---

## 🎉 Congratulations!

Your Expense Tracker is now live and accessible worldwide! Share the Vercel URL with anyone!

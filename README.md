# 💰 Daily Expense Tracker

A modern, full-stack web application to track and manage your daily expenses efficiently. Built with Node.js, Express, MongoDB, and vanilla JavaScript with a beautiful, responsive UI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-5.0%2B-green.svg)

## ✨ Features

- 🔐 **User Authentication** - Secure login/signup with JWT tokens
- 💵 **Expense Management** - Add, edit, and delete expenses with ease
- 📊 **Smart Filtering** - Filter expenses by category and date
- 📈 **Dashboard Analytics** - View total, monthly, and daily expense summaries
- 🌓 **Dark Mode** - Eye-friendly dark theme support
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- 🎨 **Modern UI** - Clean interface with Tailwind CSS
- 💳 **Indian Currency** - Format amounts in ₹ (INR)
- 🔄 **Real-time Updates** - Instant UI updates without page refresh

## Quick Start

### For Windows Users:

1. Make sure MongoDB is installed and running on your system
2. Double-click the `start.bat` file
3. The application will automatically open in your browser
4. Wait for both servers to start

### For Linux/Mac Users:

1. Make sure MongoDB is installed and running on your system
2. Make the start script executable:
   ```
   chmod +x start.sh
   ```
3. Run the start script:
   ```
   ./start.sh
   ```
4. The application will automatically open in your browser

## Installation (Manual Method)

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/NikhilSutawane29/expense-tracker.git
   cd expense-tracker
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Configure environment variables:
   ```bash
   cd ../backend
   cp .env.example .env
   ```
   
   Then edit `.env` and update:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A strong secret key for JWT tokens
   - `PORT` - Backend server port (default: 5000)

## 🚀 Running the Application (Manual Method)

### Step 1: Start the Backend Server

```bash
cd backend
node index.js
```

You should see messages confirming:
- ✅ "Connected to MongoDB successfully"
- ✅ "Server running on http://localhost:5000"

### Step 2: Start the Frontend Server

In a new terminal:

```bash
cd frontend
node server.js
```

You should see:
- ✅ "Frontend server running on port 3002"

### Step 3: Open the Application

Open http://localhost:3002 in your browser

## 🔧 Troubleshooting

### Connection Issues

If you see "Failed to connect to server" errors:

1. ✅ Make sure MongoDB is running
2. ✅ Verify the backend server is running on port 5000
3. ✅ Check the MongoDB connection string in `backend/.env`
4. ✅ Ensure no other application is using ports 5000 or 3002
5. ✅ Restart both servers

### MongoDB Setup

**For Local MongoDB:**
```bash
# Windows
mongod --dbpath C:\data\db

# Linux/Mac
sudo systemctl start mongod
```

**For MongoDB Atlas:**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

## 📁 Project Structure

```
expense-tracker/
├── backend/                    # Node.js Express Server
│   ├── controllers/            # Business logic
│   │   ├── authController.js   # Authentication logic
│   │   ├── budgetController.js # Budget management
│   │   └── expenseController.js# Expense CRUD operations
│   ├── middleware/             # Custom middleware
│   │   └── auth.js             # JWT authentication
│   ├── models/                 # MongoDB Mongoose models
│   │   ├── User.js             # User schema
│   │   ├── Expense.js          # Expense schema
│   │   └── Budget.js           # Budget schema
│   ├── routes/                 # API routes
│   │   ├── auth.js             # Auth endpoints
│   │   ├── expense.js          # Expense endpoints
│   │   └── budget.js           # Budget endpoints
│   ├── .env.example            # Environment variables template
│   ├── index.js                # Server entry point
│   └── package.json            # Backend dependencies
│
├── frontend/                   # Client-side Application
│   ├── public/                 # Static assets
│   │   ├── css/
│   │   │   └── styles.css      # Custom styles + responsive design
│   │   └── js/
│   │       ├── auth.js         # Authentication logic
│   │       ├── authCheck.js    # Route protection
│   │       ├── dashboard.js    # Dashboard functionality
│   │       ├── budget.js       # Budget page logic
│   │       └── darkMode.js     # Theme switcher
│   ├── views/                  # HTML pages
│   │   ├── login.html          # Login page
│   │   ├── signup.html         # Registration page
│   │   ├── dashboard.html      # Main dashboard
│   │   └── budget.html         # Budget planning page
│   ├── server.js               # Development server
│   └── package.json            # Frontend dependencies
│
├── .gitignore                  # Git ignore rules
├── .gitattributes              # Git attributes
├── README.md                   # This file
├── start.bat                   # Windows startup script
├── start.sh                    # Linux/Mac startup script
└── vercel.json                 # Vercel deployment config
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing

### Frontend
- **Languages**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS (CDN)
- **Icons**: Font Awesome
- **Architecture**: Vanilla JavaScript with modular design

### DevOps
- **Version Control**: Git & GitHub
- **Deployment**: Vercel-ready configuration

## 🔐 Security Features

- 🔒 Password hashing with bcrypt
- 🎫 JWT-based authentication
- 🛡️ Protected API routes
- ✅ Input validation
- 🔑 Environment variable protection

## 🚀 Deployment

### Deploy to Vercel

1. Fork this repository
2. Import project to Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT`
4. Deploy!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

**⚠️ Important**: Never commit your `.env` file to GitHub!

## 📸 Screenshots

_Add your application screenshots here_

## 🐛 Known Issues

- None currently reported

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Nikhil Sutawane**
- GitHub: [@NikhilSutawane29](https://github.com/NikhilSutawane29)

## 🙏 Acknowledgments

- Font Awesome for icons
- Tailwind CSS for styling utilities
- MongoDB for database solutions

---

⭐ Star this repo if you find it helpful!
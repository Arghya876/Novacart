# ✨ NovaCart — Premium MERN E-Commerce Platform

NovaCart is a state-of-the-art, full-stack e-commerce platform built on the MERN (MongoDB, Express, React, Node.js) stack. It features a premium, responsive user interface with rich micro-animations, robust state management, secure authentication, and seamless payment integration.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 & Vite 8 (Fast, modern build tool)
- **State Management:** Redux Toolkit & React Redux
- **Styling:** Tailwind CSS v4 (Sleek, modern styling system)
- **Animations:** GSAP & Framer Motion (Premium, fluid user interactions)
- **Icons:** Lucide React
- **SEO:** React Helmet Async

### Backend
- **Runtime & Framework:** Node.js & Express 5
- **Database:** MongoDB (via Mongoose)
- **Local Dev Database:** `mongodb-memory-server` (Zero-setup local database fallback)
- **Authentication:** JWT (JSON Web Tokens) with Secure HTTP-Only Cookies (Access & Refresh tokens)
- **Payments:** Stripe & Razorpay
- **Image Hosting:** Cloudinary
- **Security:** Helmet, CORS, Express Rate Limit, bcryptjs

---

## 🌟 Key Features

- 👤 **Secure Authentication:** JWT-based login, registration, password hashing, and secure refresh token rotation via HTTP-only cookies.
- 📦 **Dynamic Product Catalog:** Features featured products, search, category filtering, and smart product recommendations.
- 🛒 **Interactive Cart & Checkout:** Persistent shopping cart, coupon code application, and multiple address management.
- 💳 **Multiple Payment Gateways:** Seamlessly integrates Stripe and Razorpay for secure checkout.
- 🛡️ **Robust Security:** Preconfigured security headers (Helmet), rate limiting to prevent brute-force attacks, and strict CORS policies.
- 💾 **Zero-Setup Database Fallback:** If the remote MongoDB Atlas database is unreachable (e.g., due to IP whitelisting or being offline), the backend automatically spins up an in-memory MongoDB instance (`mongodb-memory-server`) and seeds it with rich demo data so the app works out-of-the-box.

---

## 📁 Project Structure

```
NovaCart/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Cloudinary configurations
│   │   ├── controllers/     # API request handlers
│   │   ├── middleware/      # Auth, error, and security middlewares
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express API routes
│   │   └── utils/           # Helper functions (seeding, state, logs)
│   ├── .env.example         # Template for backend environment variables
│   └── package.json
├── frontend/
│   ├── src/                 # React application source code
│   ├── public/              # Static assets
│   ├── vite.config.js       # Vite configuration
│   └── package.json
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Arghya876/Novacart.git
cd Novacart
```

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Fill in your environment variables in `.env` (e.g., `JWT_SECRET`, `MONGO_URI`, and payment credentials).
   > **Note:** If you leave `MONGO_URI` empty or if it cannot connect, the application will automatically fall back to an in-memory database.

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### 4. Running Locally
- **Start Backend (Port 5000):**
  ```bash
  cd backend
  ```
  For development with hot-reloading:
  ```bash
  npm run dev
  ```
- **Start Frontend (Port 5173):**
  ```bash
  cd frontend
  npm run dev
  ```

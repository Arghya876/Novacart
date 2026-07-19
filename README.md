# ✨ NovaCart — Premium MERN E-Commerce Platform

NovaCart is a state-of-the-art, enterprise-ready e-commerce platform built on the MERN (MongoDB, Express, React, Node.js) stack. It features a premium, ultra-responsive user interface with rich micro-animations, role-based user portals, automated WebP/MP4 media compression, multi-recipient notification emails, Indian Rupee (₹) pricing, and production-grade security.

Live Production URL: **[https://novacart-arghya876.vercel.app/](https://novacart-arghya876.vercel.app/)**

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 & Vite 8 (Ultra-fast modern build tooling)
- **State Management:** Redux Toolkit & React Redux
- **Styling:** Tailwind CSS v4 (Custom design system & fluid dark mode)
- **Animations:** Framer Motion & GSAP (Interactive micro-animations & spring overlays)
- **Icons:** Lucide React
- **SEO & Routing:** React Helmet Async & React Router v7

### Backend
- **Runtime & Framework:** Node.js & Express 5
- **Database:** MongoDB (via Mongoose)
- **Local Dev Fallback:** `mongodb-memory-server` (Zero-setup local in-memory database)
- **Authentication:** JWT (Access & Refresh tokens via HTTP-Only Cookies) + Google Identity Services (OAuth 2.0)
- **Media Optimization:** WebP image conversion & compressed media storage
- **Email Notifications:** Nodemailer (Multi-recipient delivery & status updates)
- **Security:** Helmet CSP, Express Rate Limit, Mongo Sanitize, CORS lockdown, bcryptjs

---

## 🌟 Key Features & Updates

### 🔐 Multi-Portal Authentication & Google Sign-In
- **Role-Based Login Routes:** Dedicated portals for Customers (`/login/customer`), Merchants (`/login/seller`), and Admins (`/admin/login`).
- **Google OAuth 2.0:** One-tap Google Sign-In integrated into Customer and Seller portals using Google Identity Services (GIS SDK).

### 🔍 Animated Floating Search & Debouncing
- **Floating Search Overlay:** Clicking search on desktop or mobile opens an animated, glassmorphic modal with popular catalog search tags.
- **Real-Time Autocomplete & Debouncing:** Instant debounced search suggestions (`useDebounce` hook) with thumbnail previews and live currency prices.

### 🖼️ Automatic WebP Image & Video Compression
- **Client-Side & Server Media Processing:** Sellers can upload multiple images and videos. Images are automatically converted to optimized WebP format prior to database persistence.

### 💰 Indian Rupee (₹) Currency & Smart Discount Calculations
- **INR Currency System:** All products, cart items, order totals, and checkout summaries display accurate Indian Rupee prices (`₹`).
- **Discount & Coupon Engines:** Precise percentage calculation, discount badges, and active coupon codes.

### 🚚 Order Tracking & Admin Operations
- **Live Delivery Progress Tracker:** Visual milestone tracker (`Order Placed` ➔ `Processing` ➔ `Shipped` ➔ `Out for Delivery` ➔ `Delivered`).
- **Admin Management Console:** Admin capabilities to reset order/delivery progress and permanently delete order history.
- **Multi-Recipient Email Notifications:** Automated status update emails sent simultaneously to Customer, Seller, and Admin.

### 🛡️ Production Security & Error Handling
- **Hardened HTTP Headers:** Helmet CSP directives, frameguard protection, and XSS sanitization (`mongo-sanitize`).
- **Global Toast Notifications:** Automatic user-friendly error popups for network and API responses.
- **Vercel SPA Deployment:** Pre-configured `vercel.json` rewrite rules for single-page routing on Vercel.

---

## 📁 Project Structure

```
NovaCart/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Cloudinary configurations
│   │   ├── controllers/     # API request handlers (Auth, Products, Orders, etc.)
│   │   ├── middleware/      # Auth, security, sanitization & error handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express API endpoints
│   │   └── utils/           # Helper scripts (Seeder, DB State, Email Transporter)
│   ├── .env.example         # Template for backend environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI elements, Header, Footer & GoogleAuthButton
│   │   ├── pages/           # Storefront, Portals, Dashboards & 404 NotFound
│   │   ├── store/           # Redux Toolkit slices (Auth, Cart, Wishlist, Toast)
│   │   ├── utils/           # API interceptors & Currency formatters
│   │   └── hooks/           # Custom hooks (useDebounce)
│   ├── vercel.json          # Vercel SPA client-side routing config
│   └── package.json
├── vercel.json              # Root Vercel deployment configuration
└── README.md
```

---

## 🛠️ Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Arghya876/Novacart.git
cd Novacart
```

### 2. Install Dependencies
```bash
# Install backend and frontend dependencies in one command
npm run install-all
```

### 3. Configure Environment Variables
Create `.env` files in `backend/.env` and `frontend/.env`:

**backend/.env**:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/novacart
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

**frontend/.env**:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 4. Seed Database & Start Local Servers
```bash
# Seed initial demo data (Products in ₹, Categories, Coupons, Users)
npm run seed

# Run concurrent local backend (port 5000) and frontend (port 5173)
npm run dev
```

---

## 📄 License
Licensed under the [MIT License](LICENSE).

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { store } from './store';

// Layouts
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import LoginPortal from './pages/Auth/LoginPortal';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminLogin from './pages/Auth/AdminLogin';

// Dashboards
import UserDashboard from './pages/Dashboards/UserDashboard';
import SellerDashboard from './pages/Dashboards/SellerDashboard';
import AdminDashboard from './pages/Dashboards/AdminDashboard';

// Static
import { About, Contact, FAQ, Privacy, Terms } from './pages/Static/StaticPages';

// Shop Layout Wrapper
function ShopLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 transition-colors duration-300">
      <Header />
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

// Global Back Button Component (Universal navigation helper)
function GlobalBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the back button on the storefront homepage or home view
  if (location.pathname === '/' || location.pathname === '/home') return null;

  return (
    <button
      onClick={() => navigate(-1)}
      className="fixed bottom-6 left-6 z-[100] flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-white/90 dark:bg-neutral-900/90 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 shadow-xl backdrop-blur-md hover:scale-105 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer text-xs font-bold"
    >
      <ArrowLeft className="h-4 w-4" /> Back
    </button>
  );
}

// Protected Route for Shoppers/Customers
function CustomerProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login/customer" replace />;
  if (user.role !== 'customer') return <Navigate to="/" replace />;
  return children;
}

// Protected Route for Sellers
function SellerProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login/seller" replace />;
  if (user.role !== 'seller') return <Navigate to="/" replace />;
  return children;
}

// Protected Route for checkout (allows both customers and sellers to place orders)
function OrderingProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'customer' && user.role !== 'seller') return <Navigate to="/" replace />;
  return children;
}

// Protected Route for Profile/Account details (allows both customers and sellers)
function UserProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'customer' && user.role !== 'seller') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <Router>
          <GlobalBackButton />
          <Routes>
            {/* Shop Layout (Includes public header & footer) */}
            <Route element={<ShopLayout />}>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/search" element={<ProductListing />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              
              {/* Portal Selector */}
              <Route path="/login" element={<LoginPortal />} />
              
              {/* Specialized Auth Flows */}
              <Route path="/login/:role" element={<Login />} />
              <Route path="/register/:role" element={<Register />} />
              
              {/* Static Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />

              {/* Protected Ordering Route (Allows both customers and sellers to order) */}
              <Route
                path="/checkout"
                element={
                  <OrderingProtectedRoute>
                    <Checkout />
                  </OrderingProtectedRoute>
                }
              />
              
              {/* Protected Profile Route for both Customer & Seller */}
              <Route
                path="/profile"
                element={
                  <UserProtectedRoute>
                    <UserDashboard />
                  </UserProtectedRoute>
                }
              />

              {/* Protected Seller dashboard (my-products) */}
              <Route
                path="/my-products"
                element={
                  <SellerProtectedRoute>
                    <SellerDashboard />
                  </SellerProtectedRoute>
                }
              />

              {/* Legacy Redirections for Compatibility */}
              <Route path="/customer" element={<Navigate to="/profile" replace />} />
              <Route path="/seller" element={<Navigate to="/my-products" replace />} />
            </Route>

            {/* Separate Admin Routes (No storefront header & footer) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </HelmetProvider>
    </Provider>
  );
}
export { CustomerProtectedRoute, SellerProtectedRoute, OrderingProtectedRoute, UserProtectedRoute };

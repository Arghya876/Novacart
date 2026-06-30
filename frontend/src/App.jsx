import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './store';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Dashboards
import UserDashboard from './pages/Dashboards/UserDashboard';
import SellerDashboard from './pages/Dashboards/SellerDashboard';
import AdminDashboard from './pages/Dashboards/AdminDashboard';

// Static
import { About, Contact, FAQ, Privacy, Terms } from './pages/Static/StaticPages';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  return user ? children : <Navigate to="/login" replace />;
}

// Role-based Route Wrapper
function RoleRoute({ children, allowedRoles }) {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 transition-colors duration-300">
            <Header />
            
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductListing />} />
                <Route path="/search" element={<ProductListing />} />
                <Route path="/product/:slug" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Static Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                {/* Protected Customer Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Seller Routes */}
                <Route
                  path="/seller"
                  element={
                    <RoleRoute allowedRoles={['seller']}>
                      <SellerDashboard />
                    </RoleRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <RoleRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </RoleRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </HelmetProvider>
    </Provider>
  );
}
export { ProtectedRoute, RoleRoute };

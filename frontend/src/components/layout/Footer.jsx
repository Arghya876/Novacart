import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-400 border-t border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-white">
              <img 
                src="/logo.png" 
                alt="NovaCart Logo" 
                className="h-8.5 w-8.5 object-contain" 
              />
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent font-extrabold">
                NovaCart
              </span>
            </Link>
            <p className="text-sm text-neutral-400">
              Experience the next generation of premium e-commerce. Fast, secure, and built for you.
            </p>
            <div className="flex space-x-4">
              {/* GitHub */}
              <a href="https://github.com/Arghya876" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-all hover:scale-110 duration-200" title="GitHub">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://www.linkedin.com/in/arghya-bhattacharjee876/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-all hover:scale-110 duration-200" title="LinkedIn">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              {/* Portfolio */}
              <a href="https://arghya-bhattacharjee.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-all hover:scale-110 duration-200" title="Portfolio">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://www.facebook.com/arghya.bhattacharjee876" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-all hover:scale-110 duration-200" title="Facebook">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/arghya.bhattacharjee876/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-all hover:scale-110 duration-200" title="Instagram">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/category/electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/category/fashion" className="hover:text-white transition-colors">Fashion</Link></li>
              <li><Link to="/category/home" className="hover:text-white transition-colors">Home & Living</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Newsletter</h3>
            <p className="text-sm text-neutral-400 mb-3">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 text-sm text-neutral-900 bg-white rounded-xl border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="submit"
                className="flex items-center justify-center p-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p>© {currentYear} NovaCart Inc. All rights reserved.</p>
            <span className="hidden sm:inline text-neutral-700">|</span>
            <p className="bg-linear-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent font-medium">
              Website built by Arghya Bhattacharjee
            </p>
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-neutral-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-neutral-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

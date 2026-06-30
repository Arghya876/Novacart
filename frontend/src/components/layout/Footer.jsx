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
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
              <div className="rounded-full bg-violet-500/15 p-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
              </div>
              <span className="bg-linear-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                NovaCart
              </span>
            </Link>
            <p className="text-sm text-neutral-400">
              Experience the next generation of premium e-commerce. Fast, secure, and built for you.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.752.054 2.122.097 3.05 1.011 3.146 3.146.044.968.054 1.323.054 3.752 0 2.43-.01 2.784-.054 3.752-.097 2.122-1.011 3.05-3.146 3.146-.968.044-1.323.054-3.752.054-2.43 0-2.784-.01-3.752-.054-2.122-.097-3.05-1.011-3.146-3.146-.044-.968-.054-1.323-.054-3.752 0-2.43.01-2.784.054-3.752.097-2.122 1.011-3.05 3.146-3.146.968-.044 1.323-.054 3.752-.054zM12 2.238c-2.4 0-2.718.01-3.661.053-2.016.091-2.619.705-2.709 2.709-.043.943-.053 1.262-.053 3.661s.01 2.718.053 3.661c.09 2.003.689 2.618 2.709 2.709.943.043 1.262.053 3.661.053s2.718-.01 3.661-.053c2.016-.09 2.619-.705 2.709-2.709.043-.943.053-1.262.053-3.661s-.01-2.718-.053-3.661c-.09-2.003-.689-2.619-2.709-2.709-.943-.043-1.262-.053-3.661-.053zm0 3.762a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 110-8 4 4 0 010 8zm6.54-11.23a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
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

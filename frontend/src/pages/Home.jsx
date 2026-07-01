import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, RefreshCw, Zap, Sparkles } from 'lucide-react';
import { fetchProducts, fetchCategories, fetchRecommendations } from '../store/productSlice';
import ProductCard from '../components/common/ProductCard';
import SkeletonLoader from '../components/common/SkeletonLoader';

export default function Home() {
  const dispatch = useDispatch();
  const heroRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroImageRef = useRef(null);

  const { products, categories, recommendations, isLoading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 4, isFeatured: true }));
    dispatch(fetchCategories());
    
    // Fetch AI recommendations
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    dispatch(fetchRecommendations({ recentlyViewedIds: recentlyViewed, limit: 4 }));
    // #region agent log
    fetch('http://127.0.0.1:7489/ingest/1c86fd52-618c-449a-ab3c-a0465569063a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db9a91'},body:JSON.stringify({sessionId:'db9a91',location:'Home.jsx:useEffect',message:'Home page mounted, fetching featured products',data:{recentlyViewedCount:recentlyViewed.length},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
  }, [dispatch]);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroTextRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );
      gsap.fromTo(
        heroImageRef.current,
        { opacity: 0, scale: 0.9, rotate: -2 },
        { opacity: 1, scale: 1, rotate: 0, duration: 1.2, ease: 'elastic.out(1, 0.75)', delay: 0.3 }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="space-y-16 pb-16 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-violet-600/10 via-indigo-600/5 to-transparent dark:from-violet-950/15 dark:via-indigo-950/5 dark:to-transparent border-b border-neutral-100 dark:border-neutral-900 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Animated Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-[10%] w-96 h-96 bg-violet-400/20 dark:bg-violet-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-1/4 right-[10%] w-96 h-96 bg-indigo-400/20 dark:bg-indigo-950/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
        </div>
        <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12">
          {/* Hero Left: Text Content */}
          <div ref={heroTextRef} className="space-y-6">
            <div className="flex items-center gap-3">
              <img 
                src="/favicon.png" 
                alt="NovaCart Logo" 
                className="h-10 w-10 rounded-xl shadow-md border border-violet-500/20 object-cover animate-bounce" 
                style={{ animationDuration: '3s' }}
              />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 dark:bg-violet-900/45 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
                <Zap className="h-3.5 w-3.5 fill-violet-600 dark:fill-violet-400" /> Discover the Future of Shopping
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
              Elevate Your Lifestyle With{' '}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
                NovaCart
              </span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 max-w-lg">
              Explore our curated selection of premium electronics, high-fashion apparel, and modern home essentials designed for discerning tastemakers.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/products"
                className="inline-flex items-center justify-center h-12 px-6 rounded-full text-sm font-medium text-white bg-violet-600 hover:bg-violet-750 dark:bg-violet-500 dark:hover:bg-violet-600 transition-all hover:scale-105 shadow-md shadow-violet-500/10"
              >
                Shop Catalog <ShoppingBag className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center h-12 px-6 rounded-full text-sm font-medium text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-all hover:scale-105"
              >
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Hero Right: Product Graphic */}
          <div className="flex justify-center lg:justify-end">
            <motion.div
              ref={heroImageRef}
              whileHover={{ scale: 1.03, rotate: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative w-full max-w-[440px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-neutral-850 bg-neutral-100 dark:bg-neutral-900 z-10"
            >
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"
                alt="Premium Nike Shoes"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              {/* Glass overlay details */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/20 dark:bg-black/45 backdrop-blur-md border border-white/20 text-white flex justify-between items-center">
                <div>
                  <p className="text-xs text-white/70">Trending Apparel</p>
                  <h4 className="font-bold text-sm">Nike Air Max Scarlet</h4>
                </div>
                <span className="font-bold text-base">$129.00</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl border border-neutral-100 dark:border-neutral-900 bg-white/40 dark:bg-neutral-950/45 backdrop-blur-md">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-violet-100 dark:bg-violet-950/40 rounded-2xl text-violet-600 dark:text-violet-400">
              <Truck className="h-6 w-6" />
            </div>
            <h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">Free Shipping</h4>
            <p className="text-xs text-neutral-400">On all orders over $100</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-violet-100 dark:bg-violet-950/40 rounded-2xl text-violet-600 dark:text-violet-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">Secure Payments</h4>
            <p className="text-xs text-neutral-400">100% protected checkout</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-violet-100 dark:bg-violet-950/40 rounded-2xl text-violet-600 dark:text-violet-400">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">Easy Returns</h4>
            <p className="text-xs text-neutral-400">30-day money-back guarantee</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-violet-100 dark:bg-violet-950/40 rounded-2xl text-violet-600 dark:text-violet-400">
              <Zap className="h-6 w-6" />
            </div>
            <h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">Instant Support</h4>
            <p className="text-xs text-neutral-400">24/7 dedicated assistance</p>
          </div>
        </div>
      </motion.section>

      {/* Categories Grid */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="flex justify-between items-baseline">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Shop by Category</h2>
          <Link to="/products" className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat._id}`}
              className="group relative h-48 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-850 bg-neutral-100 dark:bg-neutral-900"
            >
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center font-bold text-lg text-violet-600 dark:text-violet-400 capitalize">
                  {cat.name}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <h3 className="font-semibold text-sm text-white capitalize">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Featured Products */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [...Array(4)].map((_, i) => <SkeletonLoader key={i} />)
          ) : (
            products.map((product) => <ProductCard key={product._id} product={product} />)
          )}
        </div>
      </motion.section>

      {/* AI Personalized Recommendations */}
      {recommendations.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500 animate-pulse" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Recommended For You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}

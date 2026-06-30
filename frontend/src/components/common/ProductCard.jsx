import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { toggleWishlist } from '../../store/wishlistSlice';
import { addToCart } from '../../store/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const isInWishlist = wishlistItems.some((item) => item._id === product._id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addToCart({
        product: product._id,
        title: product.title,
        price: product.discountPrice > 0 ? product.discountPrice : product.price,
        image: product.images[0],
        quantity: 1,
        stock: product.stock,
      })
    );
  };

  const hasDiscount = product.discountPrice > 0;
  const originalPrice = product.price;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-square w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'}
          alt={product.title}
          className="h-full w-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="inline-flex items-center rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              Sale
            </span>
          )}
          {product.isFeatured && (
            <span className="inline-flex items-center rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="inline-flex items-center rounded-full bg-neutral-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              Out of stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute right-3 top-3 p-2 rounded-full bg-white/80 dark:bg-neutral-900/85 text-neutral-600 dark:text-neutral-300 hover:text-rose-500 dark:hover:text-rose-500 hover:scale-110 transition-all z-10 shadow-sm"
        >
          <Heart className={`h-4.5 w-4.5 ${isInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </Link>

      {/* Product Details */}
      <div className="flex flex-col flex-1 p-4">
        {/* Brand and Category */}
        <div className="flex items-center justify-between text-[10px] text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-wider mb-1">
          <span>{product.brand}</span>
          <span>{product.category?.name}</span>
        </div>

        {/* Title */}
        <Link to={`/product/${product.slug}`} className="block mb-1">
          <h3 className="font-semibold text-sm text-neutral-850 dark:text-neutral-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 line-clamp-1 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Ratings */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.ratings || 0) ? 'fill-amber-400' : 'text-neutral-200 dark:text-neutral-800'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium">({product.numOfReviews})</span>
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-neutral-900 dark:text-white">${currentPrice}</span>
            {hasDiscount && (
              <span className="text-xs text-neutral-450 dark:text-neutral-550 line-through">${originalPrice}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2 rounded-xl text-white transition-all ${
              product.stock === 0
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-650 hover:scale-105 shadow-sm'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

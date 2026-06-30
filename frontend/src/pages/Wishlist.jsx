import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import { removeFromWishlist } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';

export default function Wishlist() {
  const dispatch = useDispatch();
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const handleMoveToCart = (product) => {
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
    dispatch(removeFromWishlist(product._id));
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
        <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500">
          <Heart className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-950 dark:text-white">Your Wishlist is Empty</h2>
        <p className="text-sm text-neutral-400 max-w-md mx-auto">Save the pieces you love and revisit them anytime before checkout.</p>
        <Link
          to="/products"
          className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all shadow-sm"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-neutral-955 dark:text-white flex items-center gap-2">
        My Wishlist <span className="text-xs text-neutral-400 font-medium">({wishlistItems.length} items)</span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((product) => {
          const hasDiscount = product.discountPrice > 0;
          const price = hasDiscount ? product.discountPrice : product.price;

          return (
            <div
              key={product._id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Product Image */}
              <Link to={`/product/${product.slug}`} className="relative block aspect-square w-full overflow-hidden bg-neutral-50">
                <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover object-center" />
                <button
                  onClick={() => dispatch(removeFromWishlist(product._id))}
                  className="absolute right-3 top-3 p-2 rounded-full bg-white/80 dark:bg-neutral-900/80 text-neutral-650 dark:text-neutral-300 hover:text-rose-500 transition-colors shadow-sm z-10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Link>

              {/* Product Details */}
              <div className="flex flex-col flex-1 p-4">
                <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                  <span>{product.brand}</span>
                </div>

                <Link to={`/product/${product.slug}`} className="block mb-1">
                  <h3 className="font-semibold text-sm text-neutral-850 dark:text-neutral-100 hover:text-violet-600 truncate transition-colors">
                    {product.title}
                  </h3>
                </Link>

                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">${price}</span>
                  {hasDiscount && (
                    <span className="text-xs text-neutral-400 line-through">${product.price}</span>
                  )}
                </div>

                <button
                  onClick={() => handleMoveToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full h-9 rounded-xl bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 disabled:bg-neutral-100 disabled:text-neutral-400 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ShoppingCart className="h-3.5 w-3.5" /> Move to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Heart, Star, ShieldCheck, Truck, RotateCcw, AlertTriangle } from 'lucide-react';
import { fetchProductDetails, clearCurrentProduct, fetchRecommendations } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';
import { showToast } from '../store/toastSlice';
import ProductCard from '../components/common/ProductCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import axios from 'axios';

import { formatPrice, calculateDiscountPercent, calculateSavings } from '../utils/formatCurrency';

export default function ProductDetails() {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();

  const { currentProduct, detailsLoading, recommendations } = useSelector((state) => state.products);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Fetch product details
  useEffect(() => {
    dispatch(fetchProductDetails(slug));
    window.scrollTo(0, 0);

    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, slug]);

  // Handle image selection and recently viewed list
  useEffect(() => {
    if (currentProduct) {
      setSelectedImage(currentProduct.images?.[0] || '');

      // Add to recently viewed in localStorage
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filtered = viewed.filter((id) => id !== currentProduct._id);
      filtered.unshift(currentProduct._id);
      localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 10)));

      // Fetch related recommendations
      dispatch(fetchRecommendations({ recentlyViewedIds: [currentProduct._id], limit: 4 }));
      
      // Fetch product reviews
      fetchReviews(currentProduct._id);
    }
  }, [currentProduct, dispatch]);

  const fetchReviews = async (productId) => {
    try {
      const res = await axios.get(`/api/reviews/product/${productId}`);
      setReviews(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = () => {
    if (!currentProduct) return;
    if (!user) {
      dispatch(
        showToast({
          title: 'Sign In Required',
          message: 'Please sign in to add items to your cart.',
          type: 'error',
        })
      );
      const redirectPath = location.pathname.substring(1) + location.search;
      navigate(`/login/customer?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }
    dispatch(
      addToCart({
        product: currentProduct._id,
        title: currentProduct.title,
        price: currentProduct.discountPrice > 0 ? currentProduct.discountPrice : currentProduct.price,
        image: currentProduct.images[0],
        quantity,
        stock: currentProduct.stock,
      })
    );
    dispatch(
      showToast({
        title: 'Added to Cart!',
        message: currentProduct.title,
        type: 'cart',
        image: currentProduct.images?.[0],
        actionLink: '/cart',
        actionLabel: 'View Cart',
      })
    );
  };

  const handleWishlistToggle = () => {
    if (!currentProduct) return;
    if (!user) {
      const redirectPath = location.pathname.substring(1) + location.search;
      navigate(`/login/customer?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }
    const isInWishlist = wishlistItems.some((item) => item._id === currentProduct._id);
    dispatch(toggleWishlist(currentProduct));
    dispatch(
      showToast({
        title: isInWishlist ? 'Removed from Favorites' : 'Added to Favorites!',
        message: currentProduct.title,
        type: isInWishlist ? 'info' : 'favorite',
        image: currentProduct.images?.[0],
        actionLink: isInWishlist ? null : '/wishlist',
        actionLabel: isInWishlist ? null : 'View Favorites',
      })
    );
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!reviewComment.trim()) {
      setReviewError('Please enter a comment');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        '/api/reviews',
        {
          productId: currentProduct._id,
          rating: reviewRating,
          comment: reviewComment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReviewSuccess('Review submitted successfully!');
      setReviewComment('');
      // Refresh reviews & product details (to update average rating)
      fetchReviews(currentProduct._id);
      dispatch(fetchProductDetails(slug));
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    }
  };

  if (detailsLoading || !currentProduct) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <SkeletonLoader type="details" />
      </div>
    );
  }

  const isInWishlist = wishlistItems.some((item) => item._id === currentProduct._id);
  const hasDiscount = Number(currentProduct.discountPrice || 0) > 0;
  const price = hasDiscount ? Number(currentProduct.discountPrice) : Number(currentProduct.price || 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* SEO Tags */}
      <Helmet>
        <title>{`${currentProduct.title} | NovaCart`}</title>
        <meta name="description" content={(currentProduct.description || '').substring(0, 155)} />
        <meta property="og:title" content={currentProduct.title} />
        <meta property="og:description" content={(currentProduct.description || '').substring(0, 155)} />
        <meta property="og:image" content={currentProduct.images?.[0] || ''} />
        <meta property="og:type" content="product" />
      </Helmet>

      {/* Main product display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image & Video Gallery */}
        <div className="space-y-4">
          <div
            onClick={() => setIsImageModalOpen(true)}
            className="group relative w-full aspect-square rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-950 cursor-zoom-in"
          >
            <img src={selectedImage || currentProduct.images?.[0]} alt={currentProduct.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pointer-events-none">
              🔍 Click to Zoom Image
            </div>
          </div>

          {/* Fullscreen High-Res Image Modal Overlay */}
          {isImageModalOpen && (
            <div
              onClick={() => setIsImageModalOpen(false)}
              className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
            >
              <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
                <button
                  onClick={() => setIsImageModalOpen(false)}
                  className="absolute -top-10 right-0 text-white hover:text-rose-400 font-bold text-sm bg-white/10 px-3 py-1 rounded-full cursor-pointer"
                >
                  ✕ Close Preview
                </button>
                <img
                  src={selectedImage || currentProduct.images?.[0]}
                  alt={currentProduct.title}
                  className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-neutral-800"
                />
                <p className="text-neutral-400 text-xs mt-3 text-center">{currentProduct.title}</p>
              </div>
            </div>
          )}
          
          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {(currentProduct.images || []).map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-neutral-50 dark:bg-neutral-950 flex-shrink-0 transition-colors cursor-pointer ${
                  selectedImage === img ? 'border-violet-600' : 'border-transparent'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Product Demo Video Section */}
          {currentProduct.videos && currentProduct.videos.length > 0 && (
            <div className="pt-4 space-y-2">
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                🎬 Product Demonstration Video
              </h4>
              <div className="space-y-3">
                {currentProduct.videos.map((vidUrl, idx) => (
                  <div key={idx} className="w-full aspect-video rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-black">
                    {vidUrl.includes('embed') || vidUrl.includes('youtube') || vidUrl.includes('vimeo') ? (
                      <iframe
                        src={vidUrl}
                        title={`Product Video ${idx + 1}`}
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={vidUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-450 uppercase tracking-widest">
              {currentProduct.brand}
            </span>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{currentProduct.title}</h1>
            
            {/* Ratings & Reviews Count */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(currentProduct.ratings) ? 'fill-amber-400' : 'text-neutral-200 dark:text-neutral-800'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {currentProduct.ratings}
              </span>
              <span className="text-xs text-neutral-400 font-medium">({currentProduct.numOfReviews} reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="py-4 border-y border-neutral-100 dark:border-neutral-850 flex items-center gap-3">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white">{formatPrice(price)}</span>
            {hasDiscount && (
              <>
                <span className="text-base text-neutral-400 line-through">{formatPrice(currentProduct.price)}</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  Save {formatPrice(calculateSavings(currentProduct.price, price))} ({calculateDiscountPercent(currentProduct.price, price)}% OFF)
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {currentProduct.description}
          </p>

          {/* Stock Availability / Quantity Selector */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase">Availability:</span>
              <span className={`text-xs font-bold uppercase ${currentProduct.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {currentProduct.stock > 0 ? `In Stock (${currentProduct.stock} units)` : 'Out of Stock'}
              </span>
            </div>

            {currentProduct.stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase">Quantity:</span>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold"
                >
                  {[...Array(Math.min(10, currentProduct.stock))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={currentProduct.stock === 0}
              className="flex-1 h-12 rounded-full font-bold text-sm text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-450 dark:disabled:text-neutral-550 transition-all flex items-center justify-center gap-2 shadow-md shadow-violet-500/10"
            >
              <ShoppingCart className="h-4.5 w-4.5" /> Add to Cart
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`p-3.5 rounded-full border transition-all ${
                isInWishlist
                  ? 'border-rose-250 bg-rose-50 dark:bg-rose-950/25 text-rose-500'
                  : 'border-neutral-200 dark:border-neutral-800 hover:text-rose-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-850">
            <div className="flex flex-col items-center text-center p-2">
              <Truck className="h-5 w-5 text-violet-600 dark:text-violet-400 mb-1" />
              <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">Fast Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <RotateCcw className="h-5 w-5 text-violet-600 dark:text-violet-400 mb-1" />
              <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">30-Day Returns</span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <ShieldCheck className="h-5 w-5 text-violet-600 dark:text-violet-400 mb-1" />
              <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">Official Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      {currentProduct.specifications && Object.keys(currentProduct.specifications).length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Technical Specifications</h2>
          <div className="border border-neutral-100 dark:border-neutral-850 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <tbody>
                {Object.entries(currentProduct.specifications).map(([key, value], i) => (
                  <tr key={key} className={i % 2 === 0 ? 'bg-neutral-50/50 dark:bg-neutral-900/30' : ''}>
                    <td className="px-6 py-4 font-bold text-neutral-700 dark:text-neutral-300 capitalize w-1/3 border-b border-neutral-100 dark:border-neutral-850">{key}</td>
                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-850">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Reviews & Submission */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Review Summary & Submit Form */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Customer Reviews</h2>
          
          {user ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4 p-5 border border-neutral-100 dark:border-neutral-850 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm">
              <h3 className="font-semibold text-xs text-neutral-700 dark:text-neutral-350 uppercase">Write a Review</h3>
              
              {reviewError && <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/25 text-rose-500 rounded-xl flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> {reviewError}</div>}
              {reviewSuccess && <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/25 text-emerald-505 rounded-xl">{reviewSuccess}</div>}

              {/* Rating Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="text-amber-400"
                    >
                      <Star className={`h-6 w-6 ${star <= reviewRating ? 'fill-amber-400' : 'text-neutral-200 dark:text-neutral-800'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience with this product..."
                  className="w-full p-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:outline-none focus:border-violet-500"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all"
              >
                Submit Review
              </button>
            </form>
          ) : (
            <div className="p-5 border border-neutral-100 dark:border-neutral-850 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/45 text-center space-y-3">
              <p className="text-xs text-neutral-400">Please sign in to write a review for this product.</p>
              <Link to="/login" className="inline-block px-5 py-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all">Sign In</Link>
            </div>
          )}
        </div>

        {/* Right: Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <p className="text-xs text-neutral-400 py-8">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="pb-6 border-b border-neutral-100 dark:border-neutral-850 space-y-2.5">
                  <div className="flex items-center justify-between">
                    {/* User Profile */}
                    <div className="flex items-center gap-2.5">
                      {review.user?.avatar ? (
                        <img src={review.user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs">
                          {review.user?.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{review.user?.name}</h4>
                        <p className="text-[10px] text-neutral-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Review Rating */}
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-amber-400' : 'text-neutral-200 dark:text-neutral-800'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-550 dark:text-neutral-400 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related Products / Recommendations */}
      {recommendations.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

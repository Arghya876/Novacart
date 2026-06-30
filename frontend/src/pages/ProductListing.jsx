import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, ChevronDown, RefreshCw, Star } from 'lucide-react';
import { fetchProducts, fetchCategories } from '../store/productSlice';
import ProductCard from '../components/common/ProductCard';
import SkeletonLoader from '../components/common/SkeletonLoader';

export default function ProductListing() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { products, categories, totalProducts, pagination, isLoading } = useSelector((state) => state.products);

  // Filter States
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');

  // Trigger product fetch whenever search parameters or filters change
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    const searchVal = searchParams.get('search') || searchParams.get('q');
    if (searchVal) params.search = searchVal;
    if (selectedCategory) params.category = selectedCategory;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (rating) params.rating = rating;
    if (sort) params.sort = sort;
    
    // Always fetch first page when filters change
    params.page = searchParams.get('page') || 1;
    params.limit = 12;

    dispatch(fetchProducts(params));
  }, [dispatch, searchParams, selectedCategory, minPrice, maxPrice, rating, sort]);

  const handleFilterApply = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    
    if (minPrice) newParams.set('minPrice', minPrice);
    else newParams.delete('minPrice');
    
    if (maxPrice) newParams.set('maxPrice', maxPrice);
    else newParams.delete('maxPrice');

    if (rating) newParams.set('rating', rating);
    else newParams.delete('rating');

    if (selectedCategory) newParams.set('category', selectedCategory);
    else newParams.delete('category');

    newParams.set('page', '1'); // Reset to page 1 on filter application
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSelectedCategory('');
    setSort('-createdAt');
    setSearchParams({});
  };

  const handlePageChange = (pageNumber) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', pageNumber);
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSort(value);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', value);
    setSearchParams(newParams);
  };

  const searchQuery = searchParams.get('search') || searchParams.get('q');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Title / Search Query Info */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse Products'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">{totalProducts} products found</p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-neutral-450 dark:text-neutral-500 font-medium">Sort By:</span>
          <div className="relative">
            <select
              value={sort}
              onChange={handleSortChange}
              className="h-10 pl-3 pr-8 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-850 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none"
            >
              <option value="-createdAt">Newest Arrivals</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-ratings">Highest Rated</option>
              <option value="-numOfReviews">Most Popular</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-50 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-850">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Filter className="h-4 w-4" /> Filters
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Reset
            </button>
          </div>

          <form onSubmit={handleFilterApply} className="space-y-6">
            
            {/* Category Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Category</h4>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-2.5 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="category"
                      value={cat._id}
                      checked={selectedCategory === cat._id}
                      onChange={() => setSelectedCategory(cat._id)}
                      className="rounded text-violet-600 focus:ring-violet-500/20 border-neutral-300 dark:border-neutral-800"
                    />
                    <span className="capitalize">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Price Range</h4>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs focus:outline-none focus:border-violet-500"
                />
                <span className="text-neutral-300">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Customer Review</h4>
              <div className="space-y-1">
                {[4, 3, 2, 1].map((stars) => (
                  <label key={stars} className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="rating"
                      value={stars}
                      checked={Number(rating) === stars}
                      onChange={() => setRating(stars.toString())}
                      className="rounded text-violet-600 focus:ring-violet-500/20 border-neutral-300 dark:border-neutral-800"
                    />
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < stars ? 'fill-amber-400' : 'text-neutral-200 dark:text-neutral-800'}`} />
                      ))}
                    </div>
                    <span>& Up</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all shadow-sm"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonLoader key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-sm text-neutral-500">No products match your criteria. Try adjusting filters or search query.</p>
              <button
                onClick={handleResetFilters}
                className="h-10 px-6 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-200 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && (pagination.next || pagination.prev) && (
            <div className="flex justify-center gap-2 pt-6">
              {pagination.prev && (
                <button
                  onClick={() => handlePageChange(pagination.prev.page)}
                  className="h-9 px-4 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors"
                >
                  Previous
                </button>
              )}
              {pagination.next && (
                <button
                  onClick={() => handlePageChange(pagination.next.page)}
                  className="h-9 px-4 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Package, ShoppingBag, DollarSign, Trash2, Loader2, UploadCloud, ImagePlus, Video, X, Sparkles, Film } from 'lucide-react';
import axios from 'axios';
import { formatPrice } from '../../utils/formatCurrency';

export default function SellerDashboard() {
  const { token } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('analytics');
  
  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Products State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Categories list for product creation
  const [categories, setCategories] = useState([]);

  // Product Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    imagesInput: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
    videosInput: '',
    category: '',
    brand: '',
    stock: '',
    tags: '',
    specificationsKey: '',
    specificationsValue: '',
  });
  const [specs, setSpecs] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
    if (activeTab === 'products') fetchSellerProducts();
    if (activeTab === 'orders') fetchSellerOrders();
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data.data);
      if (res.data.data.length > 0) {
        setProductForm((prev) => ({ ...prev, category: res.data.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await axios.get('/api/analytics/seller', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchSellerProducts = async () => {
    setProductsLoading(true);
    try {
      // Decode JWT to get seller ID, or let backend handle it.
      // Actually, we can fetch `/api/products` and filter by seller ID on client, or backend can support a seller filter.
      // Wait, let's look at `productController.js` `getProducts`. It filters by whatever is in `req.query`!
      // So if we pass `seller` query parameter, it will filter by that seller!
      // Wait, where do we get the seller's ID? It's in `user.id`.
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await axios.get(`/api/products?seller=${user.id}`);
      setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchSellerOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Image & Video File Upload Handlers (Device / Phone / Laptop Uploads)
  const handleImageFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Canvas WebP Compression
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to compressed WebP data URL
          const compressedWebP = canvas.toDataURL('image/webp', 0.8);
          setProductForm((prev) => ({
            ...prev,
            imagesInput: prev.imagesInput ? `${prev.imagesInput}, ${compressedWebP}` : compressedWebP,
          }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const videoDataUrl = event.target.result;
        setProductForm((prev) => ({
          ...prev,
          videosInput: prev.videosInput ? `${prev.videosInput}, ${videoDataUrl}` : videoDataUrl,
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddSpec = () => {
    if (productForm.specificationsKey && productForm.specificationsValue) {
      setSpecs((prev) => ({
        ...prev,
        [productForm.specificationsKey.trim()]: productForm.specificationsValue.trim(),
      }));
      setProductForm((prev) => ({ ...prev, specificationsKey: '', specificationsValue: '' }));
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      const tagsArray = productForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const imagesArray = productForm.imagesInput.split(',').map((url) => url.trim()).filter(Boolean);
      const videosArray = productForm.videosInput.split(',').map((url) => url.trim()).filter(Boolean);

      const postData = {
        title: productForm.title,
        description: productForm.description,
        price: Number(productForm.price),
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : 0,
        images: imagesArray.length > 0 ? imagesArray : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'],
        videos: videosArray,
        category: productForm.category,
        brand: productForm.brand,
        stock: Number(productForm.stock),
        tags: tagsArray,
        specifications: specs,
      };

      const res = await axios.post('/api/products', postData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setFormSuccess('Product created successfully! Images automatically converted to WebP format.');
        setSpecs({});
        setProductForm({
          title: '',
          description: '',
          price: '',
          discountPrice: '',
          imagesInput: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
          videosInput: '',
          category: categories[0]?._id || '',
          brand: '',
          stock: '',
          tags: '',
          specificationsKey: '',
          specificationsValue: '',
        });
        fetchSellerProducts();
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSellerProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete product');
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSellerOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Seller Portal</h1>
        
        {/* Tab Selection */}
        <div className="flex gap-1.5 sm:gap-2 p-1.5 bg-neutral-100 dark:bg-neutral-850 rounded-2xl self-start sm:self-auto max-w-full overflow-x-auto">
          {[
            { id: 'analytics', name: 'Dashboard' },
            { id: 'products', name: 'Products' },
            { id: 'orders', name: 'Orders' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-9 px-4 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Summary Cards */}
          {analyticsLoading || !analytics ? (
            <div className="py-12 flex justify-center"><div className="h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-violet-100 dark:bg-violet-950/40 rounded-2xl text-violet-600"><DollarSign className="h-6 w-6" /></div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Total Revenue</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{formatPrice(analytics.summary.totalRevenue)}</p>
                </div>
              </div>
              <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-violet-100 dark:bg-violet-950/40 rounded-2xl text-violet-600"><Package className="h-6 w-6" /></div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">My Products</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{analytics.summary.totalProducts}</p>
                </div>
              </div>
              <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-violet-100 dark:bg-violet-950/40 rounded-2xl text-violet-600"><ShoppingBag className="h-6 w-6" /></div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Items Sold</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{analytics.summary.totalItemsSold}</p>
                </div>
              </div>
            </div>
          )}

          {/* Top Products */}
          {analytics && analytics.topProducts.length > 0 && (
            <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Top Selling Products</h3>
              <div className="space-y-4">
                {analytics.topProducts.map((item) => (
                  <div key={item._id} className="flex items-center justify-between text-xs pb-3 border-b border-neutral-100 dark:border-neutral-850 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-1">{item.title}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900 dark:text-white">${item.revenue}</p>
                      <p className="text-neutral-400 mt-0.5">{item.quantitySold} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Product Catalog</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <form onSubmit={handleProductSubmit} className="p-4 sm:p-6 border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl space-y-6 shadow-md">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Add New Product</h3>
              
              {formError && <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/25 text-rose-500 rounded-xl">{formError}</div>}
              {formSuccess && <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600 rounded-xl">{formSuccess}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Brand</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 capitalize font-semibold"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-3 p-3.5 sm:p-4 rounded-2xl border border-violet-100 dark:border-violet-900/30 bg-violet-50/30 dark:bg-violet-950/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                        <ImagePlus className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        Product Images
                      </label>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Upload image files or paste image URLs</p>
                    </div>

                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all border border-violet-500/30 w-full sm:w-auto">
                      <UploadCloud className="w-4 h-4 text-white" />
                      <span>Upload Images</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageFileUpload} className="hidden" />
                    </label>
                  </div>

                  <textarea
                    required
                    rows={2}
                    value={productForm.imagesInput}
                    onChange={(e) => setProductForm({ ...productForm, imagesInput: e.target.value })}
                    placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg or click button above to upload..."
                    className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 font-mono text-[11px] focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />

                  {/* Image Previews */}
                  {productForm.imagesInput.split(',').map(s => s.trim()).filter(Boolean).length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase">Uploaded Image Previews ({productForm.imagesInput.split(',').map(s => s.trim()).filter(Boolean).length})</p>
                      <div className="flex flex-wrap gap-2.5 max-h-36 overflow-y-auto p-1">
                        {productForm.imagesInput.split(',').map(s => s.trim()).filter(Boolean).map((imgUrl, idx) => (
                          <div key={idx} className="relative group/img w-16 h-16 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shadow-sm shrink-0">
                            <img src={imgUrl} alt={`Upload ${idx+1}`} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200" />
                            <button
                              type="button"
                              onClick={() => {
                                const list = productForm.imagesInput.split(',').map(s => s.trim()).filter(Boolean);
                                list.splice(idx, 1);
                                setProductForm({ ...productForm, imagesInput: list.join(', ') });
                              }}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-md"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] text-violet-600 dark:text-violet-400 font-semibold bg-violet-100/50 dark:bg-violet-950/40 px-3 py-1.5 rounded-lg w-full sm:w-fit">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Device images auto-compress to WebP (80% quality) for lightning fast loading.</span>
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-3 p-3.5 sm:p-4 rounded-2xl border border-purple-100 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-950/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Film className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        Product Videos (Optional MP4 / YouTube / Device Files)
                      </label>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Upload video files or paste video URLs</p>
                    </div>

                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all border border-purple-500/30 w-full sm:w-auto">
                      <Video className="w-4 h-4 text-white" />
                      <span>Upload Videos</span>
                      <input type="file" accept="video/*" multiple onChange={handleVideoFileUpload} className="hidden" />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={productForm.videosInput}
                    onChange={(e) => setProductForm({ ...productForm, videosInput: e.target.value })}
                    placeholder="https://example.com/demo.mp4 or click button above to upload..."
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 font-mono text-[11px] focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />

                  {/* Video Previews */}
                  {productForm.videosInput.split(',').map(s => s.trim()).filter(Boolean).length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase">Uploaded Video Previews ({productForm.videosInput.split(',').map(s => s.trim()).filter(Boolean).length})</p>
                      <div className="flex flex-wrap gap-2.5 max-h-36 overflow-y-auto p-1">
                        {productForm.videosInput.split(',').map(s => s.trim()).filter(Boolean).map((vidUrl, idx) => (
                          <div key={idx} className="relative group/vid w-28 h-16 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 shadow-sm flex items-center justify-center shrink-0">
                            {vidUrl.startsWith('data:video') || vidUrl.endsWith('.mp4') || vidUrl.endsWith('.webm') ? (
                              <video src={vidUrl} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-[9px] text-white p-1 truncate text-center font-mono">{vidUrl}</div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const list = productForm.videosInput.split(',').map(s => s.trim()).filter(Boolean);
                                list.splice(idx, 1);
                                setProductForm({ ...productForm, videosInput: list.join(', ') });
                              }}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-md"
                              title="Remove video"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={productForm.tags}
                    onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                    placeholder="nike, running, sports, shoes"
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                  />
                </div>

                {/* Specs Creator */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-3">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Specifications</label>
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    <input
                      type="text"
                      placeholder="Specification Name (e.g. Color)"
                      value={productForm.specificationsKey}
                      onChange={(e) => setProductForm({ ...productForm, specificationsKey: e.target.value })}
                      className="flex-1 h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                    />
                    <input
                      type="text"
                      placeholder="Specification Value (e.g. Red)"
                      value={productForm.specificationsValue}
                      onChange={(e) => setProductForm({ ...productForm, specificationsValue: e.target.value })}
                      className="flex-1 h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpec}
                      className="h-10 px-5 rounded-xl bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white font-semibold text-xs whitespace-nowrap transition-colors"
                    >
                      Add Spec
                    </button>
                  </div>

                  {/* Display Added Specs */}
                  {Object.keys(specs).length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 flex flex-wrap gap-2">
                      {Object.entries(specs).map(([key, val]) => (
                        <span key={key} className="inline-flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1 text-xs">
                          <span className="font-bold capitalize">{key}:</span> {val}
                          <button type="button" onClick={() => setSpecs((prev) => { const c = { ...prev }; delete c[key]; return c; })} className="text-rose-500 font-bold ml-1 hover:opacity-75">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full h-11 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-md shadow-violet-500/10 flex items-center justify-center gap-2"
              >
                {formLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Product'}
              </button>
            </form>
          )}

          {/* Catalog View: Desktop Table + Mobile Cards */}
          {productsLoading ? (
            <div className="py-12 flex justify-center"><div className="h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center border border-neutral-100 dark:border-neutral-850 rounded-3xl bg-white dark:bg-neutral-900 text-neutral-400 text-xs">
              No products found. Click "Add Product" above to create your first listing!
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mobile Product Cards View (< 640px) */}
              <div className="block sm:hidden space-y-3">
                {products.map((item) => (
                  <div key={item._id} className="p-4 rounded-2xl border border-neutral-150 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.images[0]} alt={item.title} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-100 dark:border-neutral-800" />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-neutral-900 dark:text-white truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-xs text-violet-600 dark:text-violet-400">
                            {formatPrice(item.discountPrice > 0 ? item.discountPrice : item.price)}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.stock === 0 ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'}`}>
                            {item.stock === 0 ? 'Out of stock' : `Stock: ${item.stock}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteProduct(item._id)}
                      className="p-2 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all shrink-0"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= 640px) */}
              <div className="hidden sm:block border border-neutral-100 dark:border-neutral-850 rounded-3xl bg-white dark:bg-neutral-900 overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-950 text-neutral-400 border-b border-neutral-150 dark:border-neutral-850">
                      <th className="px-6 py-4 font-bold">Product</th>
                      <th className="px-6 py-4 font-bold">Stock</th>
                      <th className="px-6 py-4 font-bold">Price</th>
                      <th className="px-6 py-4 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((item) => (
                      <tr key={item._id} className="border-b border-neutral-100 dark:border-neutral-850 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img src={item.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <span className="font-semibold text-neutral-850 dark:text-neutral-200 line-clamp-1">{item.title}</span>
                        </td>
                        <td className={`px-6 py-4 font-bold ${item.stock === 0 ? 'text-rose-500' : 'text-neutral-500'}`}>{item.stock}</td>
                        <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">{formatPrice(item.discountPrice > 0 ? item.discountPrice : item.price)}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteProduct(item._id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-all"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Customer Orders</h2>

          {ordersLoading ? (
            <div className="py-12 flex justify-center"><div className="h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-850 text-xs">
                    <div>
                      <p className="text-neutral-400">Order ID</p>
                      <p className="font-semibold mt-0.5">{order._id}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Date</p>
                      <p className="font-semibold mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Items Status</p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                        order.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.orderItems.map((item) => (
                      <div key={item.product} className="flex gap-3 text-xs items-center">
                        <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">{item.title}</h4>
                          <p className="text-neutral-400">Qty {item.quantity} • {formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status Action Buttons */}
                  {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                    <div className="flex gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-850">
                      {(order.orderStatus === 'Order Placed' || order.orderStatus === 'Pending' || order.orderStatus === 'Processing') && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'Shipped')}
                          className="h-8 px-4 rounded-lg bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-850 text-white text-xs font-semibold cursor-pointer"
                        >
                          Mark as Shipped
                        </button>
                      )}
                      {order.orderStatus === 'Shipped' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'Delivered')}
                          className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                        >
                          Mark as Delivered
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateOrderStatus(order._id, 'Cancelled')}
                        className="h-8 px-4 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

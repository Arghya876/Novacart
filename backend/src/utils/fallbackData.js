const fallbackCategories = [
  {
    _id: 'cat-electronics',
    name: 'electronics',
    slug: 'electronics',
    description: 'Premium electronic gadgets, smartphones, and audio gear.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
  },
  {
    _id: 'cat-fashion',
    name: 'fashion',
    slug: 'fashion',
    description: 'Designer apparel and high-fashion streetwear.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600',
  },
  {
    _id: 'cat-footwear',
    name: 'footwear',
    slug: 'footwear',
    description: 'Athletic sneakers, casual shoes, and premium boots.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
  },
  {
    _id: 'cat-home',
    name: 'home',
    slug: 'home',
    description: 'Modern furniture, minimalist decor, and lighting.',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600',
  },
];

const fallbackProducts = [
  {
    _id: 'prod-wh-1000xm5',
    slug: 'sony-wh-1000xm5-anc-headphones',
    title: 'Sony WH-1000XM5 ANC Headphones',
    description: 'Industry-leading noise canceling wireless over-ear headphones with auto noise canceling optimizer and crystal clear hands-free calling.',
    price: 399.99,
    discountPrice: 349.99,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=600',
    ],
    category: fallbackCategories[0],
    brand: 'Sony',
    stock: 25,
    ratings: 4.8,
    numOfReviews: 12,
    seller: { _id: 'seller-1', name: 'Apex Brands Seller', email: 'seller@novacart.com' },
    isFeatured: true,
    tags: ['headphones', 'audio', 'wireless', 'anc'],
    specifications: { battery: '30 Hours', connectivity: 'Bluetooth 5.2', weight: '250g' },
  },
  {
    _id: 'prod-iphone-15',
    slug: 'iphone-15-pro-max-titanium',
    title: 'iPhone 15 Pro Max Titanium',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip and the most powerful iPhone camera system ever.',
    price: 1199.99,
    discountPrice: 0,
    images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=600'],
    category: fallbackCategories[0],
    brand: 'Apple',
    stock: 15,
    ratings: 4.9,
    numOfReviews: 8,
    seller: { _id: 'seller-1', name: 'Apex Brands Seller', email: 'seller@novacart.com' },
    isFeatured: true,
    tags: ['iphone', 'smartphone', 'apple'],
    specifications: { storage: '256GB', screen: '6.7 inch Super Retina XDR', processor: 'A17 Pro' },
  },
  {
    _id: 'prod-air-max',
    slug: 'nike-air-max-scarlet-premium',
    title: 'Nike Air Max Scarlet Premium',
    description: 'Featuring the iconic Air cushioning technology and a vibrant crimson mesh upper, these sneakers deliver elite streetwear style.',
    price: 149.99,
    discountPrice: 129,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600'],
    category: fallbackCategories[2],
    brand: 'Nike',
    stock: 40,
    ratings: 4.7,
    numOfReviews: 18,
    seller: { _id: 'seller-1', name: 'Apex Brands Seller', email: 'seller@novacart.com' },
    isFeatured: true,
    tags: ['nike', 'sneakers', 'airmax'],
    specifications: { size: 'US 10', color: 'Crimson Red', material: 'Mesh & Synthetic' },
  },
  {
    _id: 'prod-hoodie',
    slug: 'french-terry-oversized-hoodie',
    title: 'French Terry Oversized Hoodie',
    description: 'Crafted from ultra-soft 450gsm French Terry cotton, this oversized hoodie offers premium comfort.',
    price: 85,
    discountPrice: 65,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600'],
    category: fallbackCategories[1],
    brand: 'NovaWear',
    stock: 30,
    ratings: 4.5,
    numOfReviews: 9,
    seller: { _id: 'seller-1', name: 'Apex Brands Seller', email: 'seller@novacart.com' },
    isFeatured: false,
    tags: ['hoodie', 'apparel', 'fashion'],
    specifications: { size: 'L', color: 'Heather Gray', material: '100% Cotton' },
  },
];

const fallbackReviews = [
  {
    _id: 'review-1',
    product: 'prod-wh-1000xm5',
    rating: 5,
    comment: 'Excellent sound quality and perfect comfort.',
    createdAt: '2025-01-20T12:00:00.000Z',
    user: { _id: 'user-customer', name: 'Alex Johnson', avatar: '' },
  },
];

const fallbackUsers = [
  {
    id: 'fallback-admin',
    _id: 'fallback-admin',
    name: 'Nova Admin',
    email: 'admin@novacart.com',
    password: 'password123',
    role: 'admin',
    avatar: '',
    phoneNumber: '',
    addresses: [],
    isVerified: true,
    token: 'fallback-admin-token',
  },
  {
    id: 'fallback-seller',
    _id: 'fallback-seller',
    name: 'Apex Brands Seller',
    email: 'seller@novacart.com',
    password: 'password123',
    role: 'seller',
    avatar: '',
    phoneNumber: '',
    addresses: [],
    isVerified: true,
    token: 'fallback-seller-token',
  },
  {
    id: 'fallback-customer',
    _id: 'fallback-customer',
    name: 'Alex Johnson',
    email: 'customer@novacart.com',
    password: 'password123',
    role: 'customer',
    avatar: '',
    phoneNumber: '',
    addresses: [
      {
        _id: 'addr-1',
        street: '455 Broadway St',
        city: 'New York',
        state: 'NY',
        zipCode: '10013',
        country: 'United States',
        isDefault: true,
      },
    ],
    isVerified: true,
    token: 'fallback-customer-token',
  },
];

const normalizeCategory = (category) => ({ ...category });
const normalizeProduct = (product) => ({ ...product, category: product.category && typeof product.category === 'object' ? product.category : null });

const getFallbackCategories = () => fallbackCategories.map(normalizeCategory);

const getFallbackProducts = (query = {}) => {
  let items = fallbackProducts.map(normalizeProduct);
  const reqQuery = { ...query };

  if (reqQuery.search) {
    const search = reqQuery.search.toLowerCase();
    items = items.filter((product) => `${product.title} ${product.description} ${product.brand} ${product.tags.join(' ')}`.toLowerCase().includes(search));
  }

  if (reqQuery.category) {
    items = items.filter((product) => product.category?._id === reqQuery.category || product.category?.slug === reqQuery.category);
  }

  if (reqQuery.minPrice) {
    items = items.filter((product) => product.price >= Number(reqQuery.minPrice));
  }

  if (reqQuery.maxPrice) {
    items = items.filter((product) => product.price <= Number(reqQuery.maxPrice));
  }

  if (reqQuery.rating) {
    items = items.filter((product) => product.ratings >= Number(reqQuery.rating));
  }

  if (reqQuery.isFeatured === 'true') {
    items = items.filter((product) => product.isFeatured);
  }

  if (reqQuery.hasDiscount === 'true') {
    items = items.filter((product) => Number(product.discountPrice) > 0);
  }

  if (reqQuery.inStock === 'true') {
    items = items.filter((product) => product.stock > 0);
  }

  if (reqQuery.sort) {
    const sortValue = reqQuery.sort;
    if (sortValue === 'price') {
      items.sort((a, b) => a.price - b.price);
    } else if (sortValue === '-price') {
      items.sort((a, b) => b.price - a.price);
    } else if (sortValue === '-ratings') {
      items.sort((a, b) => b.ratings - a.ratings);
    } else if (sortValue === '-numOfReviews') {
      items.sort((a, b) => b.numOfReviews - a.numOfReviews);
    } else {
      items.sort((a, b) => b.createdAt?.localeCompare(a.createdAt || '') || 0);
    }
  }

  const page = Number(reqQuery.page) || 1;
  const limit = Number(reqQuery.limit) || 12;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = items.length;
  const pagedItems = items.slice(startIndex, endIndex);

  const pagination = {};
  if (endIndex < total) pagination.next = { page: page + 1, limit };
  if (startIndex > 0) pagination.prev = { page: page - 1, limit };

  return { data: pagedItems, total, pagination };
};

const getFallbackProduct = (idOrSlug) => {
  const product = fallbackProducts.find((item) => item._id === idOrSlug || item.slug === idOrSlug);
  return product ? normalizeProduct(product) : null;
};

const getFallbackAutocomplete = (search) => {
  if (!search) return [];
  return fallbackProducts
    .filter((product) => `${product.title} ${product.brand}`.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 8)
    .map((product) => ({
      _id: product._id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      brand: product.brand,
      price: product.price,
      images: product.images,
    }));
};

const getFallbackProductsByIds = (ids = []) => fallbackProducts.filter((product) => ids.includes(product._id)).map(normalizeProduct);

const getFallbackReviews = (productId) => fallbackReviews.filter((review) => review.product === productId);

const authenticateFallbackUser = (email, password) => {
  const user = fallbackUsers.find((entry) => entry.email === email);
  if (!user || user.password !== password) return null;
  return {
    user: {
      id: user.id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
      addresses: user.addresses,
      isVerified: user.isVerified,
    },
    accessToken: user.token,
  };
};

const getFallbackUserByToken = (token) => {
  const user = fallbackUsers.find((entry) => entry.token === token);
  if (!user) return null;
  return {
    id: user.id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phoneNumber: user.phoneNumber,
    addresses: user.addresses,
    isVerified: user.isVerified,
  };
};

const getFallbackUserById = (id) => {
  const user = fallbackUsers.find((entry) => entry.id === id || entry._id === id);
  if (!user) return null;
  return {
    id: user.id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phoneNumber: user.phoneNumber,
    addresses: user.addresses,
    isVerified: user.isVerified,
  };
};

const updateFallbackUser = (id, updates) => {
  const target = fallbackUsers.find((entry) => entry.id === id || entry._id === id);
  if (!target) return null;
  Object.assign(target, updates);
  return getFallbackUserById(id);
};

const addFallbackAddress = (id, address) => {
  const target = fallbackUsers.find((entry) => entry.id === id || entry._id === id);
  if (!target) return null;
  target.addresses = target.addresses || [];
  target.addresses.push(address);
  return target.addresses;
};

const deleteFallbackAddress = (id, addressId) => {
  const target = fallbackUsers.find((entry) => entry.id === id || entry._id === id);
  if (!target) return null;
  target.addresses = (target.addresses || []).filter((address) => address._id !== addressId);
  return target.addresses;
};

module.exports = {
  getFallbackCategories,
  getFallbackProducts,
  getFallbackProduct,
  getFallbackAutocomplete,
  getFallbackProductsByIds,
  getFallbackReviews,
  authenticateFallbackUser,
  getFallbackUserByToken,
  getFallbackUserById,
  updateFallbackUser,
  addFallbackAddress,
  deleteFallbackAddress,
};

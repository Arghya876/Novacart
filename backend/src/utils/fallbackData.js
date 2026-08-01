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

const fallbackProducts = [];

const fallbackReviews = [];

const fallbackUsers = [
  {
    id: 'fallback-admin',
    _id: 'fallback-admin',
    name: 'Nova Admin',
    email: 'novacart876admin@gmail.com',
    password: 'xeyeyxrd7q',
    role: 'admin',
    avatar: '',
    phoneNumber: '',
    addresses: [],
    isVerified: true,
    token: 'fallback-admin-token',
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

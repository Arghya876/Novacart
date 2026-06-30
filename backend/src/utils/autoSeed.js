const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const Order = require('../models/Order');

const autoSeed = async () => {
  try {
    // Check if we already seeded the new products to avoid infinite loop / redundant seeding on every restart
    const hasNewProduct = await Product.findOne({ title: 'Sony Alpha 7 IV Mirrorless Camera' });
    if (hasNewProduct) {
      console.log('[Auto-Seeder] Database already contains new products. Skipping seeding.');
      return;
    }

    console.log('[Auto-Seeder] Starting database seeding...');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Coupon.deleteMany();
    await Review.deleteMany();
    await Order.deleteMany();
    console.log('[Auto-Seeder] Existing data cleared.');

    // Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'Nova Admin',
      email: 'admin@novacart.com',
      password: 'password123',
      role: 'admin',
      isVerified: true,
    });

    const seller = await User.create({
      name: 'Apex Brands Seller',
      email: 'seller@novacart.com',
      password: 'password123',
      role: 'seller',
      isVerified: true,
    });

    const customer = await User.create({
      name: 'Alex Johnson',
      email: 'customer@novacart.com',
      password: 'password123',
      role: 'customer',
      isVerified: true,
      addresses: [
        {
          street: '455 Broadway St',
          city: 'New York',
          state: 'NY',
          zipCode: '10013',
          country: 'United States',
          isDefault: true,
        }
      ]
    });

    console.log('[Auto-Seeder] Users created.');

    // Create Categories
    const electronics = await Category.create({
      name: 'electronics',
      description: 'Premium electronic gadgets, smartphones, and audio gear.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
    });

    const fashion = await Category.create({
      name: 'fashion',
      description: 'Designer apparel and high-fashion streetwear.',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600',
    });

    const footwear = await Category.create({
      name: 'footwear',
      description: 'Athletic sneakers, casual shoes, and premium boots.',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
    });

    const home = await Category.create({
      name: 'home',
      description: 'Modern furniture, minimalist decor, and lighting.',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600',
    });

    console.log('[Auto-Seeder] Categories created.');

    // Create Products
    await Product.create([
      {
        title: 'Sony WH-1000XM5 ANC Headphones',
        description: 'Industry-leading noise canceling wireless over-ear headphones with auto noise canceling optimizer, crystal clear hands-free calling, and Alexa voice control.',
        price: 399.99,
        discountPrice: 349.99,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=600',
        ],
        category: electronics._id,
        brand: 'Sony',
        stock: 25,
        ratings: 4.8,
        numOfReviews: 12,
        seller: seller._id,
        isFeatured: true,
        tags: ['headphones', 'audio', 'wireless', 'anc', 'sony'],
        specifications: {
          battery: '30 Hours',
          connectivity: 'Bluetooth 5.2',
          weight: '250g',
        },
      },
      {
        title: 'iPhone 15 Pro Max Titanium',
        description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
        price: 1199.99,
        images: [
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=600',
        ],
        category: electronics._id,
        brand: 'Apple',
        stock: 15,
        ratings: 4.9,
        numOfReviews: 8,
        seller: seller._id,
        isFeatured: true,
        tags: ['iphone', 'smartphone', 'apple', 'titanium', 'mobile'],
        specifications: {
          storage: '256GB',
          screen: '6.7 inch Super Retina XDR',
          processor: 'A17 Pro',
        },
      },
      {
        title: 'Sony Alpha 7 IV Mirrorless Camera',
        description: 'The ultimate hybrid mirrorless camera featuring a 33MP full-frame sensor, 4K 60p video, advanced real-time autofocus, and exceptional low-light performance.',
        price: 2499.99,
        discountPrice: 2299.99,
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
        ],
        category: electronics._id,
        brand: 'Sony',
        stock: 8,
        ratings: 4.9,
        numOfReviews: 15,
        seller: seller._id,
        isFeatured: true,
        tags: ['camera', 'mirrorless', 'sony', 'photography', '4k'],
        specifications: {
          sensor: '33MP Full-Frame Exmor R CMOS',
          video: '4K 60p 10-bit 4:2:2',
          mount: 'Sony E-mount',
        },
      },
      {
        title: 'Keychron Q1 Pro Mechanical Keyboard',
        description: 'A full metal QMK/VIA wireless custom mechanical keyboard, featuring double-gasket design, CNC aluminum body, and hot-swappable switches.',
        price: 199.99,
        images: [
          'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600',
        ],
        category: electronics._id,
        brand: 'Keychron',
        stock: 30,
        ratings: 4.7,
        numOfReviews: 10,
        seller: seller._id,
        isFeatured: false,
        tags: ['keyboard', 'mechanical', 'wireless', 'custom', 'keychron'],
        specifications: {
          layout: '75% Layout',
          switches: 'Keychron K Pro Red (Linear)',
          material: 'Full CNC Aluminum Body',
        },
      },
      {
        title: 'Nike Air Max Scarlet Premium',
        description: 'Featuring the iconic Air cushioning technology and a vibrant crimson mesh upper, these sneakers deliver all-day comfort and elite streetwear style.',
        price: 149.99,
        discountPrice: 129.00,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
        ],
        category: footwear._id,
        brand: 'Nike',
        stock: 40,
        ratings: 4.7,
        numOfReviews: 18,
        seller: seller._id,
        isFeatured: true,
        tags: ['nike', 'sneakers', 'airmax', 'running', 'shoes'],
        specifications: {
          size: 'US 10',
          color: 'Crimson Red',
          material: 'Mesh & Synthetic',
        },
      },
      {
        title: 'Adidas Ultraboost 1.0 Sneakers',
        description: 'From a walk in the park to a weekend run with friends, these Adidas Ultraboost 1.0 shoes are designed to keep you comfortable. Adidas PRIMEKNIT upper gently hugs your feet.',
        price: 189.99,
        discountPrice: 159.99,
        images: [
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600',
        ],
        category: footwear._id,
        brand: 'Adidas',
        stock: 20,
        ratings: 4.8,
        numOfReviews: 24,
        seller: seller._id,
        isFeatured: false,
        tags: ['adidas', 'sneakers', 'ultraboost', 'boost', 'shoes'],
        specifications: {
          size: 'US 9.5',
          color: 'Cloud White',
          upper: 'Adidas PRIMEKNIT Textile',
        },
      },
      {
        title: 'Minimalist Oak Coffee Table',
        description: 'Handcrafted from solid white oak, this minimalist coffee table brings organic warmth and mid-century modern elegance to any living room space.',
        price: 299.00,
        images: [
          'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600',
        ],
        category: home._id,
        brand: 'NovaHome',
        stock: 8,
        ratings: 4.6,
        numOfReviews: 5,
        seller: seller._id,
        isFeatured: false,
        tags: ['table', 'wood', 'oak', 'furniture', 'livingroom'],
        specifications: {
          dimensions: '40"W x 20"D x 16"H',
          material: 'Solid White Oak',
          assembly: 'No assembly required',
        },
      },
      {
        title: 'Dyson V15 Detect Cordless Vacuum',
        description: 'Dyson\'s most powerful, intelligent cordless vacuum. Laser reveals microscopic dust. Intelligently optimizes suction and run time based on dust level and floor type.',
        price: 749.99,
        discountPrice: 699.99,
        images: [
          'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=600',
        ],
        category: home._id,
        brand: 'Dyson',
        stock: 12,
        ratings: 4.8,
        numOfReviews: 14,
        seller: seller._id,
        isFeatured: true,
        tags: ['vacuum', 'dyson', 'cordless', 'home', 'appliance'],
        specifications: {
          runtime: 'Up to 60 minutes',
          weight: '6.8 lbs',
          binVolume: '0.2 gallons',
        },
      },
      {
        title: 'French Terry Oversized Hoodie',
        description: 'Crafted from ultra-soft 450gsm French Terry cotton, this oversized hoodie offers the perfect drape, durability, and premium comfort.',
        price: 85.00,
        discountPrice: 65.00,
        images: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600',
        ],
        category: fashion._id,
        brand: 'NovaWear',
        stock: 30,
        ratings: 4.5,
        numOfReviews: 9,
        seller: seller._id,
        isFeatured: false,
        tags: ['hoodie', 'apparel', 'fashion', 'cotton', 'streetwear'],
        specifications: {
          size: 'L',
          color: 'Heather Gray',
          material: '100% Cotton',
        },
      },
      {
        title: 'Minimalist Leather Bifold Wallet',
        description: 'Handcrafted from premium full-grain vegetable-tanned leather, this slim bifold wallet fits up to 8 cards and flat bills without adding bulk to your pocket.',
        price: 55.00,
        images: [
          'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600',
        ],
        category: fashion._id,
        brand: 'NovaWear',
        stock: 50,
        ratings: 4.6,
        numOfReviews: 7,
        seller: seller._id,
        isFeatured: false,
        tags: ['wallet', 'leather', 'accessories', 'fashion', 'minimalist'],
        specifications: {
          slots: '6 Card Slots & 1 Bill Section',
          material: 'Full-Grain Vegetable Tanned Leather',
          dimensions: '4.3" x 3.2" x 0.4"',
        },
      }
    ]);

    console.log('[Auto-Seeder] Products created.');

    // Create Coupons
    await Coupon.create([
      {
        code: 'NOVACART10',
        discountType: 'percentage',
        discountAmount: 10,
        minActiveValue: 50,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: 'WELCOME25',
        discountType: 'fixed',
        discountAmount: 25,
        minActiveValue: 100,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        isActive: true,
      }
    ]);

    console.log('[Auto-Seeder] Coupons created.');
    console.log('[Auto-Seeder] Database Seeded Successfully!');
  } catch (error) {
    console.error('[Auto-Seeder] Seeding failed:', error);
  }
};

module.exports = autoSeed;

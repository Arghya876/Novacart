require('dotenv').config({ path: `${__dirname}/../.env` });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Coupon = require('./models/Coupon');
const Review = require('./models/Review');
const Order = require('./models/Order');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/novacart', {
      maxPoolSize: 1,
    });
    console.log('MongoDB Connected for seeding...');

    // Create Admin user if not exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      await User.create({
        name: 'Nova Admin',
        email: 'novacart876admin@gmail.com',
        password: 'xeyeyxrd7q',
        role: 'admin',
        isVerified: true,
      });
      console.log('Admin User Seeded...');
    }

    // Ensure Categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      await Category.create([
        {
          name: 'electronics',
          description: 'Premium electronic gadgets, smartphones, and audio gear.',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
        },
        {
          name: 'fashion',
          description: 'Designer apparel and high-fashion streetwear.',
          image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600',
        },
        {
          name: 'footwear',
          description: 'Athletic sneakers, casual shoes, and premium boots.',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
        },
        {
          name: 'home',
          description: 'Modern furniture, minimalist decor, and lighting.',
          image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600',
        },
      ]);
      console.log('Categories Seeded...');
    }

    console.log('Seeder process finished without demo data.');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();

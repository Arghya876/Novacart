const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');

const autoSeed = async () => {
  try {
    // Check if admin user exists, if not create admin user
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      await User.create({
        name: 'Nova Admin',
        email: 'novacart876admin@gmail.com',
        password: 'xeyeyxrd7q',
        role: 'admin',
        isVerified: true,
      });
      console.log('[Auto-Seeder] Admin user created.');
    }

    // Ensure basic categories exist if database has no categories
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
      console.log('[Auto-Seeder] Base categories created.');
    }
  } catch (error) {
    console.error('[Auto-Seeder] Error during initialization:', error);
  }
};

module.exports = autoSeed;

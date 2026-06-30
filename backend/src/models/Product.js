const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a product title'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a product price'],
      min: [0, 'Price must be positive'],
    },
    discountPrice: {
      type: Number,
      default: 0,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: 'Discount price must be lower than original price',
      },
    },
    images: {
      type: [String],
      required: [true, 'Please upload at least one image'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify a category'],
    },
    brand: {
      type: String,
      required: [true, 'Please specify a brand'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Please add available stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    ratings: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A seller must be assigned to this product'],
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    tags: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create product slug from the title
ProductSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

// Text indexes for advanced search capabilities
ProductSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });

module.exports = mongoose.model('Product', ProductSchema);

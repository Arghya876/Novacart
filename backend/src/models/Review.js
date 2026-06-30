const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please add a review comment'],
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent user from submitting more than one review per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to get avg rating and update product details
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const obj = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj.length > 0) {
      await this.model('Product').findByIdAndUpdate(productId, {
        ratings: Math.round(obj[0].averageRating * 10) / 10,
        numOfReviews: obj[0].numOfReviews,
      });
    } else {
      await this.model('Product').findByIdAndUpdate(productId, {
        ratings: 0,
        numOfReviews: 0,
      });
    }
  } catch (err) {
    console.error('Error updating average rating:', err);
  }
};

// Call calculateAverageRating after save
ReviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

// Call calculateAverageRating after delete
ReviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.product);
  }
});

module.exports = mongoose.model('Review', ReviewSchema);

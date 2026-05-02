const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true },
  discount: { type: Number, required: true },
  availability: { type: String, required: true },
  company: { type: String, required: true },
  category: { type: String, required: true },
  fetchedAt: { type: Date, default: Date.now, expires: 3600 } // 1 hour TTL
});

productSchema.index({ productName: 1, company: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);

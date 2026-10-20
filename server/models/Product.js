import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    image: { type: String, required: true },
    description: { type: String, required: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

export default Product;

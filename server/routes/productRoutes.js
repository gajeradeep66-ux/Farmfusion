import express from 'express';
import Product from '../models/Product.js';
import { createProductImage, isCategoryPhoto } from '../seedData.js';

const normalizeProductImage = (product) => {
  if (!product.image || product.image.startsWith('data:image/svg+xml') || product.image.startsWith('/images/') || isCategoryPhoto(product.image)) {
    product.image = createProductImage(product.name, product.category || 'Seeds');
  }

  return product;
};

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filters = {};

    if (category) filters.category = category;
    if (featured === 'true') filters.featured = true;

    const products = await Product.find(filters).sort({ createdAt: -1 });
    res.json(products.map((product) => normalizeProductImage(product.toObject ? product.toObject() : product)));
  } catch (error) {
    res.status(500).json({ message: 'Failed to load products', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(normalizeProductImage(product.toObject ? product.toObject() : product));
  } catch (error) {
    res.status(500).json({ message: 'Product request failed', error: error.message });
  }
});

export default router;

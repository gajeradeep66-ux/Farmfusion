import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import SiteContent from '../models/SiteContent.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { createProductImage, isCategoryPhoto, productCategories } from '../seedData.js';

const router = express.Router();
const orderStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsPath = path.resolve(__dirname, '../../uploads/products');
const imageExtensions = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
]);
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      fs.mkdir(uploadsPath, { recursive: true }, (error) => callback(error, uploadsPath));
    },
    filename: (req, file, callback) => callback(null, `${randomUUID()}${imageExtensions.get(file.mimetype) || '.jpg'}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!imageExtensions.has(file.mimetype)) {
      callback(new Error('Use a JPG, PNG, WebP or AVIF image'));
      return;
    }
    callback(null, true);
  },
});

const hasValidImageSignature = async (file) => {
  const bytes = await fs.promises.readFile(file.path);
  if (file.mimetype === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.mimetype === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (file.mimetype === 'image/webp') return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (file.mimetype === 'image/avif') return bytes.toString('ascii', 4, 8) === 'ftyp' && /avif|avis/.test(bytes.toString('ascii', 8, 64));
  return false;
};

router.use(protect, adminOnly);

router.get('/summary', async (req, res) => {
  try {
    const [products, orders, users] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
    ]);

    const revenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    res.json({
      products,
      orders,
      users,
      revenue: revenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Summary unavailable', error: error.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user', 'name email').lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch orders', error: error.message });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!orderStatuses.includes(status)) {
      return res.status(400).json({ message: 'Choose a valid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.status === 'Payment failed' || (order.paymentMethod === 'razorpay' && order.paymentStatus !== 'paid')) {
      return res.status(409).json({ message: 'Only confirmed orders can be updated' });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Could not update order status', error: error.message });
  }
});

router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    res.json(products.map((product) => (
      isCategoryPhoto(product.image)
        ? { ...product, image: createProductImage(product.name, product.category) }
        : product
    )));
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch products', error: error.message });
  }
});

router.post('/upload', (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }
    next();
  });
}, async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Choose an image to upload' });
  }
  try {
    if (!await hasValidImageSignature(req.file)) {
      await fs.promises.unlink(req.file.path);
      return res.status(400).json({ message: 'The selected file is not a valid image of the chosen type' });
    }
  } catch (error) {
    await fs.promises.unlink(req.file.path).catch(() => {});
    return next(error);
  }
  res.status(201).json({ image: `/uploads/products/${req.file.filename}` });
});

router.post('/products', async (req, res) => {
  try {
    const { name, category, price, stock, image, description } = req.body;

    if (!name?.trim() || !productCategories.includes(category) || !description?.trim()) {
      return res.status(400).json({ message: 'Please fill all product fields' });
    }
    if (!Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ message: 'Enter a valid price and whole-number stock quantity' });
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = await Product.create({
      name: cleanName,
      slug,
      category,
      price: Number(price),
      stock: Number(stock),
      image: image || createProductImage(cleanName, category),
      description: description.trim(),
      featured: Boolean(req.body.featured),
    });

    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A product with this name already exists' });
    }
    res.status(500).json({ message: 'Product creation failed', error: error.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { name, category, price, stock, image, description } = req.body;

    if (!name?.trim() || !productCategories.includes(category) || !description?.trim()) {
      return res.status(400).json({ message: 'Please fill all product fields' });
    }
    if (!Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ message: 'Enter a valid price and whole-number stock quantity' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name.trim();
    product.category = category;
    product.price = Number(price);
    product.stock = Number(stock);
    product.image = image || createProductImage(name.trim(), category);
    product.description = description.trim();
    product.featured = Boolean(req.body.featured);
    product.slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await product.save();
    res.json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A product with this name already exists' });
    }
    res.status(500).json({ message: 'Product update failed', error: error.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' })
      .select('name email isActive createdAt')
      .sort({ createdAt: -1 })
      .lean();
    res.json(users.map((user) => ({ ...user, isActive: user.isActive !== false })));
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch users', error: error.message });
  }
});

router.patch('/users/:id/status', async (req, res) => {
  try {
    if (typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ message: 'Choose whether to enable or disable this account' });
    }
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'customer' },
      { isActive: req.body.isActive },
      { returnDocument: 'after', runValidators: true }
    ).select('name email isActive');
    if (!user) {
      return res.status(404).json({ message: 'Customer account not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Could not update account status', error: error.message });
  }
});

router.put('/about', async (req, res) => {
  try {
    const { title, story, contactEmail, image } = req.body;
    if (!title?.trim() || !story?.trim() || !contactEmail?.trim()) {
      return res.status(400).json({ message: 'Title, about text and contact email are required' });
    }
    const content = await SiteContent.findOneAndUpdate(
      { key: 'about' },
      {
        title: title.trim(),
        story: story.trim(),
        contactEmail: contactEmail.trim().toLowerCase(),
        image: image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=90',
      },
      { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Could not save About page', error: error.message });
  }
});

export default router;

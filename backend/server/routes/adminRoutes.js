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
import Coupon from '../models/Coupon.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { createProductImage, isCategoryPhoto, productCategories } from '../seedData.js';
import { v2 as cloudinary } from 'cloudinary';

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

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
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'farmfusion/products',
      });
      await fs.promises.unlink(req.file.path).catch(() => {});
      return res.status(201).json({ image: uploadResult.secure_url });
    }
  } catch (cloudinaryError) {
    console.warn('Cloudinary upload failed, falling back to local storage:', cloudinaryError.message);
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

/* ── Coupon Management for Admin ────────────────────────────── */
const DEFAULT_COUPONS = [
  { code: 'KISAN10', discountPercent: 10, minCartAmount: 0, days: 60, description: 'All Farmers Special Welcome Gift', targetType: 'all' },
  { code: 'GROWER15', discountPercent: 15, minCartAmount: 499, days: 45, description: 'Certified Seeds & Bio-Nutrition Pack', targetType: 'all' },
  { code: 'AGRI20', discountPercent: 20, minCartAmount: 999, days: 30, description: 'Seasonal Agriculture Bulk Discount', targetType: 'all' },
  { code: 'DHARTI25', discountPercent: 25, minCartAmount: 1499, days: 30, description: 'Soil Health & Organic Booster Deal', targetType: 'all' },
  { code: 'HARVEST30', discountPercent: 30, minCartAmount: 1999, days: 30, description: 'Harvest Season Mega Order Savings', targetType: 'all' },
  { code: 'SEEDS10', discountPercent: 10, minCartAmount: 299, days: 60, description: 'Lab-Tested Hybrid Seeds Discount', targetType: 'all' },
  { code: 'MONSOON20', discountPercent: 20, minCartAmount: 799, days: 45, description: 'Monsoon Sowing Field Ready Offer', targetType: 'all' },
  { code: 'FERT15', discountPercent: 15, minCartAmount: 599, days: 45, description: 'Eco-Friendly Plant Food & Fertilizers', targetType: 'all' },
  { code: 'BIO25', discountPercent: 25, minCartAmount: 1299, days: 30, description: 'Bio-Pesticides & Natural Crop Protection', targetType: 'all' },
  { code: 'RABI20', discountPercent: 20, minCartAmount: 899, days: 60, description: 'Rabi Crop Planting Exclusive Code', targetType: 'all' },
  { code: 'KHARIF15', discountPercent: 15, minCartAmount: 699, days: 60, description: 'Kharif Harvest Quality Protection Promo', targetType: 'all' },
  { code: 'TOOLSFARM10', discountPercent: 10, minCartAmount: 450, days: 45, description: 'Durable Farm Tools & Equipment Saver', targetType: 'all' },
  { code: 'SMARTFARM20', discountPercent: 20, minCartAmount: 999, days: 30, description: 'Drip & Smart Water Conserving Tools', targetType: 'all' },
  { code: 'VIPFARM25', discountPercent: 25, minCartAmount: 1500, days: 45, description: 'Loyal Field Grower VIP Reward', targetType: 'all' },
  { code: 'FUSION35', discountPercent: 35, minCartAmount: 2499, days: 30, description: 'FarmFusion Elite Community Promo', targetType: 'all' },
  { code: 'SPECIAL50', discountPercent: 50, minCartAmount: 3999, days: 15, description: 'Annual Grand Kisan Bumper Offer', targetType: 'all' },
];

const seedDefaultCoupons = async () => {
  for (const c of DEFAULT_COUPONS) {
    const exists = await Coupon.findOne({ code: c.code });
    if (!exists) {
      const exp = new Date();
      exp.setDate(exp.getDate() + c.days);
      await Coupon.create({
        code: c.code,
        discountPercent: c.discountPercent,
        minCartAmount: c.minCartAmount,
        expiresAt: exp,
        description: c.description,
        targetType: c.targetType || 'all',
        allowedEmail: '',
        isActive: true,
      });
    }
  }
};

router.get('/coupons', async (req, res) => {
  try {
    const count = await Coupon.countDocuments();
    if (count < 10) {
      await seedDefaultCoupons();
    }
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch coupons', error: error.message });
  }
});

router.post('/coupons/seed', async (req, res) => {
  try {
    await seedDefaultCoupons();
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ message: 'Default standard coupons verified/created successfully', count: coupons.length, coupons });
  } catch (error) {
    res.status(500).json({ message: 'Could not seed default coupons', error: error.message });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const { code, discountPercent, minCartAmount, expiresAt, description, targetType, allowedEmail, assignedUserName } = req.body;
    if (!code || !discountPercent || !expiresAt) {
      return res.status(400).json({ message: 'Code, discount percentage, and expiry date are required.' });
    }

    const trimmedCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: trimmedCode });
    if (existing) {
      return res.status(409).json({ message: `Coupon '${trimmedCode}' already exists.` });
    }

    const isTargetSelected = targetType === 'selected';

    const coupon = await Coupon.create({
      code: trimmedCode,
      discountPercent: Number(discountPercent),
      minCartAmount: Number(minCartAmount || 0),
      expiresAt: new Date(expiresAt),
      description: description?.trim() || '',
      targetType: isTargetSelected ? 'selected' : 'all',
      allowedEmail: isTargetSelected && allowedEmail ? allowedEmail.trim().toLowerCase() : '',
      assignedUserName: isTargetSelected && assignedUserName ? assignedUserName.trim() : '',
      isActive: true,
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Could not create coupon', error: error.message });
  }
});

router.patch('/coupons/:id/assign', async (req, res) => {
  try {
    const { targetType, allowedEmail, assignedUserName } = req.body;
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    coupon.targetType = targetType === 'selected' ? 'selected' : 'all';
    if (coupon.targetType === 'selected') {
      const email = allowedEmail ? allowedEmail.trim().toLowerCase() : '';
      coupon.allowedEmail = email;
      if (!Array.isArray(coupon.allowedEmails)) coupon.allowedEmails = [];
      if (email && !coupon.allowedEmails.includes(email)) coupon.allowedEmails.push(email);
      coupon.assignedUserName = assignedUserName ? assignedUserName.trim() : '';
    } else {
      coupon.allowedEmail = '';
      coupon.allowedEmails = [];
      coupon.assignedUserName = '';
    }

    await coupon.save();
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Could not assign coupon', error: error.message });
  }
});

router.post('/coupons/dispatch', async (req, res) => {
  try {
    const { couponTarget, selectedCouponIds, userTarget, allowedEmail, assignedUserName } = req.body;

    let targetCoupons = [];
    if (couponTarget === 'all') {
      targetCoupons = await Coupon.find({});
    } else {
      if (!Array.isArray(selectedCouponIds) || selectedCouponIds.length === 0) {
        return res.status(400).json({ message: 'Please select at least one coupon to dispatch.' });
      }
      targetCoupons = await Coupon.find({ _id: { $in: selectedCouponIds } });
    }

    if (!targetCoupons.length) {
      return res.status(404).json({ message: 'No matching coupons found to dispatch.' });
    }

    const isSelectedUser = userTarget === 'selected';
    const email = isSelectedUser && allowedEmail ? allowedEmail.trim().toLowerCase() : '';
    const name = isSelectedUser && assignedUserName ? assignedUserName.trim() : '';

    if (isSelectedUser && !email) {
      return res.status(400).json({ message: 'Please select or enter a customer email address.' });
    }

    const updated = [];
    for (const c of targetCoupons) {
      if (isSelectedUser) {
        c.targetType = 'selected';
        c.allowedEmail = email;
        if (!Array.isArray(c.allowedEmails)) c.allowedEmails = [];
        if (!c.allowedEmails.includes(email)) {
          c.allowedEmails.push(email);
        }
        if (name) c.assignedUserName = name;
      } else {
        c.targetType = 'all';
        c.allowedEmail = '';
        c.allowedEmails = [];
        c.assignedUserName = '';
      }
      await c.save();
      updated.push(c);
    }

    const allCoupons = await Coupon.find().sort({ createdAt: -1 });

    const message = isSelectedUser
      ? `✓ Successfully sent ${updated.length} coupon(s) to ${name ? `${name} (${email})` : email}!`
      : `✓ Successfully broadcasted ${updated.length} coupon(s) to All Customers!`;

    res.json({
      message,
      count: updated.length,
      coupons: allCoupons,
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not dispatch coupons', error: error.message });
  }
});

router.post('/coupons/auto', async (req, res) => {
  try {
    const prefixes = ['KISAN', 'HARVEST', 'FARM', 'AGRI', 'SOIL', 'DHARTI', 'SEEDS', 'GROW'];
    const discounts = [10, 15, 20, 25, 30];
    const daysOptions = [7, 14, 30, 45];

    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomDiscount = discounts[Math.floor(Math.random() * discounts.length)];
    const randomDays = daysOptions[Math.floor(Math.random() * daysOptions.length)];
    const randomSuffix = Math.floor(10 + Math.random() * 90);

    const generatedCode = `${randomPrefix}${randomDiscount}_${randomSuffix}`.toUpperCase();

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + randomDays);

    const coupon = await Coupon.create({
      code: generatedCode,
      discountPercent: randomDiscount,
      minCartAmount: randomDiscount >= 20 ? 499 : 0,
      expiresAt: expiryDate,
      description: `Auto-generated ${randomDiscount}% seasonal grower promo`,
      targetType: 'all',
      allowedEmail: '',
      isActive: true,
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Could not auto-generate coupon', error: error.message });
  }
});

router.patch('/coupons/:id/toggle', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Could not update coupon', error: error.message });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete coupon', error: error.message });
  }
});

export default router;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aboutRoutes from './routes/aboutRoutes.js';
import Product from './models/Product.js';
import User from './models/User.js';
import { createProductImage, seedProducts } from './seedData.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 7854);
const uploadsPath = path.resolve(__dirname, '../uploads');

const configuredFrontendOrigin = process.env.FRONTEND_URL
  ? new URL(
    process.env.FRONTEND_URL.startsWith('http')
      ? process.env.FRONTEND_URL
      : `https://${process.env.FRONTEND_URL}`
  ).origin
  : undefined;
const allowedOrigins = [
  configuredFrontendOrigin,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsPath));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FarmFusion API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/about', aboutRoutes);

const ensureDefaultData = async () => {
  for (const seed of seedProducts) {
    await Product.updateOne(
      { slug: seed.slug },
      { $setOnInsert: seed },
      { upsert: true, runValidators: true }
    );
  }

  const products = await Product.find({});
  for (const product of products) {
    const staleImage = !product.image ||
      product.image.startsWith('data:image/svg+xml') ||
      product.image.startsWith('/images/');
    if (staleImage) {
      product.image = createProductImage(product.name, product.category);
      await product.save();
    }
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@farmfusion.com').toLowerCase();
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
      throw new Error('ADMIN_PASSWORD must be set before the initial admin account can be created.');
    }
    const bcrypt = (await import('bcryptjs')).default;
    await User.create({
      name: 'FarmFusion Admin',
      email: adminEmail,
      password: await bcrypt.hash(password, 10),
      role: 'admin',
      isActive: true,
    });
    console.log('Default admin user created');
  }
};

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET must be set in the environment before starting FarmFusion.');
    process.exit(1);
  }

  try {
    await connectDB();
    await ensureDefaultData();

    const productionMode = process.env.NODE_ENV === 'production';
    console.log(`FarmFusion mode: ${productionMode ? 'production' : 'development'}`);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`FarmFusion server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

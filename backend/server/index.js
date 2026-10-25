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

const parseOrigins = (raw) => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      try {
        const withProtocol = item.startsWith('http') ? item : `https://${item}`;
        return new URL(withProtocol).origin;
      } catch {
        return item.replace(/\/+$/, '');
      }
    });
};

const configuredOrigins = parseOrigins(process.env.FRONTEND_URL);
const defaultLocalOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
];
const allowedOrigins = new Set([...configuredOrigins, ...defaultLocalOrigins]);

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Server-to-server, health check, curl
  if (allowedOrigins.has(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    if (hostname.endsWith('.onrender.com')) return true;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  } catch {
    // Ignore invalid origin format
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsPath));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    name: 'FarmFusion API',
    message: 'FarmFusion Backend API is running successfully.',
    healthCheck: '/api/health',
    frontendUrl: process.env.FRONTEND_URL || 'https://farmfusion-web.onrender.com',
    timestamp: new Date().toISOString(),
  });
});

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
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin%4545';
  const bcrypt = (await import('bcryptjs')).default;
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      name: 'FarmFusion Admin',
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      role: 'admin',
      isActive: true,
    });
    console.log(`Default admin user created (${adminEmail})`);
  } else if (process.env.ADMIN_PASSWORD) {
    // Keep admin password synchronized with environment variable if configured
    const matches = await bcrypt.compare(adminPassword, existingAdmin.password);
    if (!matches) {
      existingAdmin.password = await bcrypt.hash(adminPassword, 10);
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log(`Admin password synchronized with ADMIN_PASSWORD for ${adminEmail}`);
    }
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

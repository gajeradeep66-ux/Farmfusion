import express from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const RAZORPAY_ORDERS_URL = 'https://api.razorpay.com/v1/orders';

const hasRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  const isPlaceholder = (value) => !value || /replace[_ -]?me|your[-_ ]razorpay|placeholder/i.test(value);
  return !isPlaceholder(keyId) && !isPlaceholder(keySecret);
};

const getRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!hasRazorpayCredentials()) {
    const error = new Error('Online payments are not configured. Please choose cash on delivery or contact support.');
    error.statusCode = 503;
    throw error;
  }
  return { keyId, keySecret };
};

router.get('/payment/config', (req, res) => {
  res.json({ onlinePaymentsEnabled: hasRazorpayCredentials() });
});

const buildOrderItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('Your cart is empty');
    error.statusCode = 400;
    throw error;
  }

  const orderItems = [];
  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      const error = new Error('Invalid item quantity');
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.findById(item.productId);
    if (!product) {
      const error = new Error('A product in your cart is no longer available');
      error.statusCode = 400;
      throw error;
    }
    if (product.stock < quantity) {
      const error = new Error(`${product.name} does not have enough stock`);
      error.statusCode = 409;
      throw error;
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity,
      price: product.price,
      image: product.image,
    });
  }

  return orderItems;
};

const validateShippingAddress = (address) => {
  const requiredFields = ['name', 'email', 'address', 'city', 'postalCode', 'country'];
  return address && requiredFields.every((field) => String(address[field] || '').trim());
};

const getTotal = (orderItems) =>
  Math.round(orderItems.reduce((total, item) => total + item.price * item.quantity, 0) * 100) / 100;

router.post('/payment/order', protect, async (req, res) => {
  try {
    const credentials = getRazorpayCredentials();
    if (!validateShippingAddress(req.body.shippingAddress)) {
      return res.status(400).json({ message: 'Please complete all delivery details' });
    }

    const orderItems = await buildOrderItems(req.body.items);
    const total = getTotal(orderItems);
    const gatewayResponse = await fetch(RAZORPAY_ORDERS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(total * 100),
        currency: 'INR',
        receipt: `ff-${Date.now()}-${req.user._id.toString().slice(-6)}`,
        notes: { userId: req.user._id.toString() },
      }),
    });
    const gatewayOrder = await gatewayResponse.json();
    if (!gatewayResponse.ok) {
      console.error('Razorpay order creation failed:', gatewayOrder.error?.description || gatewayResponse.status);
      return res.status(502).json({ message: 'Unable to start payment. Please try again.' });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      total,
      shippingAddress: req.body.shippingAddress,
      status: 'Payment pending',
      paymentMethod: 'razorpay',
      paymentStatus: 'pending',
      razorpayOrderId: gatewayOrder.id,
    });

    res.status(201).json({
      orderId: order._id,
      razorpayOrderId: gatewayOrder.id,
      amount: gatewayOrder.amount,
      currency: gatewayOrder.currency,
      keyId: credentials.keyId,
      storeName: 'FarmFusion',
      description: 'Farm essentials order',
      customer: {
        name: req.body.shippingAddress.name,
        email: req.body.shippingAddress.email,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : 'Unable to start payment' });
  }
});

router.post('/payment/verify', protect, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification details are missing' });
    }

    const { keyId, keySecret } = getRazorpayCredentials();
    const order = await Order.findOne({ user: req.user._id, razorpayOrderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found for this payment' });
    }
    if (order.paymentStatus === 'paid') {
      return res.json({ order, message: 'Payment already verified' });
    }

    const expectedSignature = createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest();
    const providedSignature = Buffer.from(razorpaySignature, 'hex');
    if (
      expectedSignature.length !== providedSignature.length ||
      !timingSafeEqual(expectedSignature, providedSignature)
    ) {
      return res.status(400).json({ message: 'Payment signature could not be verified' });
    }

    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpayPaymentId)}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      },
    });
    const payment = await paymentResponse.json();
    if (
      !paymentResponse.ok ||
      payment.order_id !== razorpayOrderId ||
      payment.amount !== Math.round(order.total * 100) ||
      payment.status !== 'captured'
    ) {
      return res.status(400).json({ message: 'Payment is not confirmed for this order' });
    }

    order.razorpayPaymentId = razorpayPaymentId;
    order.paymentStatus = 'paid';
    order.status = 'Processing';
    await order.save();

    res.json({ order, message: 'Payment verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to verify payment' });
  }
});

router.post('/payment/fail', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      user: req.user._id,
      razorpayOrderId: req.body.razorpayOrderId,
      paymentStatus: 'pending',
    });
    if (order) {
      order.paymentStatus = 'failed';
      order.status = 'Payment failed';
      await order.save();
    }
    res.json({ message: 'Payment attempt closed' });
  } catch (error) {
    res.status(500).json({ message: 'Could not update payment status' });
  }
});

const createOrder = async (req, res) => {
  try {
    if (!validateShippingAddress(req.body.shippingAddress)) {
      return res.status(400).json({ message: 'Please complete all delivery details' });
    }
    const orderItems = await buildOrderItems(req.body.items);

    // Check if customer chose an online payment (UPI, Card, Netbanking, Wallet, etc.)
    const isOnline = Boolean(
      req.body.isOnline ||
      req.body.paymentMethod === 'online' ||
      ['upi', 'card', 'netbanking', 'wallet', 'online', 'razorpay'].includes(req.body.paymentMethod)
    );

    const paymentMethod = isOnline
      ? (req.body.paymentMethod || 'online')
      : 'cod';

    // Online payments are paid immediately upon checkout! COD remains pending until delivered.
    const paymentStatus = isOnline ? 'paid' : 'pending';

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      total: getTotal(orderItems),
      shippingAddress: req.body.shippingAddress,
      status: 'Processing',
      paymentMethod,
      paymentStatus,
      transactionId: req.body.transactionId || (isOnline ? `FF_${Date.now()}` : undefined),
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : 'Order could not be placed',
    });
  }
};

router.post('/', protect, createOrder);
router.post('/cod', protect, createOrder);
router.post('/online', protect, createOrder);

router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch orders', error: error.message });
  }
});

export default router;

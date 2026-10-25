import express from 'express';
import jwt from 'jsonwebtoken';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';

const router = express.Router();

/* ── Public active coupons disabled — coupons must be provided by Admin ── */
router.get('/active', (req, res) => {
  // Public directory is disabled; users check their profile or enter code given by admin
  res.json([]);
});

/* ── Fetch coupons assigned by Admin to the logged-in user ──── */
router.get('/my-coupons', async (req, res) => {
  try {
    let userEmail = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) userEmail = user.email.toLowerCase();
      } catch (e) {}
    }
    if (!userEmail && req.query.email) {
      userEmail = String(req.query.email).trim().toLowerCase();
    }

    if (!userEmail) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const now = new Date();
    const query = {
      isActive: true,
      expiresAt: { $gt: now },
      $or: [
        { targetType: 'all' },
        { allowedEmail: userEmail },
        { allowedEmails: userEmail },
      ],
    };

    const coupons = await Coupon.find(query).sort({ discountPercent: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch coupons', error: error.message });
  }
});

/* ── Validate coupon code in cart ───────────────────────────── */
router.post('/validate', async (req, res) => {
  try {
    const { code, cartTotal, userEmail } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ valid: false, message: 'Please enter a coupon code provided by Admin' });
    }

    const trimmedCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: trimmedCode });

    if (!coupon) {
      return res.status(404).json({ valid: false, message: `Coupon '${trimmedCode}' is invalid. Contact Admin to get a valid promo code.` });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ valid: false, message: `Coupon '${trimmedCode}' is inactive or has been revoked.` });
    }

    const now = new Date();
    if (new Date(coupon.expiresAt) <= now) {
      const expDate = new Date(coupon.expiresAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      return res.status(400).json({
        valid: false,
        isExpired: true,
        message: `Coupon '${trimmedCode}' expired on ${expDate}`,
      });
    }

    // Check if coupon is restricted to a specific grower/user email
    if (coupon.targetType === 'selected') {
      const allowedList = [
        coupon.allowedEmail,
        ...(Array.isArray(coupon.allowedEmails) ? coupon.allowedEmails : []),
      ]
        .filter(Boolean)
        .map((e) => e.trim().toLowerCase());

      const normalizedUser = userEmail ? String(userEmail).trim().toLowerCase() : '';

      if (allowedList.length > 0 && (!normalizedUser || !allowedList.includes(normalizedUser))) {
        return res.status(403).json({
          valid: false,
          message: `This coupon was issued exclusively for selected customer account(s). Please log in with an eligible account.`,
        });
      }
    }

    const total = Number(cartTotal || 0);
    if (coupon.minCartAmount > 0 && total < coupon.minCartAmount) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order amount of ₹${coupon.minCartAmount} required for coupon '${trimmedCode}'`,
      });
    }

    const discountAmount = Math.round((total * coupon.discountPercent) / 100);

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        description: coupon.description,
        discountAmount,
        minCartAmount: coupon.minCartAmount,
        allowedEmail: coupon.allowedEmail || null,
      },
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Could not validate coupon', error: error.message });
  }
});

export default router;

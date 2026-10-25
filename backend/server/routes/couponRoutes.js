import express from 'express';
import Coupon from '../models/Coupon.js';

const router = express.Router();

/* ── Get public active coupons for store users ──────────────── */
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      expiresAt: { $gt: now },
    })
      .select('code discountPercent minCartAmount expiresAt description')
      .sort({ discountPercent: -1 })
      .limit(10);

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch active coupons', error: error.message });
  }
});

/* ── Validate coupon code in cart ───────────────────────────── */
router.post('/validate', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ valid: false, message: 'Please provide a coupon code' });
    }

    const trimmedCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: trimmedCode });

    if (!coupon) {
      return res.status(404).json({ valid: false, message: `Coupon '${trimmedCode}' is invalid` });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ valid: false, message: `Coupon '${trimmedCode}' has been disabled` });
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

    const total = Number(cartTotal || 0);
    if (coupon.minCartAmount > 0 && total < coupon.minCartAmount) {
      return res.status(400).json({
        valid: false,
        message: `Minimum cart amount of ₹${coupon.minCartAmount} required for '${trimmedCode}'`,
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
      },
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Could not validate coupon', error: error.message });
  }
});

export default router;

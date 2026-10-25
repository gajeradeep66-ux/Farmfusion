import express from 'express';
import Coupon from '../models/Coupon.js';

const router = express.Router();

/* ── Public active coupons disabled — coupons must be provided by Admin ── */
router.get('/active', (req, res) => {
  // Coupons are private and given by Admin to users directly
  res.json([]);
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
    if (coupon.allowedEmail && coupon.allowedEmail.trim() !== '') {
      const normalizedAllowed = coupon.allowedEmail.trim().toLowerCase();
      const normalizedUser = userEmail ? String(userEmail).trim().toLowerCase() : '';

      if (!normalizedUser || normalizedUser !== normalizedAllowed) {
        return res.status(403).json({
          valid: false,
          message: `This coupon was issued exclusively for ${coupon.allowedEmail}. Please log in with that account.`,
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

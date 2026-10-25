/**
 * Pricing & Discount Utility
 * Generates deterministic, realistic retail MRPs and discounts
 * strictly between 5% and 30% for all products.
 */

// Curated spread of realistic retail discounts between 5% and 30%
const DISCOUNT_TABLE = [
  8, 15, 22, 12, 25, 18, 10, 28, 14, 20,
  7, 24, 16, 30, 9, 26, 11, 21, 17, 23
];

export function getProductPricing(product) {
  const price = Math.round(Number(product?.price || 0));
  if (!price || isNaN(price) || price <= 0) {
    return { price: 0, mrp: 0, discountPercent: 0, savings: 0 };
  }

  // Generate a deterministic integer hash from product ID or name
  const seed = String(product._id || product.id || product.name || 'farmfusion');
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  // Pick target discount between 5% and 30%
  const targetPercent = DISCOUNT_TABLE[hash % DISCOUNT_TABLE.length];

  // Calculate realistic retail MRP rounded to nearest 5
  // price = mrp * (1 - target/100)  =>  mrp = price / (1 - target/100)
  const rawMrp = price / (1 - targetPercent / 100);
  let mrp = Math.ceil(rawMrp / 5) * 5;

  // Guarantee mrp is strictly greater than price
  if (mrp <= price) {
    mrp = price + Math.max(10, Math.round(price * (targetPercent / 100)));
  }

  // Calculate actual discount percentage
  let discountPercent = Math.round(((mrp - price) / mrp) * 100);

  // Strictly clamp between 5% and 30%
  if (discountPercent < 5) discountPercent = 5;
  if (discountPercent > 30) discountPercent = 30;

  // Adjust MRP to exactly reflect clamped discount if needed
  if (Math.round(((mrp - price) / mrp) * 100) !== discountPercent) {
    mrp = Math.round((price / (1 - discountPercent / 100)) / 5) * 5;
    if (mrp <= price) mrp = price + 10;
    discountPercent = Math.max(5, Math.min(30, Math.round(((mrp - price) / mrp) * 100)));
  }

  const savings = mrp - price;

  return {
    price,
    mrp,
    discountPercent,
    savings,
  };
}

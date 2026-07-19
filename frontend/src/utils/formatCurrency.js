/**
 * Currency & Price formatting utilities for NovaCart (Indian Rupees - ₹)
 */

export const formatPrice = (amount) => {
  const num = Number(amount || 0);
  return `₹${num.toLocaleString('en-IN')}`;
};

export const calculateDiscountPercent = (originalPrice, discountPrice) => {
  const orig = Number(originalPrice || 0);
  const disc = Number(discountPrice || 0);
  if (orig <= 0 || disc <= 0 || disc >= orig) return 0;
  return Math.round(((orig - disc) / orig) * 100);
};

export const calculateSavings = (originalPrice, discountPrice) => {
  const orig = Number(originalPrice || 0);
  const disc = Number(discountPrice || 0);
  if (orig <= 0 || disc <= 0 || disc >= orig) return 0;
  return orig - disc;
};

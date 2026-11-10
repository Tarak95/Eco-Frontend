import { API_URL } from '../config';

// "/uploads/products/a.jpg" (saved by the backend) -> "<backend>/uploads/products/a.jpg".  External links stay as they are.
export const resolveImage = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const imageUrl = (i) => (typeof i === 'string' ? i : i?.url);

// MongoDB product  ->  the shape every storefront / admin component already uses
export const mapProduct = (p = {}) => {
  const list = Array.isArray(p.images) ? p.images : [];
  const main = imageUrl(list.find((i) => i && i.isMain)) || imageUrl(list[0]) || '';
  const images = [main, ...list.map(imageUrl).filter((u) => u && u !== main)].filter(Boolean).map(resolveImage);

  const base = Number(p.price) || 0;
  const sale = Number(p.discountPrice) || 0;
  const hasDiscount = sale > 0 && sale < base;

  return {
    id: p._id || p.id,
    _id: p._id || p.id,
    name: p.title || p.name || '',
    sku: p.sku,
    brand: p.brand || '',
    status: p.status,
    category: p.category,
    categoryName: p.categoryName || p.category,
    price: hasDiscount ? sale : base, // what the customer pays
    oldPrice: hasDiscount ? base : undefined, // crossed-out price
    stock: Number(p.stock ?? 0),
    rating: p.rating ?? 4.8,
    reviewsCount: p.reviewsCount ?? 0,
    isFeatured: !!p.isFeatured,
    isDealOfDay: !!p.isDealOfDay,
    description: p.description || '',
    specs: p.specs && Object.keys(p.specs).length ? p.specs : undefined,
    image: images[0] || '',
    images,
  };
};

// readable message from an axios error
export const apiError = (err, fallback = 'Something went wrong.') =>
  err?.response?.data?.message ||
  (err?.request && !err?.response ? 'Cannot reach the server. Is the backend running?' : err?.message) ||
  fallback;

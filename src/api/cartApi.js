import axios from 'axios';
import { API_URL } from '../config';
import { resolveImage, apiError } from '../utils/productMapper';

// Logged-in customers: the cart is saved in MongoDB (backend /cart/*).
// Guests (not logged in): the cart lives in this browser only (localStorage) and is moved into the database right after login.

const GUEST_KEY = 'ecobazar_cart';
const MAX_QTY = 99;

const fail = (err) => {
  const e = new Error(apiError(err));
  e.response = err?.response;
  return e;
};

// ---------------- guest cart (browser) ----------------
const readGuest = () => {
  try {
    const list = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
    return Array.isArray(list) ? list.filter((i) => i && i.id) : [];
  } catch {
    return [];
  }
};
const writeGuest = (cart) => {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(cart));
  } catch {
    /* storage blocked */
  }
  return cart;
};

export const guestCart = {
  get: () => readGuest(),
  add: (product, quantity = 1) => {
    const cart = readGuest();
    const found = cart.find((i) => i.id === product.id);
    const max = Number(product.stock) > 0 ? Number(product.stock) : MAX_QTY;
    if (found) found.quantity = Math.min(found.quantity + quantity, max);
    else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: Math.min(quantity, max),
        stock: product.stock,
      });
    }
    return writeGuest(cart);
  },
  setQuantity: (id, quantity) => {
    let cart = readGuest();
    if (quantity <= 0) cart = cart.filter((i) => i.id !== id);
    else {
      const item = cart.find((i) => i.id === id);
      if (item) item.quantity = Math.min(quantity, Number(item.stock) > 0 ? Number(item.stock) : MAX_QTY);
    }
    return writeGuest(cart);
  },
  remove: (id) => writeGuest(readGuest().filter((i) => i.id !== id)),
  clear: () => writeGuest([]),
};

// ---------------- server cart (database) ----------------
// backend cart row -> the item shape the cart pages use
const mapRow = (row) => {
  const p = row.product || {};
  const list = Array.isArray(p.images) ? p.images : [];
  const main = (list.find((i) => i && i.isMain) || list[0] || {}).url;
  const base = Number(p.price) || 0;
  const sale = Number(p.discountPrice) || 0;
  return {
    id: String(p._id),
    cartId: row._id,
    name: p.title,
    price: sale > 0 && sale < base ? sale : base,
    image: resolveImage(main),
    category: p.category,
    quantity: row.quantity,
    stock: p.stock,
  };
};

export const cartApi = {
  getCart: async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/cart/${userId}`);
      return (res.data?.cart || []).filter((r) => r.product).map(mapRow);
    } catch (err) {
      throw fail(err);
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const res = await axios.post(`${API_URL}/cart/create`, { proid: productId, quantity });
      return res.data;
    } catch (err) {
      throw fail(err);
    }
  },

  updateQuantity: async (productId, quantity) => {
    try {
      const res = await axios.put(`${API_URL}/cart/quantity/${encodeURIComponent(productId)}`, { quantity });
      return res.data;
    } catch (err) {
      throw fail(err);
    }
  },

  removeFromCart: async (productId) => {
    try {
      const res = await axios.delete(`${API_URL}/cart/product/${encodeURIComponent(productId)}`);
      return res.data;
    } catch (err) {
      throw fail(err);
    }
  },

  clearCart: async () => {
    try {
      const res = await axios.delete(`${API_URL}/cart/clear`);
      return res.data;
    } catch (err) {
      throw fail(err);
    }
  },
};

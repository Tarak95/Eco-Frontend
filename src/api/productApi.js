import axios from 'axios';
import { API_URL } from '../config';
import { CATEGORIES } from '../utils/constants';
import { mapProduct, apiError } from '../utils/productMapper';

// Products live in MongoDB now (backend: /allproduct, /singleproduct/:id, /createproduct, /updateproduct/:id, /deleteproduct/:id).
// Search / filter / sort run in the browser on the list the server returns.

const wrap = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    const e = new Error(apiError(err));
    e.response = err?.response;
    throw e;
  }
};

const applyFilters = (products, filters = {}) => {
  let list = [...products];
  const { category, search, minPrice, maxPrice, sortBy } = filters;

  if (category && category !== 'all') {
    list = list.filter((p) => p.category === category);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.categoryName || '').toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
  if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));

  if (sortBy === 'price-low') list.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-high') list.sort((a, b) => b.price - a.price);
  if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
  // 'newest': the server already returns newest first

  return list;
};

// product form -> multipart body (so the image file itself is uploaded to the server, not stored as base64 text)
const toFormData = (data = {}) => {
  const fd = new FormData();
  fd.append('title', String(data.name ?? '').trim());
  fd.append('category', data.category ?? '');
  if (data.categoryName) fd.append('categoryName', data.categoryName);
  fd.append('price', data.price ?? '');
  fd.append('oldPrice', data.oldPrice ?? '');
  fd.append('stock', data.stock ?? 0);
  fd.append('description', data.description ?? '');
  fd.append('isFeatured', String(!!data.isFeatured));
  fd.append('isDealOfDay', String(!!data.isDealOfDay));
  if (data.status) fd.append('status', data.status);

  // images in their final order: new files by index, saved / linked images by url (first = main image)
  const order = [];
  let fileIndex = 0;
  (data.imageItems || []).forEach((it) => {
    if (it.file) {
      fd.append('photos', it.file);
      order.push({ file: fileIndex++ });
    } else if (it.src && !/^(data|blob):/.test(it.src)) {
      order.push({ url: it.src });
    }
  });
  fd.append('imageOrder', JSON.stringify(order));
  // older backends only know the single "image" link field
  const firstLink = order[0]?.url;
  if (firstLink) fd.append('image', firstLink);
  if (data.brand !== undefined) fd.append('brand', data.brand ?? '');
  return fd;
};

export const productApi = {
  // shop pages: active products only
  getProducts: wrap(async (filters = {}) => {
    const res = await axios.get(`${API_URL}/allproduct`);
    const products = (res.data?.allProduct || []).map(mapProduct);
    const data = applyFilters(products, filters);
    return { success: true, data, total: data.length };
  }),

  // admin panel: every product, including inactive / pending ones
  getAdminProducts: wrap(async () => {
    const res = await axios.get(`${API_URL}/allproduct`, { params: { all: 1 } });
    const data = (res.data?.allProduct || []).map(mapProduct);
    return { success: true, data, total: data.length };
  }),

  getProductById: wrap(async (id) => {
    const res = await axios.get(`${API_URL}/singleproduct/${encodeURIComponent(id)}`);
    if (!res.data?.data) throw new Error('Product not found');
    return { success: true, data: mapProduct(res.data.data) };
  }),

  createProduct: wrap(async (productData) => {
    const res = await axios.post(`${API_URL}/createproduct`, toFormData(productData));
    return { success: true, data: mapProduct(res.data?.data), message: res.data?.message || 'Product created successfully' };
  }),

  updateProduct: wrap(async (id, productData) => {
    const res = await axios.post(`${API_URL}/updateproduct/${encodeURIComponent(id)}`, toFormData(productData));
    return { success: true, data: mapProduct(res.data?.data), message: res.data?.message || 'Product updated successfully' };
  }),

  deleteProduct: wrap(async (id) => {
    const res = await axios.delete(`${API_URL}/deleteproduct/${encodeURIComponent(id)}`);
    return { success: true, message: res.data?.message || 'Product deleted successfully' };
  }),

  // rows = parsed sheet rows, imageFiles = image files whose names are used in the "images" column
  bulkCreate: wrap(async (rows, imageFiles = []) => {
    const fd = new FormData();
    fd.append('products', JSON.stringify(rows));
    imageFiles.forEach((f) => fd.append('photos', f));
    try {
      const res = await axios.post(`${API_URL}/bulkproducts`, fd);
      return res.data;
    } catch (err) {
      // a fully rejected upload still comes with the per-row reasons
      if (err?.response?.data?.failed) return err.response.data;
      throw err;
    }
  }),

  getCategories: async () => ({ success: true, data: CATEGORIES }),
};

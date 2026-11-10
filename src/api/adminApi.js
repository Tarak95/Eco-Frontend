import axios from 'axios';
import { API_URL } from '../config';
import { resolveImage } from '../utils/productMapper';

// One request that returns everything the dashboard shows (admin only).
export const adminApi = {
  getStats: async (days = 14) => {
    const res = await axios.get(`${API_URL}/admin/stats`, { params: { days } });
    const d = res.data?.data || {};
    return {
      ...d,
      topProducts: (d.topProducts || []).map((p) => ({ ...p, image: resolveImage(p.image) })),
      lowStockProducts: (d.lowStockProducts || []).map((p) => ({
        ...p,
        image: resolveImage(p.images?.find((i) => i.isMain)?.url || p.images?.[0]?.url),
      })),
    };
  },
};

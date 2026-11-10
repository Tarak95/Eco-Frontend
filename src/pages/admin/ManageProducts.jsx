import React, { useState, useEffect } from 'react';
import ProductTable from '../../components/admin/ProductTable';
import Loader from '../../components/common/Loader';
import { productApi } from '../../api/productApi';

export const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getAdminProducts();
      setProducts(res.data || []);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product from the inventory?')) {
      try {
        await productApi.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        window.alert(err.message || 'Could not delete the product.');
      }
    }
  };

  if (loading) return <Loader text="Loading product inventory..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Inventory</h1>
        <p className="text-xs text-slate-500">View, edit, or remove products from EcoBazar catalog</p>
      </div>

      <ProductTable products={products} onDeleteProduct={handleDeleteProduct} />
    </div>
  );
};

export default ManageProducts;

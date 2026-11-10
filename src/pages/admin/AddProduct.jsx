import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/product/ProductForm';
import { productApi } from '../../api/productApi';

export const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateProduct = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const res = await productApi.createProduct(formData);
      if (res.success) {
        navigate('/admin/products');
      }
    } catch (err) {
      console.error('Create product error:', err);
      setError(err.message || 'Could not create the product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add New Product</h1>
        <p className="text-xs text-slate-500">Fill in product details to add a new item to EcoBazar catalog</p>
      </div>

      <ProductForm onSubmit={handleCreateProduct} isLoading={loading} buttonText="Publish Product" submitError={error} />
    </div>
  );
};

export default AddProduct;

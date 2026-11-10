import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../../components/product/ProductForm';
import Loader from '../../components/common/Loader';
import { productApi } from '../../api/productApi';

export const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productApi.getProductById(id);
        setProduct(res.data);
      } catch (err) {
        console.error('Error fetching product to edit:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleUpdateProduct = async (formData) => {
    setUpdating(true);
    setError('');
    try {
      const res = await productApi.updateProduct(id, formData);
      if (res.success) {
        navigate('/admin/products');
      }
    } catch (err) {
      console.error('Update product error:', err);
      setError(err.message || 'Could not update the product.');
    } finally {
      setUpdating(false);
    }
  };

  if (fetching) return <Loader text="Fetching product parameters..." />;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Product</h1>
        <p className="text-xs text-slate-500">Update item pricing, stock levels, or images</p>
      </div>

      {!product && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-700">
          Product not found. It may have been deleted.
        </div>
      )}

      {product && (
        <ProductForm
          initialValues={product}
          onSubmit={handleUpdateProduct}
          isLoading={updating}
          buttonText="Save Product Changes"
          submitError={error}
        />
      )}
    </div>
  );
};

export default EditProduct;

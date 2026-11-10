import React, { useState, useEffect } from 'react';
import InputField from '../common/InputField';
import Button from '../common/Button';
import ImageUploader from './ImageUploader';
import { CATEGORIES } from '../../utils/constants';
import { validateProductForm } from '../../utils/validators';

// product.images (saved urls) -> uploader items
const toImageItems = (p) =>
  (p?.images || []).filter(Boolean).map((src, i) => ({ id: `saved-${i}-${src}`, src, file: null }));

export const ProductForm = ({ initialValues, onSubmit, isLoading, buttonText = 'Save Product', submitError = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'smartphone',
    categoryName: 'Smart phone',
    price: '',
    oldPrice: '',
    stock: '20',
    description: '',
    brand: '',
    status: 'active',
    isFeatured: false,
    isDealOfDay: false,
    ...initialValues,
    imageItems: toImageItems(initialValues) 
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({
        ...prev,
        ...initialValues,
        
        imageItems: toImageItems(initialValues)
      }));
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'category') {
      const selectedCat = CATEGORIES.find(c => c.id === value);
      if (selectedCat) {
        setFormData(prev => ({ ...prev, categoryName: selectedCat.name }));
      }
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateProductForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. Images first */}
      <ImageUploader
        value={formData.imageItems}
        error={errors.image}
        onChange={(items) => {
          setFormData(prev => ({ ...prev, imageItems: items }));
          if (errors.image) setErrors(prev => ({ ...prev, image: '' }));
        }}
      />

      {/* 2. Details */}
      <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-sm font-black text-slate-900 -mb-2">Product Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="md:col-span-2">
            <InputField
              label="Product Title"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. EcoPhone Ultra Pro 5G - Titanium Gray"
              error={errors.name}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl text-slate-900 text-sm bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 p-2.5"
            >
              {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-rose-500">{errors.category}</p>}
          </div>

          {/* Price */}
          <InputField
            label="Price ($)"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="999.00"
            error={errors.price}
            required
          />

          {/* Old Price */}
          <InputField
            label="Original / Old Price ($)"
            type="number"
            name="oldPrice"
            value={formData.oldPrice}
            onChange={handleChange}
            placeholder="1199.00"
          />

          {/* Stock */}
          <InputField
            label="Stock Quantity"
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="25"
            error={errors.stock}
            required
          />

          {/* Brand */}
          <InputField
            label="Brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g. EcoTech"
          />

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Visibility</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl text-slate-900 text-sm bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 p-2.5"
            >
              <option value="active">Active - visible in the shop</option>
              <option value="inactive">Inactive - hidden</option>
              <option value="pending">Draft</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Product Description
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter detailed description, key specifications, and features..."
            className="w-full rounded-xl text-slate-900 text-sm bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 p-3"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            Featured Product
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="isDealOfDay"
              checked={formData.isDealOfDay}
              onChange={handleChange}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            Hot Deal of the Day
          </label>
        </div>
      </div>

      {submitError && (
        <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {submitError}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4 flex justify-end">
        <Button type="submit" isLoading={isLoading} size="lg">
          {buttonText}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
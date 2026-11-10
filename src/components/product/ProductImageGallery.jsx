import React, { useState } from 'react';
import { handleImageError } from '../../utils/imageUtils';

export const ProductImageGallery = ({ images = [], mainImage, title, category }) => {
  const allImages = images && images.length > 0 ? images : [mainImage];
  const [selectedImage, setSelectedImage] = useState(allImages[0] || mainImage);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image View */}
      <div className="relative aspect-square w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
        <img
          src={selectedImage || mainImage}
          alt={title}
          onError={(e) => handleImageError(e, category)}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                selectedImage === img
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 opacity-70 hover:opacity-100'
              }`}
            >
              <img 
                src={img} 
                alt={`${title} ${idx + 1}`} 
                onError={(e) => handleImageError(e, category)}
                className="w-full h-full object-cover" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;

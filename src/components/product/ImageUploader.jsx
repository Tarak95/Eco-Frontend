import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, X, Star, Plus, ImageIcon } from 'lucide-react';

export const MAX_IMAGES = 8;

let counter = 0;
const newId = () => `img-${Date.now()}-${counter++}`;

// Big photos are shrunk in the browser first (max 1600px, JPEG) so uploads stay fast.
const shrinkImage = (file) =>
  new Promise((resolve) => {
    if (file.size < 1024 * 1024 || /gif|svg/.test(file.type)) return resolve(file);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 1600;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          resolve(blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file);
        },
        'image/jpeg',
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });

/**
 * Multi image picker. `value` = [{ id, src, file }]  (file = new upload, null = already saved / pasted link).
 * The FIRST image is the main product image.
 */
export const ImageUploader = ({ value = [], onChange, error }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [link, setLink] = useState('');
  const [notice, setNotice] = useState('');
  const inputRef = useRef(null);

  const room = MAX_IMAGES - value.length;

  const addFiles = async (fileList) => {
    const all = Array.from(fileList || []);
    const images = all.filter((f) => f.type.startsWith('image/'));
    const tooBig = images.filter((f) => f.size > 10 * 1024 * 1024);
    const ok = images.filter((f) => f.size <= 10 * 1024 * 1024).slice(0, Math.max(0, room));

    const problems = [];
    if (all.length > images.length) problems.push('Only image files are allowed.');
    if (tooBig.length) problems.push('Images must be under 10 MB.');
    if (images.length - tooBig.length > room) problems.push(`Maximum ${MAX_IMAGES} images.`);
    setNotice(problems.join(' '));
    if (!ok.length) return;

    setBusy(true);
    const items = await Promise.all(
      ok.map(async (f) => {
        const file = await shrinkImage(f);
        return { id: newId(), src: URL.createObjectURL(file), file };
      })
    );
    setBusy(false);
    onChange([...value, ...items]);
  };

  const addLink = () => {
    const url = link.trim();
    if (!/^https?:\/\/.+/i.test(url)) return setNotice('Paste a full image link starting with http(s)://');
    if (room <= 0) return setNotice(`Maximum ${MAX_IMAGES} images.`);
    setNotice('');
    onChange([...value, { id: newId(), src: url, file: null }]);
    setLink('');
  };

  const remove = (id) => onChange(value.filter((i) => i.id !== id));
  const makeMain = (id) => {
    const item = value.find((i) => i.id === id);
    if (item) onChange([item, ...value.filter((i) => i.id !== id)]);
  };

  return (
    <section className={`rounded-2xl border bg-white p-5 shadow-xs ${error ? 'border-rose-300' : 'border-slate-200'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="text-sm font-black text-slate-900">Product Images <span className="text-rose-500">*</span></h2>
          <p className="text-[11px] text-slate-500">First image is the main photo. Up to {MAX_IMAGES} images, 10 MB each.</p>
        </div>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">
          {value.length} / {MAX_IMAGES}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {value.map((item, idx) => (
          <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img
              src={item.src}
              alt={`Product ${idx + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.opacity = 0.25;
              }}
            />
            {idx === 0 ? (
              <span className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[10px] font-bold bg-emerald-600 text-white rounded-full px-2 py-0.5 shadow">
                <Star size={10} fill="currentColor" /> Main
              </span>
            ) : (
              <button
                type="button"
                onClick={() => makeMain(item.id)}
                className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-white/95 text-slate-800 rounded-full px-2 py-0.5 shadow hover:bg-emerald-600 hover:text-white transition cursor-pointer"
              >
                Make main
              </button>
            )}
            <button
              type="button"
              onClick={() => remove(item.id)}
              title="Remove image"
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/95 text-slate-600 hover:text-rose-600 shadow cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {room > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-center px-2 transition cursor-pointer ${
              isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40'
            } ${value.length === 0 ? 'col-span-2 sm:col-span-2 aspect-auto min-h-40' : ''}`}
          >
            {value.length === 0 ? <UploadCloud size={30} className="text-emerald-600" /> : <Plus size={22} className="text-emerald-600" />}
            <span className="text-xs font-bold text-slate-700">{busy ? 'Processing…' : value.length === 0 ? 'Click or drop product photos' : 'Add more'}</span>
            {value.length === 0 && <span className="text-[10px] text-slate-400">PNG, JPG, WEBP</span>}
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowLink((s) => !s)}
          className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon size={13} /> Add from image link
        </button>
        {showLink && (
          <div className="flex-1 min-w-60 flex gap-2">
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
              placeholder="https://…/photo.jpg"
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
            />
            <button type="button" onClick={addLink} className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg cursor-pointer">
              Add
            </button>
          </div>
        )}
      </div>

      {(notice || error) && (
        <p className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1">
          <ImageIcon size={13} /> {error || notice}
        </p>
      )}
    </section>
  );
};

export default ImageUploader;

import React, { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Download, FileSpreadsheet, ImagePlus, CheckCircle2, XCircle, AlertTriangle, UploadCloud, X, Plus, Loader2,
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { CATEGORIES } from '../../utils/constants';
import { parseCsv, toCsv, downloadFile } from '../../utils/csv';

const TEMPLATE_HEADERS = ['title', 'category', 'price', 'old_price', 'stock', 'brand', 'status', 'description', 'images', 'featured', 'deal_of_day'];
const TEMPLATE_ROWS = [
  ['EcoPhone Ultra 5G', 'smartphone', '999', '1199', '25', 'EcoTech', 'active', 'Flagship phone with 200MP camera', 'ecophone-front.jpg | ecophone-back.jpg', 'yes', 'no'],
  ['Eco Smart Watch S2', 'smartwatch', '149', '', '40', 'EcoTech', 'active', 'AMOLED display, 7 day battery', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 'no', 'no'],
];

const norm = (k) => String(k).toLowerCase().replace(/[\s_-]+/g, '');
const pick = (row, keys) => {
  for (const key of Object.keys(row)) if (keys.includes(norm(key)) && row[key] !== '' && row[key] != null) return row[key];
  return '';
};

const resolveCategory = (value) => {
  const v = String(value || '').trim().toLowerCase();
  if (!v) return null;
  return CATEGORIES.find((c) => c.id !== 'all' && (c.id === v || c.name.toLowerCase() === v || c.slug === v)) || null;
};

// the same checks the server does, so mistakes are shown BEFORE uploading
const checkRow = (row, imageNames) => {
  const errors = [];
  const title = pick(row, ['title', 'name', 'productname', 'producttitle']);
  const catRaw = pick(row, ['category', 'categoryid']);
  const cat = resolveCategory(catRaw);
  const price = Number(String(pick(row, ['price', 'sellingprice', 'saleprice'])).replace(/,/g, ''));
  const images = String(pick(row, ['images', 'image', 'imageurl', 'imageurls', 'photos', 'photo']))
    .split(/[|;\n]/).map((x) => x.trim()).filter(Boolean);

  if (!title) errors.push('Title missing');
  if (!catRaw) errors.push('Category missing');
  else if (!cat) errors.push(`Unknown category "${catRaw}"`);
  if (!(price > 0)) errors.push('Price must be greater than 0');
  const missing = images.filter((i) => !/^https?:\/\//i.test(i) && !imageNames.has(i.toLowerCase()));
  if (missing.length) errors.push(`Image file not selected: ${missing.join(', ')}`);

  return { title, cat, price, images, errors };
};

const toPayload = (row, cat) => ({ ...row, category: cat.id, categoryName: cat.name });

const Step = ({ n, title, children }) => (
  <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
    <h2 className="flex items-center gap-2.5 text-sm font-black text-slate-900 mb-3">
      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">{n}</span>
      {title}
    </h2>
    {children}
  </section>
);

export const BulkUpload = () => {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [images, setImages] = useState([]);
  const [parseError, setParseError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [fatal, setFatal] = useState('');
  const sheetRef = useRef(null);
  const imgRef = useRef(null);

  const imageNames = useMemo(() => new Set(images.map((f) => f.name.toLowerCase())), [images]);
  const checked = useMemo(() => rows.map((r) => checkRow(r, imageNames)), [rows, imageNames]);

  // duplicate titles inside the sheet
  const dupes = useMemo(() => {
    const seen = new Set();
    const d = new Set();
    checked.forEach((c, i) => {
      const k = c.title.toLowerCase();
      if (!k) return;
      if (seen.has(k)) d.add(i);
      seen.add(k);
    });
    return d;
  }, [checked]);

  const issues = (i) => [...checked[i].errors, ...(dupes.has(i) ? ['Duplicate title in this sheet'] : [])];
  const validCount = checked.filter((_, i) => issues(i).length === 0).length;
  const invalidCount = rows.length - validCount;

  const downloadTemplate = () => downloadFile('ecobazar-products-template.csv', toCsv(TEMPLATE_HEADERS, TEMPLATE_ROWS));

  const readSheet = async (file) => {
    if (!file) return;
    setParseError('');
    setResult(null);
    setFatal('');
    try {
      const text = await file.text();
      let data;
      if (/\.json$/i.test(file.name)) {
        const j = JSON.parse(text);
        data = Array.isArray(j) ? j : j.products || j.data;
      } else if (/\.(xlsx|xls)$/i.test(file.name)) {
        throw new Error('Excel files are not supported directly. In Excel use File > Save As > "CSV UTF-8", then upload that file.');
      } else {
        data = parseCsv(text);
      }
      if (!Array.isArray(data) || !data.length) throw new Error('No product rows found in this file.');
      if (data.length > 500) throw new Error('Maximum 500 products per upload. Please split the file.');
      setRows(data);
      setFileName(file.name);
    } catch (err) {
      setRows([]);
      setFileName('');
      setParseError(err.message || 'Could not read this file.');
    }
  };

  const addImages = (list) => {
    const incoming = Array.from(list || []).filter((f) => f.type.startsWith('image/'));
    setImages((prev) => {
      const byName = new Map(prev.map((f) => [f.name.toLowerCase(), f]));
      incoming.forEach((f) => byName.set(f.name.toLowerCase(), f));
      return [...byName.values()];
    });
  };

  const reset = () => {
    setRows([]); setFileName(''); setImages([]); setResult(null); setFatal(''); setParseError('');
    if (sheetRef.current) sheetRef.current.value = '';
    if (imgRef.current) imgRef.current.value = '';
  };

  const upload = async () => {
    setFatal('');
    setUploading(true);
    try {
      const sendIdx = checked.map((_, i) => i).filter((i) => issues(i).length === 0);
      const payload = sendIdx.map((i) => toPayload(rows[i], checked[i].cat));
      const used = new Set(sendIdx.flatMap((i) => checked[i].images.map((x) => x.toLowerCase())));
      const files = images.filter((f) => used.has(f.name.toLowerCase()));
      const res = await productApi.bulkCreate(payload, files);
      // server rows are numbered inside the sent list -> map back to the sheet line
      const failed = (res.failed || []).map((f) => ({ ...f, sheetRow: sendIdx[f.row - 1] + 2 }));
      setResult({ created: res.created || 0, failed, message: res.message });
    } catch (err) {
      setFatal(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const hasRows = rows.length > 0;

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Product Upload</h1>
          <p className="text-xs text-slate-500">Add many products at once from a CSV / JSON sheet, with their images.</p>
        </div>
        <Link to="/admin/products/create" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
          <Plus size={14} /> Add a single product
        </Link>
      </div>

      {result ? (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-3">
            {result.created > 0 ? <CheckCircle2 className="text-emerald-600" size={32} /> : <XCircle className="text-rose-600" size={32} />}
            <div>
              <h2 className="text-lg font-black text-slate-900">{result.created} product(s) uploaded</h2>
              <p className="text-xs text-slate-500">{result.failed.length ? `${result.failed.length} row(s) were skipped.` : 'Every row was saved.'}</p>
            </div>
          </div>

          {result.failed.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 space-y-1.5">
              <p className="text-xs font-bold text-rose-800">Skipped rows</p>
              {result.failed.map((f, i) => (
                <p key={i} className="text-xs text-rose-700">Sheet line {f.sheetRow}{f.title ? ` · ${f.title}` : ''}: {f.error}</p>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Link to="/admin/products" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl">View products</Link>
            <button onClick={reset} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer">Upload more</button>
          </div>
        </section>
      ) : (
        <>
          <Step n={1} title="Download the sheet template">
            <p className="text-xs text-slate-600 mb-3">
              Fill one product per row. Required: <b>title, category, price</b>. In the <b>images</b> column write image file names (e.g. <code className="bg-slate-100 px-1 rounded">phone-1.jpg | phone-2.jpg</code>) or full image links. First image = main image.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={downloadTemplate} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer">
                <Download size={15} /> Download CSV template
              </button>
              <span className="text-[11px] text-slate-500">
                Categories: {CATEGORIES.filter((c) => c.id !== 'all').map((c) => c.id).join(', ')}
              </span>
            </div>
          </Step>

          <Step n={2} title="Upload your sheet">
            <div
              onClick={() => sheetRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); readSheet(e.dataTransfer.files[0]); }}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-2xl p-6 text-center cursor-pointer transition"
            >
              <FileSpreadsheet className="mx-auto text-emerald-600" size={30} />
              <p className="text-sm font-bold text-slate-800 mt-2">{fileName || 'Click or drop your .csv / .json file'}</p>
              <p className="text-[11px] text-slate-400">{hasRows ? `${rows.length} rows found` : 'Up to 500 products'}</p>
              <input ref={sheetRef} type="file" accept=".csv,.json,text/csv,application/json,.xlsx,.xls" className="hidden" onChange={(e) => readSheet(e.target.files[0])} />
            </div>
            {parseError && <p className="mt-2 text-xs font-semibold text-rose-600 flex items-start gap-1"><AlertTriangle size={14} className="shrink-0 mt-0.5" /> {parseError}</p>}
          </Step>

          <Step n={3} title="Select product images (optional)">
            <p className="text-xs text-slate-600 mb-3">Pick all image files at once. They are matched with the names written in your sheet. Not needed if the sheet only has image links.</p>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => imgRef.current?.click()} className="px-4 py-2 bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer">
                <ImagePlus size={15} /> Choose images
              </button>
              {images.length > 0 && (
                <button onClick={() => { setImages([]); if (imgRef.current) imgRef.current.value = ''; }} className="text-xs font-bold text-rose-600 hover:underline cursor-pointer">Clear all</button>
              )}
              <input ref={imgRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addImages(e.target.files); e.target.value = ''; }} />
            </div>
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((f) => (
                  <span key={f.name} className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-lg pl-2.5 pr-1.5 py-1">
                    {f.name}
                    <button onClick={() => setImages((p) => p.filter((x) => x !== f))} className="text-slate-400 hover:text-rose-600 cursor-pointer"><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
          </Step>

          {hasRows && (
            <Step n={4} title="Review & upload">
              <div className="flex flex-wrap items-center gap-3 mb-3 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">{validCount} ready</span>
                {invalidCount > 0 && <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700">{invalidCount} with problems (will be skipped)</span>}
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider sticky top-0">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Title</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Price</th>
                      <th className="p-2.5">Images</th>
                      <th className="p-2.5">Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {checked.map((c, i) => {
                      const errs = issues(i);
                      return (
                        <tr key={i} className={errs.length ? 'bg-rose-50/50' : ''}>
                          <td className="p-2.5 text-slate-400">{i + 2}</td>
                          <td className="p-2.5 font-semibold text-slate-900 max-w-56 truncate">{c.title || '—'}</td>
                          <td className="p-2.5 text-slate-700">{c.cat ? c.cat.name : '—'}</td>
                          <td className="p-2.5 font-bold">{c.price > 0 ? `$${c.price}` : '—'}</td>
                          <td className="p-2.5 text-slate-600">{c.images.length}</td>
                          <td className="p-2.5">
                            {errs.length ? <span className="text-rose-600 font-medium">{errs.join('; ')}</span> : <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={14} /> OK</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {fatal && <p className="mt-3 text-xs font-semibold text-rose-600">{fatal}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={upload}
                  disabled={uploading || validCount === 0}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
                  {uploading ? 'Uploading…' : `Upload ${validCount} product(s)`}
                </button>
                <button onClick={reset} disabled={uploading} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer">Start over</button>
              </div>
            </Step>
          )}
        </>
      )}
    </div>
  );
};

export default BulkUpload;

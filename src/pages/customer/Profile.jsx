import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, ShieldCheck, Hash, Camera, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { API_URL } from '../../config';

export const Profile = () => {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setFormData({
          name: parsed.name || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          address: parsed.address || '',
          zipCode: parsed.zipCode || '',
          avatar: parsed.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        });
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };


  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const userId = currentUser?._id || currentUser?.id;

    if (!userId) {
      setMessage({ type: 'error', text: 'User ID not found. Please log in again.' });
      setLoading(false);
      return;
    }

    try {
      // email and role cannot be changed here (the server ignores them anyway)
      const { email: _email, ...editable } = formData;
      const response = await axios.post(`${API_URL}/update/${userId}`, editable);

      if (response.data.success || response.status === 200) {
        // keep local-only fields (avatar) but take everything else, especially "role", from the server
        const updatedData = { ...currentUser, ...editable, ...(response.data.data || {}) };


        localStorage.setItem('user', JSON.stringify(updatedData));
        setCurrentUser(updatedData);

        window.dispatchEvent(new Event('authChange'));

        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      console.error('Update Profile Error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Server error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Account Profile</h1>
        <p className="text-xs text-slate-500">Manage your personal information and profile picture</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        
        {/* User Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="relative group">
            <img
              src={currentUser?.avatar || formData.avatar}
              alt={currentUser?.name || 'User'}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md transition-all group-hover:brightness-90"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
              title="Upload new profile picture"
            >
              <Camera size={16} />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{currentUser?.name || 'User'}</h2>
              <p className="text-xs text-slate-500">{currentUser?.email || 'N/A'}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                <ShieldCheck size={12} /> {currentUser?.role || 'Customer'}
              </span>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                <Upload size={14} /> Upload Photo
              </button>

              <span className="text-slate-300">|</span>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <LinkIcon size={14} /> {showUrlInput ? 'Hide URL' : 'Image URL'}
              </button>
            </div>

            {showUrlInput && (
              <div className="pt-2">
                <InputField
                  label="Avatar Image URL"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                  icon={ImageIcon}
                />
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          
          {message.text && (
            <div className={`p-3 text-xs font-bold rounded-xl border ${
              message.type === 'error' 
                ? 'text-rose-600 bg-rose-50 border-rose-200' 
                : 'text-emerald-600 bg-emerald-50 border-emerald-200'
            }`}>
              {message.text}
            </div>
          )}

          <InputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            icon={User}
            required
          />

          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            disabled
          />

          <InputField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+880 1711 000111"
            icon={Phone}
          />

          <InputField
            label="Default Shipping Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="House 42, Road 11, Banani, Dhaka"
            icon={MapPin}
          />

          <InputField
            label="Zip / Postal Code"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="1213"
            icon={Hash}
          />

          <div className="pt-2">
            <Button type="submit" isLoading={loading} className="w-full sm:w-auto">
              <Save size={18} /> Save Changes
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Profile;
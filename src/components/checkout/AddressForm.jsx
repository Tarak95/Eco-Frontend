import React from 'react';
import InputField from '../common/InputField';
import { User, Phone, MapPin, Mail, CreditCard, Banknote, ShieldCheck } from 'lucide-react';

export const AddressForm = ({ formData, onChange, errors = {} }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
        <MapPin size={18} className="text-emerald-600" />
        Shipping Address & Contact
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={onChange}
          placeholder="Mahdiyat Mim"
          icon={User}
          error={errors.fullName}
          required
        />

        <InputField
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={onChange}
          placeholder="+880 1711 000111"
          icon={Phone}
          error={errors.phone}
          required
        />

        <div className="md:col-span-2">
          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="mahdiyat@example.com"
            icon={Mail}
            error={errors.email}
            required
          />
        </div>

        <div className="md:col-span-2">
          <InputField
            label="Street Address / House"
            name="street"
            value={formData.street}
            onChange={onChange}
            placeholder="House 42, Road 11, Banani Block D"
            icon={MapPin}
            error={errors.street}
            required
          />
        </div>

        <InputField
          label="City"
          name="city"
          value={formData.city}
          onChange={onChange}
          placeholder="Dhaka"
          error={errors.city}
          required
        />

        <InputField
          label="Postal Code"
          name="postalCode"
          value={formData.postalCode}
          onChange={onChange}
          placeholder="1213"
          error={errors.postalCode}
          required
        />
      </div>

      {/* Payment Selection */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Select Payment Method
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className={`p-3.5 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
            formData.paymentMethod === 'Cash on Delivery'
              ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 font-bold'
              : 'border-slate-200 text-slate-600 hover:border-slate-300'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="Cash on Delivery"
              checked={formData.paymentMethod === 'Cash on Delivery'}
              onChange={onChange}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <Banknote size={18} className="text-emerald-600" />
            <span className="text-xs">Cash on Delivery</span>
          </label>

          <label className={`p-3.5 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
            formData.paymentMethod === 'Card Payment'
              ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 font-bold'
              : 'border-slate-200 text-slate-600 hover:border-slate-300'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="Card Payment"
              checked={formData.paymentMethod === 'Card Payment'}
              onChange={onChange}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <CreditCard size={18} className="text-emerald-600" />
            <span className="text-xs">Credit/Debit Card</span>
          </label>

          {/* <label className={`p-3.5 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
            formData.paymentMethod === 'bKash / Mobile Wallet'
              ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 font-bold'
              : 'border-slate-200 text-slate-600 hover:border-slate-300'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="bKash / Mobile Wallet"
              checked={formData.paymentMethod === 'bKash / Mobile Wallet'}
              onChange={onChange}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <ShieldCheck size={18} className="text-pink-600" />
            <span className="text-xs">bKash / Nagad</span>
          </label> */}
        </div>
      </div>
    </div>
  );
};

export default AddressForm;

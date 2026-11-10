import React, { useRef, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import AddressForm from '../../components/checkout/AddressForm';
import OrderSummary from '../../components/checkout/OrderSummary';
import Button from '../../components/common/Button';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { orderApi, orderErrorMessage } from '../../api/orderApi';
import { validateEmail, validateRequired } from '../../utils/validators';

const SHIPPING_COST = 10;

export const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address || '',
    city: 'Dhaka',
    postalCode: '1213',
    paymentMethod: 'Cash on Delivery'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  // true once the server has accepted the order. The cart is emptied right after, and an empty cart used to bounce the
  // customer to /cart (racing with the move to /order-success) so a successful COD order looked like it had failed.
  const orderPlacedRef = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const nameErr = validateRequired(formData.fullName, 'Full name');
    const emailErr = validateEmail(formData.email);
    const streetErr = validateRequired(formData.street, 'Street address');
    const cityErr = validateRequired(formData.city, 'City');

    if (nameErr) newErrors.fullName = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (streetErr) newErrors.street = streetErr;
    if (cityErr) newErrors.city = cityErr;
    if (!/^[+\d][\d\s-]{6,19}$/.test(formData.phone.trim())) newErrors.phone = 'Enter a valid phone number';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const userId = user?._id || user?.id;
    if (!userId) {
      setErrors({ form: 'Please log in again to place your order.' });
      return;
    }

    setSubmitting(true);
    let redirecting = false;
    try {
      const res = await orderApi.createOrder({
        userId,
        customerName: formData.fullName.trim(),
        customerEmail: formData.email.trim(),
        // the server recalculates every price and the total; this is only the list of what to buy
        items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, image: i.image, category: i.category, quantity: i.quantity })),
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          street: formData.street.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.trim()
        },
        paymentMethod: formData.paymentMethod
      });

      if (!res?.success) throw new Error(res?.message || 'Order could not be placed.');

      if (res.paymentUrl) {
        // online payment: go to AamarPay. The cart is cleared only after the payment is confirmed (order-success page).
        redirecting = true;
        window.location.assign(res.paymentUrl);
        return;
      }

      // Cash on Delivery: the order is final. Go to the success page FIRST, then empty the cart.
      orderPlacedRef.current = true;
      redirecting = true; // keep the form locked (no double submit) until the success page takes over
      navigate(`/order-success?tran_id=${encodeURIComponent(res.order.tranid)}`, { replace: true });
      clearCart().catch(() => {}); // the success page also empties the cart, so a failure here is harmless
      return;
    } catch (err) {
      console.error('Checkout error:', err);
      setErrors({ form: orderErrorMessage(err) });
    } finally {
      if (!redirecting) setSubmitting(false);
    }
  };

  // navigate during render is a React error: use <Navigate> instead. Don't bounce away while the order is being placed.
  if (cart.length === 0 && !submitting && !orderPlacedRef.current) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-xs text-slate-500">Complete your delivery address and payment details</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AddressForm formData={formData} onChange={handleChange} errors={errors} />
        </div>

        <div className="space-y-6">
          <OrderSummary items={cart} totalAmount={cartTotal} shippingCost={SHIPPING_COST} />

          {errors.form && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {errors.form}
            </div>
          )}

          <Button type="submit" isLoading={submitting} size="lg" className="w-full">
            {formData.paymentMethod === 'Cash on Delivery' ? 'Confirm & Place Order' : 'Pay Now'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;

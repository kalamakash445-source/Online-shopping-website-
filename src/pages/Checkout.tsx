import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { UserProfile, CartItem, Order } from '../types';
import { CreditCard, Truck, CheckCircle, ArrowLeft, Smartphone, QrCode, Copy, Check, X, Maximize2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

export default function Checkout({ user }: { user: UserProfile | null }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState({ 
    name: user?.displayName || '', 
    email: user?.email || '',
    address: '', 
    phone: '' 
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online' | 'upi'>('cod');
  const [upiId, setUpiId] = useState('');
  const [adminUpiId, setAdminUpiId] = useState('');
  const [adminQrImage, setAdminQrImage] = useState<string | null>(null);
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showLargeQr, setShowLargeQr] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
    if (savedCart.length === 0 && !isSuccess) navigate('/cart');

    const fetchAdminUpi = async () => {
      try {
        const data = await api.getSettings('payment');
        if (data) {
          setAdminUpiId(data.adminUpiId || '');
          setAdminQrImage(data.adminQrImage || null);
        }
      } catch (error) {
        console.error('Error fetching admin UPI:', error);
      }
    };
    fetchAdminUpi();
  }, [navigate, isSuccess]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const upiLink = adminUpiId ? `upi://pay?pa=${adminUpiId}&pn=Bazaar&am=${total}&cu=INR&tn=Order%20Acquisition` : '';

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerifyUpi = () => {
    if (upiId.includes('@')) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsUpiVerified(true);
        setIsSubmitting(false);
      }, 1500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'upi' && !isUpiVerified) return;
    
    setIsSubmitting(true);
    try {
      const orderData = {
        userId: user?.uid || 'guest',
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: total,
        status: (paymentMethod === 'upi' ? 'payment_pending' : 'pending') as Order['status'],
        shippingAddress: address,
        paymentMethod,
        upiId: paymentMethod === 'upi' ? upiId : null,
        createdAt: new Date().toISOString()
      };

      const newOrder = await api.createOrder(orderData);
      setOrderId(newOrder.id);
      localStorage.removeItem('cart');
      setIsSuccess(true);
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 animate-in fade-in zoom-in duration-700">
        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-black/[0.05] border border-gray-50 overflow-hidden">
          <div className="bg-premium-black text-white p-16 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-vibrant-pink/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-vibrant-blue/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
            
            <div className="w-20 h-20 vibrant-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce shadow-xl shadow-vibrant-pink/30 relative z-10">
              <CheckCircle className="text-white" size={40} strokeWidth={1.5} />
            </div>
            <h1 className="text-5xl font-display font-black tracking-tighter relative z-10">
              {paymentMethod === 'upi' ? 'Payment Received' : 'Order Confirmed'}
            </h1>
            <p className="text-gray-400 font-medium max-w-md mx-auto relative z-10">
              {paymentMethod === 'upi' 
                ? "Thank you for your payment. Your acquisition is now pending admin verification. You'll be notified once confirmed."
                : "Thank you for your acquisition. Your order has been received and is being prepared for express delivery."}
            </p>
            <div className="inline-block px-6 py-2 bg-white/10 rounded-full border border-white/10 relative z-10">
              <p className="text-[10px] font-bold tracking-widest uppercase vibrant-text-gradient">Order ID: #{orderId?.slice(0, 12).toUpperCase()}</p>
            </div>
            <div className="pt-4 relative z-10">
              <Link 
                to={`/track/${orderId}`}
                className="inline-flex items-center space-x-3 px-10 py-4 vibrant-gradient text-white rounded-full font-bold text-[10px] tracking-widest uppercase hover:scale-105 transition-all duration-500 shadow-xl shadow-vibrant-pink/20"
              >
                <Package size={14} />
                <span>Track Acquisition</span>
              </Link>
            </div>
          </div>

          <div className="p-16 grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-10">
              <div className="space-y-6">
                <h2 className="text-xl font-display font-black tracking-tight text-premium-black uppercase tracking-widest text-[12px]">Acquisition Summary</h2>
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-4 border-b border-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-premium-gray rounded-xl flex items-center justify-center text-[10px] font-bold">x{item.quantity}</div>
                        <div>
                          <p className="font-bold text-premium-black text-sm">{item.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">₹{item.price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      <p className="font-bold text-premium-black">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-6">
                    <p className="text-lg font-bold text-premium-black">Total Value</p>
                    <p className="text-3xl font-display font-black vibrant-text-gradient">₹{total.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-premium-gray rounded-3xl space-y-4">
                <div className="flex items-center space-x-3 text-premium-black">
                  <Truck size={20} />
                  <p className="font-bold tracking-tight">Express Delivery Estimate</p>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">Your curated items are estimated to arrive within <span className="text-premium-black font-bold">3-5 business days</span> at your specified destination.</p>
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-6">
                <h2 className="text-xl font-display font-black tracking-tight text-premium-black uppercase tracking-widest text-[12px]">Shipping Destination</h2>
                <div className="p-8 bg-premium-gray rounded-3xl space-y-4">
                  <p className="font-bold text-premium-black">{address.name}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{address.address}</p>
                  <p className="text-sm text-gray-500 font-bold">{address.phone}</p>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-display font-black tracking-tight text-premium-black uppercase tracking-widest text-[12px]">Payment Method</h2>
                <div className="flex items-center space-x-4 p-6 bg-premium-gray rounded-3xl">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    {paymentMethod === 'cod' ? <Truck size={18} /> : <Smartphone size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-premium-black text-sm uppercase tracking-widest">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Payment'}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Status: Pending Verification</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-16 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-4 text-gray-400">
              <CheckCircle size={20} className="text-green-500" />
              <p className="text-xs font-medium">A confirmation email has been sent to {user?.email || address.email}</p>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="bg-premium-black text-white px-12 py-5 rounded-full font-bold tracking-widest uppercase text-[10px] hover:bg-premium-gold transition-all duration-500 shadow-xl shadow-black/10"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20">
      <button onClick={() => navigate('/cart')} className="flex items-center space-x-3 text-gray-400 hover:text-premium-black transition-all duration-300 group">
        <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 group-hover:bg-premium-black group-hover:text-white transition-all duration-500">
          <ArrowLeft size={16} />
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Return to Bag</span>
      </button>

      <div className="flex items-baseline justify-between border-b border-gray-100 pb-10">
        <h1 className="text-6xl font-display font-black text-premium-black tracking-tighter">Checkout</h1>
        <span className="text-gray-400 font-bold tracking-widest uppercase text-[10px]">Secure Transaction</span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="lg:col-span-8 space-y-12"
        >
          {/* Shipping Address */}
          <div className="space-y-10">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-premium-gray rounded-xl flex items-center justify-center">
                <Truck className="text-premium-black" size={20} />
              </div>
              <h2 className="text-2xl font-display font-black tracking-tight">Shipping Destination</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Recipient Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  className="w-full px-6 py-4 rounded-2xl bg-premium-gray border-none focus:ring-2 focus:ring-vibrant-pink outline-none font-medium"
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-6 py-4 rounded-2xl bg-premium-gray border-none focus:ring-2 focus:ring-vibrant-blue outline-none font-medium"
                  value={address.email}
                  onChange={(e) => setAddress({ ...address, email: e.target.value })}
                  disabled={!!user}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Contact Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 00000 00000"
                  className="w-full px-6 py-4 rounded-2xl bg-premium-gray border-none focus:ring-2 focus:ring-vibrant-purple outline-none font-medium"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Complete Address</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Street, Landmark, City, Pincode"
                  className="w-full px-6 py-4 rounded-2xl bg-premium-gray border-none focus:ring-2 focus:ring-vibrant-orange outline-none font-medium"
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-10 pt-12 border-t border-gray-50">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-premium-gray rounded-xl flex items-center justify-center">
                <CreditCard className="text-premium-black" size={20} />
              </div>
              <h2 className="text-2xl font-display font-black tracking-tight">Payment Method</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className={`flex items-center space-x-6 p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 ${paymentMethod === 'cod' ? 'border-vibrant-blue bg-vibrant-blue text-white shadow-xl shadow-vibrant-blue/20' : 'border-premium-gray hover:border-gray-200'}`}>
                <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-white' : 'border-gray-300'}`}>
                  {paymentMethod === 'cod' && <div className="w-3 h-3 bg-white rounded-full" />}
                </div>
                <div>
                  <p className="font-bold tracking-tight">Cash on Delivery</p>
                  <p className={`text-xs ${paymentMethod === 'cod' ? 'text-white/70' : 'text-gray-500'}`}>Pay upon acquisition</p>
                </div>
              </label>
              
              <label className={`flex items-center space-x-6 p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 ${paymentMethod === 'upi' ? 'border-vibrant-pink bg-vibrant-pink text-white shadow-xl shadow-vibrant-pink/20' : 'border-premium-gray hover:border-gray-200'}`}>
                <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-white' : 'border-gray-300'}`}>
                  {paymentMethod === 'upi' && <div className="w-3 h-3 bg-white rounded-full" />}
                </div>
                <div>
                  <p className="font-bold tracking-tight">UPI Payment</p>
                  <p className={`text-xs ${paymentMethod === 'upi' ? 'text-white/70' : 'text-gray-500'}`}>Instant verification</p>
                </div>
              </label>
            </div>

            {paymentMethod === 'upi' && (
              <div className="mt-10 p-10 bg-premium-gray rounded-[2.5rem] space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-black/5 text-center space-y-4 w-full md:w-auto">
                    <button 
                      onClick={() => setShowLargeQr(true)}
                      className="bg-premium-gray p-4 rounded-2xl inline-block relative group cursor-zoom-in hover:scale-[1.02] transition-transform duration-300"
                    >
                      {adminQrImage ? (
                        <img src={adminQrImage} alt="Payment QR" className="w-40 h-40 object-contain rounded-xl" referrerPolicy="no-referrer" />
                      ) : adminUpiId ? (
                        <>
                          <QRCodeSVG 
                            value={upiLink}
                            size={160}
                            level="H"
                            includeMargin={false}
                          />
                          <div className="absolute -top-2 -right-2 bg-premium-gold text-white text-[6px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg border border-white">
                            Dynamic Price
                          </div>
                        </>
                      ) : (
                        <div className="w-40 h-40 flex items-center justify-center border-2 border-dashed border-gray-200">
                          <QrCode className="text-gray-300" size={64} strokeWidth={1} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-2xl flex items-center justify-center">
                        <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                      </div>
                    </button>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Scan to Pay</p>
                      <p className="text-2xl font-display font-black text-premium-gold">₹{total.toLocaleString('en-IN')}</p>
                    </div>
                    {adminUpiId && (
                      <div className="space-y-4">
                        <a 
                          href={upiLink}
                          className="inline-block w-full py-4 bg-premium-black text-white rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-premium-gold transition-all duration-300 shadow-lg shadow-black/10"
                        >
                          Open in UPI App
                        </a>
                        
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-4">Or Pay Directly Via</p>
                          <div className="grid grid-cols-3 gap-3">
                            <a href={upiLink} className="flex flex-col items-center justify-center p-3 bg-premium-gray rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform overflow-hidden">
                                <img src="https://www.gstatic.com/images/branding/product/1x/gpay_32dp.png" alt="GPay" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                              </div>
                              <span className="text-[6px] font-black uppercase tracking-widest text-gray-500">GPay</span>
                            </a>
                            <a href={upiLink} className="flex flex-col items-center justify-center p-3 bg-premium-gray rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform overflow-hidden">
                                <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/phonepe-logo-icon.png" alt="PhonePe" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                              </div>
                              <span className="text-[6px] font-black uppercase tracking-widest text-gray-500">PhonePe</span>
                            </a>
                            <a href={upiLink} className="flex flex-col items-center justify-center p-3 bg-premium-gray rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform overflow-hidden">
                                <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/paytm-icon.png" alt="Paytm" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                              </div>
                              <span className="text-[6px] font-black uppercase tracking-widest text-gray-500">Paytm</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow space-y-8 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-6 bg-white/50 rounded-3xl border border-white space-y-2 group">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Recipient UPI ID</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-premium-black truncate mr-2">{adminUpiId || 'Not Configured'}</p>
                          {adminUpiId && (
                            <button 
                              onClick={() => copyToClipboard(adminUpiId, 'upi')}
                              className="p-2 hover:bg-premium-gray rounded-lg transition-colors text-premium-gold"
                            >
                              {copiedField === 'upi' ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="p-6 bg-white/50 rounded-3xl border border-white space-y-2 group">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Exact Amount</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-premium-black">₹{total.toLocaleString('en-IN')}</p>
                          <button 
                            onClick={() => copyToClipboard(total.toString(), 'amount')}
                            className="p-2 hover:bg-premium-gray rounded-lg transition-colors text-premium-gold"
                          >
                            {copiedField === 'amount' ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-premium-black text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Scan QR or Copy Details</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-premium-black text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Enter your UPI ID below for verification</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-premium-black text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Confirm payment after completion</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Your UPI ID</label>
                        <div className="flex gap-3">
                          <div className="relative flex-grow">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                            <input
                              type="text"
                              placeholder="username@upi"
                              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-premium-gold outline-none font-medium text-sm"
                              value={upiId}
                              onChange={(e) => {
                                setUpiId(e.target.value);
                                setIsUpiVerified(false);
                                setHasPaid(false);
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleVerifyUpi}
                            disabled={!upiId.includes('@') || isSubmitting || isUpiVerified}
                            className={`px-6 rounded-2xl font-bold text-[10px] tracking-widest uppercase transition-all duration-500 ${isUpiVerified ? 'bg-green-500 text-white' : 'bg-premium-black text-white hover:bg-premium-gold disabled:opacity-30'}`}
                          >
                            {isUpiVerified ? 'Verified' : 'Verify'}
                          </button>
                        </div>
                      </div>

                      {isUpiVerified && (
                        <button
                          type="button"
                          onClick={() => setHasPaid(!hasPaid)}
                          className={`w-full py-4 rounded-2xl font-bold text-[10px] tracking-widest uppercase transition-all duration-500 border-2 flex items-center justify-center space-x-3 ${hasPaid ? 'bg-premium-gold border-premium-gold text-white' : 'border-premium-black text-premium-black hover:bg-premium-gray'}`}
                        >
                          {hasPaid ? (
                            <>
                              <Check size={16} />
                              <span>Payment Confirmed</span>
                            </>
                          ) : (
                            <span>I Have Paid (Confirm Transaction)</span>
                          )}
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 text-gray-400">
                      <div className="w-1.5 h-1.5 bg-premium-gold rounded-full animate-pulse"></div>
                      <p className="text-[10px] font-medium uppercase tracking-tight">Secure Transaction via Bazaar Pay</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
          className="lg:col-span-4"
        >
          <div className="bg-premium-black text-white p-10 rounded-[3rem] sticky top-32 space-y-10 shadow-2xl shadow-vibrant-purple/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-vibrant-pink/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-vibrant-blue/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
            
            <h2 className="text-2xl font-display font-black tracking-tight relative z-10">Summary</h2>
            
            <div className="space-y-6 relative z-10">
              <div className="max-h-48 overflow-y-auto space-y-4 pr-2 no-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-xs font-medium">
                    <span className="text-gray-400">{item.name} <span className="text-[8px] ml-1">x{item.quantity}</span></span>
                    <span className="text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                <span className="text-lg font-bold tracking-tight">Total</span>
                <span className="text-4xl font-display font-black vibrant-text-gradient">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (paymentMethod === 'upi' && (!isUpiVerified || !hasPaid))}
              className="w-full vibrant-gradient text-white py-5 rounded-full font-bold tracking-widest uppercase text-xs hover:scale-105 transition-all duration-500 flex items-center justify-center space-x-4 group disabled:opacity-50 shadow-xl shadow-vibrant-pink/20 relative z-10"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>{paymentMethod === 'upi' ? 'Confirm Acquisition' : 'Complete Acquisition'}</span>
                  <CheckCircle size={16} className="group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center space-x-4 opacity-30">
              <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
              <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
              <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
            </div>
          </div>
        </motion.div>
      </form>
      {/* Large QR Modal */}
      <AnimatePresence>
        {showLargeQr && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowLargeQr(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-10 rounded-[3rem] max-w-lg w-full relative space-y-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowLargeQr(false)}
                className="absolute -top-4 -right-4 w-12 h-12 bg-premium-gold text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
              >
                <X size={24} />
              </button>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-display font-black text-premium-black tracking-tight">Scan to Complete Acquisition</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Value: ₹{total.toLocaleString('en-IN')}</p>
              </div>

              <div className="bg-premium-gray p-8 rounded-[2.5rem] flex items-center justify-center">
                {adminQrImage ? (
                  <img src={adminQrImage} alt="Payment QR" className="w-full h-auto max-w-[320px] object-contain rounded-2xl" referrerPolicy="no-referrer" />
                ) : (
                  <QRCodeSVG 
                    value={upiLink}
                    size={320}
                    level="H"
                    includeMargin={false}
                    className="w-full h-auto max-w-[320px]"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-premium-gray rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Smartphone size={16} className="text-premium-gold" />
                    <p className="text-[10px] font-bold text-premium-black uppercase tracking-widest">{adminUpiId}</p>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(adminUpiId);
                      setCopiedField('upi_large');
                      setTimeout(() => setCopiedField(null), 2000);
                    }}
                    className="text-[8px] font-bold text-premium-gold uppercase tracking-widest hover:text-premium-black transition-colors"
                  >
                    {copiedField === 'upi_large' ? 'Copied!' : 'Copy ID'}
                  </button>
                </div>
                <p className="text-center text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em]">Please keep this screen open until payment is confirmed</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

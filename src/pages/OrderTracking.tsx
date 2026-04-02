import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';
import { Package, Truck, CheckCircle, Clock, Search, ArrowLeft, MapPin, Calendar, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [orderId, setOrderId] = useState(id || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      handleTrack(id);
    }
  }, [id]);

  const handleTrack = async (searchId: string) => {
    if (!searchId) return;
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'orders', searchId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
      } else {
        setError('Acquisition not found. Please verify your Reference ID.');
        setOrder(null);
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setError('An error occurred while retrieving acquisition details.');
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: 'payment_pending', label: 'Payment Verification', icon: Clock },
    { key: 'pending', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'In Transit', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const getCurrentStep = () => {
    if (!order) return -1;
    return statusSteps.findIndex(step => step.key === order.status);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
      <div className="space-y-4">
        <Link to="/" className="inline-flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-premium-gold transition-colors">
          <ArrowLeft size={14} />
          <span>Back to Boutique</span>
        </Link>
        <h1 className="text-5xl font-display font-black text-premium-black tracking-tighter">Track Acquisition</h1>
        <p className="text-gray-400 font-medium max-w-md">Monitor the journey of your curated essentials in real-time.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
        <input 
          type="text"
          placeholder="Enter your Reference ID (e.g. #ABC123...)"
          className="w-full pl-16 pr-32 py-6 rounded-[2rem] bg-premium-gray border-none focus:ring-2 focus:ring-premium-gold outline-none font-medium text-lg shadow-inner"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTrack(orderId)}
        />
        <button 
          onClick={() => handleTrack(orderId)}
          disabled={loading || !orderId}
          className="absolute right-3 top-3 bottom-3 px-8 bg-premium-black text-white rounded-2xl font-bold text-[10px] tracking-widest uppercase hover:bg-premium-gold transition-all duration-300 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-red-50 text-red-600 rounded-3xl text-sm font-medium border border-red-100"
        >
          {error}
        </motion.div>
      )}

      {order && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] shadow-2xl shadow-black/[0.03] border border-gray-50 overflow-hidden"
        >
          <div className="p-10 bg-premium-black text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-[10px] font-bold text-premium-gold uppercase tracking-widest mb-2">Reference ID</p>
              <p className="text-2xl font-mono font-bold">#{order.id.toUpperCase()}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Acquisition Date</p>
              <p className="text-lg font-bold">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="p-10 space-y-12">
            {/* Progress Stepper */}
            <div className="relative flex justify-between items-start">
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-100 -z-0" />
              <div 
                className="absolute top-6 left-0 h-0.5 bg-premium-gold transition-all duration-1000 -z-0"
                style={{ width: `${(getCurrentStep() / (statusSteps.length - 1)) * 100}%` }}
              />
              
              {statusSteps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx <= getCurrentStep();
                const isCurrent = idx === getCurrentStep();
                
                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center space-y-4 w-1/4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isActive ? 'bg-premium-gold text-white shadow-lg shadow-premium-gold/20' : 'bg-white text-gray-300 border border-gray-100'
                    } ${isCurrent ? 'scale-110 ring-4 ring-premium-gold/10' : ''}`}>
                      <Icon size={20} />
                    </div>
                    <div className="text-center">
                      <p className={`text-[8px] font-bold uppercase tracking-widest ${isActive ? 'text-premium-black' : 'text-gray-300'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-[6px] font-black text-premium-gold uppercase tracking-widest mt-1">Current Status</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-premium-gray rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-premium-black" size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                    <p className="font-bold text-premium-black">{order.shippingAddress.name}</p>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-xs">{order.shippingAddress.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-premium-gray rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="text-premium-black" size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estimated Arrival</p>
                    <p className="font-bold text-premium-black">
                      {order.estimatedDelivery 
                        ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                        : 'Awaiting Dispatch'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-premium-gray rounded-xl flex items-center justify-center flex-shrink-0">
                    <Smartphone className="text-premium-black" size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tracking ID</p>
                    <div className="flex items-center space-x-3">
                      <p className="font-bold text-premium-black">{order.trackingNumber || 'Pending Assignment'}</p>
                      {order.trackingNumber && (
                        <button 
                          onClick={() => navigator.clipboard.writeText(order.trackingNumber!)}
                          className="text-[8px] font-bold text-premium-gold uppercase tracking-widest hover:text-premium-black transition-colors"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-premium-gray rounded-3xl">
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-3">Acquisition Value</p>
                  <p className="text-3xl font-display font-black text-premium-gold">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

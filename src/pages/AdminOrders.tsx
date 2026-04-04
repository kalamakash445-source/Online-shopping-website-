import { useEffect, useState } from 'react';
import { api } from '../api';
import { Order } from '../types';
import { Link } from 'react-router-dom';
import { CheckCircle, Truck, Clock, Search, Eye, X, ArrowLeft } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrder(orderId, { status: newStatus as any });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const updateTracking = async (orderId: string, trackingNumber: string, estimatedDelivery: string) => {
    try {
      await api.updateOrder(orderId, { 
        trackingNumber, 
        estimatedDelivery 
      });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, trackingNumber, estimatedDelivery });
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.shippingAddress.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin h-12 w-12 border-t-2 border-premium-gold rounded-full" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 md:space-y-16 pb-20">
      <Link 
        to="/admin" 
        className="flex items-center space-x-3 text-gray-400 hover:text-premium-black transition-all duration-300 group"
      >
        <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 group-hover:bg-premium-black group-hover:text-white transition-all duration-500">
          <ArrowLeft size={16} />
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Back to Dashboard</span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
        <div>
          <p className="text-[10px] font-bold text-premium-gold uppercase tracking-[0.3em] mb-3">Order Management</p>
          <h1 className="text-6xl font-display font-black text-premium-black tracking-tighter">Acquisitions</h1>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input
            type="text"
            placeholder="Search by Client or Order ID..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-premium-gold outline-none font-medium text-sm shadow-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-black/[0.03] border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="px-10 py-6">Reference</th>
                <th className="px-10 py-6">Client</th>
                <th className="px-10 py-6">Value</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-premium-gray/30 transition-colors group">
                    <td className="px-10 py-6 font-mono text-[10px] text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-10 py-6">
                      <div>
                        <p className="font-bold text-premium-black">{order.shippingAddress.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{order.shippingAddress.phone}</p>
                      </div>
                    </td>
                    <td className="px-10 py-6 font-display font-black text-premium-black">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col space-y-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest outline-none border-none cursor-pointer transition-all duration-300 ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                            order.status === 'payment_pending' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          <option value="payment_pending">Payment Pending</option>
                          <option value="pending">Pending (Verified)</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        {order.trackingNumber && (
                          <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest px-2">
                            ID: {order.trackingNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <button onClick={() => setSelectedOrder(order)} className="p-3 bg-premium-gray text-premium-black hover:bg-premium-black hover:text-white rounded-xl transition-all duration-500">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <p className="text-gray-400 font-medium italic">No acquisitions found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-premium-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-premium-gold uppercase tracking-[0.2em] mb-1">Acquisition Details</p>
                <h2 className="text-3xl font-display font-black tracking-tight text-premium-black">Order Summary</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-3 hover:bg-premium-gray rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-10 space-y-10 max-h-[60vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client Information</p>
                  <div className="space-y-1">
                    <p className="font-bold text-premium-black">{selectedOrder.shippingAddress.name}</p>
                    <p className="text-sm text-gray-500 font-medium">{selectedOrder.shippingAddress.phone}</p>
                    <p className="text-gray-400 text-xs leading-relaxed">{selectedOrder.shippingAddress.address}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acquisition Metadata</p>
                  <div className="space-y-1">
                    <p className="font-mono text-[10px] text-premium-gold">#{selectedOrder.id.toUpperCase()}</p>
                    <p className="text-sm text-gray-500 font-medium">{new Date(selectedOrder.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{selectedOrder.paymentMethod}</p>
                    {selectedOrder.paymentMethod === 'upi' && selectedOrder.upiId && (
                      <p className="text-premium-gold text-[10px] font-bold tracking-widest uppercase mt-1">UPI: {selectedOrder.upiId}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-premium-gray rounded-3xl space-y-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shipping & Tracking</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Tracking Number</label>
                    <input 
                      type="text"
                      placeholder="Enter Tracking ID..."
                      className="w-full px-4 py-3 rounded-xl bg-white border-none focus:ring-2 focus:ring-premium-gold outline-none text-xs font-medium"
                      defaultValue={selectedOrder.trackingNumber || ''}
                      onBlur={(e) => updateTracking(selectedOrder.id, e.target.value, selectedOrder.estimatedDelivery || '')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Estimated Delivery</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-3 rounded-xl bg-white border-none focus:ring-2 focus:ring-premium-gold outline-none text-xs font-medium"
                      defaultValue={selectedOrder.estimatedDelivery || ''}
                      onBlur={(e) => updateTracking(selectedOrder.id, selectedOrder.trackingNumber || '', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Curated Items</p>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-premium-gray p-6 rounded-2xl group hover:bg-premium-black hover:text-white transition-all duration-500">
                      <div>
                        <p className="font-bold tracking-tight">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">₹{item.price.toLocaleString('en-IN')} <span className="mx-1">×</span> {item.quantity}</p>
                      </div>
                      <p className="font-display font-black text-lg">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50 flex justify-between items-center">
                <p className="text-lg font-bold tracking-tight text-premium-black">Total Value</p>
                <p className="text-4xl font-display font-black text-premium-gold">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
            
            <div className="p-10 bg-premium-gray flex justify-between items-center">
              {selectedOrder.status === 'payment_pending' && (
                <button
                  onClick={() => updateStatus(selectedOrder.id, 'pending')}
                  className="bg-green-600 text-white px-12 py-4 rounded-full font-bold tracking-widest uppercase text-[10px] hover:bg-green-700 transition-all duration-500 shadow-xl shadow-green-900/10 flex items-center space-x-2"
                >
                  <CheckCircle size={14} />
                  <span>Verify Payment</span>
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-premium-black text-white px-12 py-4 rounded-full font-bold tracking-widest uppercase text-[10px] hover:bg-premium-gold transition-all duration-500 shadow-xl shadow-black/10 ml-auto"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

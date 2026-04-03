import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Product, Order, UserProfile } from '../types';
import { LayoutDashboard, Package, ShoppingCart, Users, TrendingUp, Clock, Settings, Smartphone, Save, QrCode, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminUpiId, setAdminUpiId] = useState('');
  const [adminQrImage, setAdminQrImage] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await api.getProducts();
        const orders = await api.getOrders();
        
        const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        setStats({
          products: products.length,
          orders: orders.length,
          users: 0,
          revenue
        });

        setRecentOrders(orders.slice(0, 5));

        // Fetch Payment Settings
        const data = await api.getSettings('payment');
        if (data) {
          setAdminUpiId(data.adminUpiId || '');
          setAdminQrImage(data.adminQrImage || null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredOrders = recentOrders.filter(order => 
    order.shippingAddress.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await api.updateSettings('payment', { 
        adminUpiId,
        adminQrImage 
      });
      alert('Payment settings updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminQrImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const seedData = async () => {
    const sampleProducts = [
      {
        name: "iPhone 15 Pro",
        description: "Experience the ultimate performance with the A17 Pro chip and a stunning titanium design.",
        price: 134900,
        category: "Electronics",
        image: "https://picsum.photos/seed/iphone/800/800",
        rating: 4.9,
        stock: 50,
        createdAt: new Date().toISOString()
      },
      {
        name: "MacBook Air M3",
        description: "The world's most popular laptop is now even better with the M3 chip and up to 18 hours of battery life.",
        price: 114900,
        category: "Electronics",
        image: "https://picsum.photos/seed/macbook/800/800",
        rating: 4.8,
        stock: 30,
        createdAt: new Date().toISOString()
      },
      {
        name: "Nike Air Max 270",
        description: "Nike's first lifestyle Air Max brings you style, comfort and big attitude.",
        price: 12995,
        category: "Fashion",
        image: "https://picsum.photos/seed/nike/800/800",
        rating: 4.7,
        stock: 100,
        createdAt: new Date().toISOString()
      },
      {
        name: "Sony WH-1000XM5",
        description: "Industry-leading noise cancellation and exceptional sound quality for an immersive listening experience.",
        price: 29990,
        category: "Electronics",
        image: "https://picsum.photos/seed/sony/800/800",
        rating: 4.9,
        stock: 45,
        createdAt: new Date().toISOString()
      }
    ];

    try {
      for (const product of sampleProducts) {
        await api.createProduct(product);
      }
      alert('Sample products added successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin h-12 w-12 border-t-2 border-premium-gold rounded-full" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
        <div>
          <p className="text-[10px] font-bold text-premium-gold uppercase tracking-[0.3em] mb-3">Management Console</p>
          <h1 className="text-6xl font-display font-black text-premium-black tracking-tighter">Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-4">
          {stats.products === 0 && (
            <button onClick={seedData} className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold tracking-widest uppercase text-[10px] hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
              Seed Sample Data
            </button>
          )}
          <Link to="/admin/products" className="bg-premium-gray text-premium-black px-8 py-4 rounded-full font-bold tracking-widest uppercase text-[10px] hover:bg-premium-black hover:text-white transition-all duration-500">
            Manage Products
          </Link>
          <Link to="/admin/orders" className="bg-premium-black text-white px-8 py-4 rounded-full font-bold tracking-widest uppercase text-[10px] hover:bg-premium-gold transition-all duration-500 shadow-xl shadow-black/10">
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} icon={<TrendingUp size={20} />} color="text-green-600" bgColor="bg-green-50" />
        <StatCard title="Total Orders" value={stats.orders} icon={<ShoppingCart size={20} />} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard title="Total Products" value={stats.products} icon={<Package size={20} />} color="text-orange-600" bgColor="bg-orange-50" />
        <StatCard title="Total Users" value={stats.users} icon={<Users size={20} />} color="text-purple-600" bgColor="bg-purple-50" />
      </div>

      {/* Payment Settings Section */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-black/[0.03] border border-gray-50 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex items-center space-x-4">
          <div className="w-10 h-10 bg-premium-gray rounded-xl flex items-center justify-center">
            <Settings className="text-premium-black" size={20} />
          </div>
          <h2 className="text-2xl font-display font-black tracking-tight text-premium-black">Payment Settings</h2>
        </div>
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="max-w-xl flex-grow space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin UPI ID (for receiving payments)</label>
                <div className="flex gap-4">
                  <div className="relative flex-grow">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-premium-gray border-none focus:ring-2 focus:ring-premium-gold outline-none font-medium"
                      value={adminUpiId}
                      onChange={(e) => setAdminUpiId(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="bg-premium-black text-white px-8 rounded-2xl font-bold tracking-widest uppercase text-[10px] hover:bg-premium-gold transition-all duration-500 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isSavingSettings ? (
                      <div className="animate-spin h-4 w-4 border-t-2 border-white rounded-full" />
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Save Settings</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">This UPI ID will be used to generate a QR code for customers during checkout.</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custom QR Code Image (Optional)</label>
                <div className="flex items-center gap-6">
                  <label className="flex-grow cursor-pointer group">
                    <div className="flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl bg-premium-gray border-2 border-dashed border-gray-200 group-hover:border-premium-gold transition-all duration-300">
                      <QrCode className="text-gray-400 group-hover:text-premium-gold" size={20} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-premium-gold">Upload Custom QR Image</span>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  {adminQrImage && (
                    <button 
                      onClick={() => setAdminQrImage(null)}
                      className="text-[8px] font-bold text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-medium">If uploaded, this image will be shown instead of the generated QR code.</p>
              </div>

              <div className="p-6 bg-premium-gray rounded-3xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <QrCode className="text-premium-black" size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dynamic Price QR</p>
                    <p className="text-xs font-bold text-premium-black">Auto-Encodes Total</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-premium-gold rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Enabled</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                <span className="text-premium-gold font-bold">Pro Tip:</span> The generated QR code automatically includes the customer's order total (Dynamic Price). Custom images are static and will require manual entry of the amount by the customer.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4 p-10 bg-premium-gray rounded-[2.5rem] border border-gray-100 min-w-[280px]">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Checkout Preview</p>
              <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-black/5">
                {adminQrImage ? (
                  <img src={adminQrImage} alt="Custom QR" className="w-[140px] h-[140px] object-contain rounded-xl" referrerPolicy="no-referrer" />
                ) : adminUpiId ? (
                  <QRCodeSVG 
                    value={`upi://pay?pa=${adminUpiId}&pn=Bazaar&cu=INR`}
                    size={140}
                    level="H"
                  />
                ) : (
                  <div className="w-[140px] h-[140px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl space-y-2">
                    <QrCode className="text-gray-200" size={40} strokeWidth={1} />
                    <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Enter ID Above</p>
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-[8px] font-bold text-premium-gold uppercase tracking-widest mb-1">
                  {adminQrImage ? 'Custom Image' : 'Generated QR'}
                </p>
                <p className="text-[10px] font-bold text-premium-black truncate max-w-[180px]">{adminUpiId || 'No UPI ID Set'}</p>
              </div>
            </div>
          </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-black/[0.03] border border-gray-50 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-premium-gray rounded-xl flex items-center justify-center">
              <Clock className="text-premium-black" size={20} />
            </div>
            <h2 className="text-2xl font-display font-black tracking-tight text-premium-black">Recent Acquisitions</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 flex-grow max-w-2xl">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input
                type="text"
                placeholder="Search by Client or Order ID..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-premium-gray border-none focus:ring-2 focus:ring-premium-gold outline-none font-medium text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link to="/admin/orders" className="text-[10px] font-bold text-premium-gold tracking-widest uppercase hover:text-premium-black transition-colors whitespace-nowrap">View All Orders</Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="px-10 py-6">Reference</th>
                <th className="px-10 py-6">Client</th>
                <th className="px-10 py-6">Value</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-premium-gray/30 transition-colors group">
                    <td className="px-10 py-6 font-mono text-[10px] text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-10 py-6 font-bold text-premium-black">{order.shippingAddress.name}</td>
                    <td className="px-10 py-6 font-display font-black text-premium-black">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest inline-block w-fit ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                          order.status === 'payment_pending' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                        {order.trackingNumber && (
                          <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest">
                            ID: {order.trackingNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-gray-400 text-xs font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
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
    </div>
  );
}

function StatCard({ title, value, icon, color, bgColor }: { title: string, value: string | number, icon: React.ReactNode, color: string, bgColor: string }) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-black/[0.02] border border-gray-50 hover:border-premium-gold/20 transition-all duration-500 group">
      <div className={`w-12 h-12 ${bgColor} ${color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</p>
        <p className="text-4xl font-display font-black text-premium-black tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

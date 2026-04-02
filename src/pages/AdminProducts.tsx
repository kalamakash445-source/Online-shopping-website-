import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { Plus, Trash2, Edit2, X, Check, Package, Search, Upload, Image as ImageIcon } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) { // Limit to ~800KB for Firestore document limit
        alert('Image size too large. Please select an image under 800KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), data);
      } else {
        await addDoc(collection(db, 'products'), data);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', category: '', image: '', stock: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      stock: (product.stock || 0).toString()
    });
    setIsModalOpen(true);
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
          <p className="text-[10px] font-bold text-premium-gold uppercase tracking-[0.3em] mb-3">Inventory Management</p>
          <h1 className="text-6xl font-display font-black text-premium-black tracking-tighter">Collection</h1>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setFormData({ name: '', description: '', price: '', category: '', image: '', stock: '' }); setIsModalOpen(true); }}
          className="flex items-center space-x-4 bg-premium-black text-white px-10 py-5 rounded-full font-bold tracking-widest uppercase text-[10px] hover:bg-premium-gold transition-all duration-500 shadow-2xl shadow-black/10 group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-black/[0.03] border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="px-10 py-6">Product</th>
                <th className="px-10 py-6">Category</th>
                <th className="px-10 py-6">Price</th>
                <th className="px-10 py-6">Stock</th>
                <th className="px-10 py-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-premium-gray/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-premium-gray rounded-2xl overflow-hidden p-2 group-hover:scale-110 transition-transform duration-500">
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                      </div>
                      <span className="font-bold text-premium-black line-clamp-1">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[8px] font-bold text-premium-gold uppercase tracking-widest border border-premium-gold/20 px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-10 py-6 font-display font-black text-premium-black">₹{product.price.toLocaleString('en-IN')}</td>
                  <td className="px-10 py-6 text-gray-400 font-bold text-xs">{product.stock || 0} <span className="text-[8px] ml-1">Units</span></td>
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button onClick={() => openEditModal(product)} className="p-3 bg-white text-premium-black hover:bg-premium-black hover:text-white rounded-xl shadow-sm border border-gray-100 transition-all duration-500">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-3 bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-xl shadow-sm border border-gray-100 transition-all duration-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-premium-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-premium-gold uppercase tracking-[0.2em] mb-1">{editingProduct ? 'Update Collection' : 'New Acquisition'}</p>
                <h2 className="text-3xl font-display font-black tracking-tight text-premium-black">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-premium-gray rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-10 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Product Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-premium-gray border-none focus:ring-2 focus:ring-premium-gold outline-none font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Category</label>
                  <input
                    type="text"
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-premium-gray border-none focus:ring-2 focus:ring-premium-gold outline-none font-medium"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Price (₹)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-premium-gray border-none focus:ring-2 focus:ring-premium-gold outline-none font-medium"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Stock Units</label>
                  <input
                    type="number"
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-premium-gray border-none focus:ring-2 focus:ring-premium-gold outline-none font-medium"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
                
                <div className="md:col-span-2 space-y-6">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Visual Asset</label>
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="w-full md:w-56 h-56 bg-premium-gray rounded-[2rem] border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden relative group">
                      {formData.image ? (
                        <>
                          <img src={formData.image} alt="Preview" className="w-full h-full object-contain mix-blend-multiply" />
                          <button 
                            type="button"
                            onClick={() => setFormData({ ...formData, image: '' })}
                            className="absolute inset-0 bg-premium-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          >
                            <X size={24} />
                          </button>
                        </>
                      ) : (
                        <ImageIcon className="text-gray-300" size={40} strokeWidth={1} />
                      )}
                    </div>
                    
                    <div className="flex-grow space-y-6">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="flex items-center justify-center space-x-4 bg-premium-black text-white px-8 py-4 rounded-full hover:bg-premium-gold transition-all duration-500 font-bold tracking-widest uppercase text-[10px] cursor-pointer shadow-xl shadow-black/10"
                        >
                          <Upload size={16} />
                          <span>Upload Asset</span>
                        </label>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-gray-400">
                          <ImageIcon size={16} />
                        </div>
                        <input
                          type="url"
                          placeholder="Or provide direct URL..."
                          className="w-full pl-14 pr-6 py-4 rounded-2xl bg-premium-gray border-none focus:ring-2 focus:ring-premium-gold outline-none font-medium"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium tracking-wide">Optimal: High resolution, square aspect ratio, under 800KB.</p>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Product Narrative</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-6 py-4 rounded-2xl bg-premium-gray border-none focus:ring-2 focus:ring-premium-gold outline-none font-medium leading-relaxed"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-6 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-10 py-4 rounded-full font-bold tracking-widest uppercase text-[10px] text-gray-400 hover:text-premium-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-premium-black text-white px-12 py-4 rounded-full font-bold tracking-widest uppercase text-[10px] hover:bg-premium-gold transition-all duration-500 shadow-2xl shadow-black/10"
                >
                  {editingProduct ? 'Update Collection' : 'Add to Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

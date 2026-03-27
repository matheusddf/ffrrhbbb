import React, { useState, useEffect } from 'react';
import { 
  X, 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  Save,
  ArrowLeft,
  Store,
  MapPin,
  Truck,
  DollarSign,
  Award,
  Map,
  ChevronRight,
  Image as ImageIcon,
  Check,
  Upload,
  Loader2,
  ClipboardList,
  User,
  Phone,
  Calendar,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { categories as initialCategories, products as initialProducts, storeConfig as initialStoreConfig } from '../data';
import { Link } from 'react-router-dom';
import { Product, Neighborhood, LoyaltyReward, Category, Order } from '../types';
import { supabase } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';

export default function AdminPage() {
  const [localStoreConfig, setLocalStoreConfig] = useState(initialStoreConfig);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [localCategories, setLocalCategories] = useState<Category[]>(initialCategories);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'settings' | 'loyalty' | 'neighborhoods' | 'orders'>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Subscribe to new orders
    const ordersSubscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders(prev => [payload.new, ...prev]);
        // Play notification sound if possible
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
          audio.play();
        } catch (e) {}
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [config, products, categories, ordersData] = await Promise.all([
        supabaseService.getStoreConfig(),
        supabaseService.getProducts(),
        supabaseService.getCategories(),
        supabaseService.getAllOrders()
      ]);
      
      if (config) setLocalStoreConfig(config);
      if (products.length > 0) setLocalProducts(products);
      if (categories.length > 0) setLocalCategories(categories);
      if (ordersData.length > 0) setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await supabaseService.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Erro ao atualizar status do pedido.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    try {
      await supabaseService.saveProduct(editingProduct);
      await fetchData();
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erro ao salvar produto.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setIsUploading(true);
    try {
      const url = await supabaseService.uploadImage(file);
      if (url) {
        setEditingProduct({ ...editingProduct, image: url });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao carregar imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTabImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, tab: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await supabaseService.uploadImage(file);
      if (url) {
        setLocalStoreConfig(prev => ({
          ...prev,
          tabImages: {
            ...prev.tabImages,
            [tab]: url
          }
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao carregar imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await supabaseService.deleteProduct(id);
      setLocalProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await supabaseService.updateStoreConfig(localStoreConfig);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Erro ao salvar configurações.');
    }
  };

  const addNeighborhood = () => {
    const newNeighborhood: Neighborhood = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Bairro',
      fee: 0
    };
    setLocalStoreConfig(prev => ({
      ...prev,
      neighborhoods: [...prev.neighborhoods, newNeighborhood]
    }));
  };

  const updateNeighborhood = (id: string, updates: Partial<Neighborhood>) => {
    setLocalStoreConfig(prev => ({
      ...prev,
      neighborhoods: prev.neighborhoods.map(n => n.id === id ? { ...n, ...updates } : n)
    }));
  };

  const removeNeighborhood = (id: string) => {
    setLocalStoreConfig(prev => ({
      ...prev,
      neighborhoods: prev.neighborhoods.filter(n => n.id !== id)
    }));
  };

  const addReward = () => {
    const newReward: LoyaltyReward = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Prêmio',
      pointsNeeded: 100
    };
    setLocalStoreConfig(prev => ({
      ...prev,
      loyalty: {
        ...prev.loyalty,
        rewards: [...prev.loyalty.rewards, newReward]
      }
    }));
  };

  const updateReward = (id: string, updates: Partial<LoyaltyReward>) => {
    setLocalStoreConfig(prev => ({
      ...prev,
      loyalty: {
        ...prev.loyalty,
        rewards: prev.loyalty.rewards.map(r => r.id === id ? { ...r, ...updates } : r)
      }
    }));
  };

  const removeReward = (id: string) => {
    setLocalStoreConfig(prev => ({
      ...prev,
      loyalty: {
        ...prev.loyalty,
        rewards: prev.loyalty.rewards.filter(r => r.id !== id)
      }
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 text-white flex flex-col fixed inset-y-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Store className="text-white" />
            Admin Panel
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'dashboard' ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5"
            )}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'orders' ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5"
            )}
          >
            <ClipboardList size={20} />
            Pedidos
            {orders.filter(o => o.status === 'pendente').length > 0 && (
              <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {orders.filter(o => o.status === 'pendente').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'products' ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5"
            )}
          >
            <ShoppingBag size={20} />
            Cardápio
          </button>
          <button 
            onClick={() => setActiveTab('loyalty')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'loyalty' ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5"
            )}
          >
            <Award size={20} />
            Fidelidade
          </button>
          <button 
            onClick={() => setActiveTab('neighborhoods')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'neighborhoods' ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5"
            )}
          >
            <Map size={20} />
            Bairros / Frete
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              activeTab === 'settings' ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5"
            )}
          >
            <Settings size={20} />
            Configurações
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link 
            to="/" 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={20} />
            Ver Cardápio
          </Link>
        </div>
      </aside>

      {/* Product Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white z-[101] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 bg-neutral-900 text-white flex items-center justify-between">
                <h2 className="text-xl font-bold">Editar Produto</h2>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Nome do Produto</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Categoria</label>
                      <select 
                        className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                        value={editingProduct.categoryId}
                        onChange={(e) => setEditingProduct({...editingProduct, categoryId: e.target.value})}
                      >
                        {localCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Preço Atual</label>
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Preço Antigo</label>
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                          value={editingProduct.oldPrice || ''}
                          onChange={(e) => setEditingProduct({...editingProduct, oldPrice: e.target.value ? Number(e.target.value) : undefined})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Imagem do Produto</label>
                      <div className="flex flex-col gap-4">
                        <div className="w-full h-48 bg-neutral-100 rounded-2xl overflow-hidden relative group">
                          {editingProduct.image ? (
                            <img src={editingProduct.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                              <ImageIcon size={48} />
                            </div>
                          )}
                          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <div className="bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                              {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                              Alterar Foto
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                          </label>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Ou cole a URL da imagem aqui"
                          className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all text-sm"
                          value={editingProduct.image}
                          onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Selo (Badge)</label>
                      <select 
                        className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                        value={editingProduct.badge || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, badge: e.target.value as any || undefined})}
                      >
                        <option value="">Nenhum</option>
                        <option value="MAIS PEDIDO">MAIS PEDIDO</option>
                        <option value="NOVIDADE">NOVIDADE</option>
                        <option value="RECOMENDADO">RECOMENDADO</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                      <span className="font-bold text-sm">Disponível</span>
                      <button 
                        type="button"
                        onClick={() => setEditingProduct({...editingProduct, available: !editingProduct.available})}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative",
                          editingProduct.available ? "bg-black" : "bg-neutral-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          editingProduct.available ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Peça também (Sugestões)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-neutral-50 rounded-xl border border-neutral-100">
                    {localProducts.filter(p => p.id !== editingProduct.id).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const current = editingProduct.suggestedProducts || [];
                          const updated = current.includes(p.id) 
                            ? current.filter(id => id !== p.id)
                            : [...current, p.id];
                          setEditingProduct({...editingProduct, suggestedProducts: updated});
                        }}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg text-xs transition-all border",
                          (editingProduct.suggestedProducts || []).includes(p.id)
                            ? "bg-black text-white border-black"
                            : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                        )}
                      >
                        <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                          <img src={p.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="truncate flex-1 text-left">{p.name}</span>
                        {(editingProduct.suggestedProducts || []).includes(p.id) && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-neutral-900">Grupos de Opções</h3>
                    <button 
                      type="button"
                      onClick={() => {
                        const newGroup = {
                          id: Math.random().toString(36).substr(2, 9),
                          name: 'Novo Grupo',
                          required: false,
                          options: []
                        };
                        setEditingProduct({
                          ...editingProduct,
                          optionGroups: [...(editingProduct.optionGroups || []), newGroup]
                        });
                      }}
                      className="text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus size={14} />
                      Adicionar Grupo
                    </button>
                  </div>

                  <div className="space-y-6">
                    {editingProduct.optionGroups?.map((group, gIdx) => (
                      <div key={group.id} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <input 
                              type="text"
                              placeholder="Nome do grupo (ex: Escolha o pão)"
                              className="w-full bg-white border-none rounded-lg py-2 px-3 text-sm font-bold focus:ring-2 focus:ring-neutral-900"
                              value={group.name}
                              onChange={(e) => {
                                const updated = [...(editingProduct.optionGroups || [])];
                                updated[gIdx] = { ...group, name: e.target.value };
                                setEditingProduct({ ...editingProduct, optionGroups: updated });
                              }}
                            />
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox"
                                  className="rounded border-neutral-300 text-black focus:ring-black"
                                  checked={group.required}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct.optionGroups || [])];
                                    updated[gIdx] = { ...group, required: e.target.checked };
                                    setEditingProduct({ ...editingProduct, optionGroups: updated });
                                  }}
                                />
                                <span className="text-xs font-medium text-neutral-600">Obrigatório</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-neutral-500">Máx:</span>
                                <input 
                                  type="number"
                                  className="w-12 bg-white border-none rounded-lg py-1 px-2 text-xs text-center focus:ring-2 focus:ring-neutral-900"
                                  value={group.max || ''}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct.optionGroups || [])];
                                    updated[gIdx] = { ...group, max: e.target.value ? Number(e.target.value) : undefined };
                                    setEditingProduct({ ...editingProduct, optionGroups: updated });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              const updated = editingProduct.optionGroups?.filter((_, i) => i !== gIdx);
                              setEditingProduct({ ...editingProduct, optionGroups: updated });
                            }}
                            className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Opções</span>
                            <button 
                              type="button"
                              onClick={() => {
                                const newOpt = { id: Math.random().toString(36).substr(2, 9), name: 'Nova Opção' };
                                const updatedGroups = [...(editingProduct.optionGroups || [])];
                                updatedGroups[gIdx] = { ...group, options: [...group.options, newOpt] };
                                setEditingProduct({ ...editingProduct, optionGroups: updatedGroups });
                              }}
                              className="text-[10px] font-bold text-neutral-900 hover:underline"
                            >
                              + Adicionar Opção
                            </button>
                          </div>
                          <div className="space-y-2">
                            {group.options.map((opt, oIdx) => (
                              <div key={opt.id} className="flex items-center gap-2">
                                <input 
                                  type="text"
                                  placeholder="Nome da opção"
                                  className="flex-1 bg-white border-none rounded-lg py-2 px-3 text-xs focus:ring-2 focus:ring-neutral-900"
                                  value={opt.name}
                                  onChange={(e) => {
                                    const updatedGroups = [...(editingProduct.optionGroups || [])];
                                    const updatedOpts = [...group.options];
                                    updatedOpts[oIdx] = { ...opt, name: e.target.value };
                                    updatedGroups[gIdx] = { ...group, options: updatedOpts };
                                    setEditingProduct({ ...editingProduct, optionGroups: updatedGroups });
                                  }}
                                />
                                <div className="relative w-24">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">R$</span>
                                  <input 
                                    type="number"
                                    step="0.01"
                                    placeholder="0,00"
                                    className="w-full bg-white border-none rounded-lg py-2 pl-6 pr-2 text-xs focus:ring-2 focus:ring-neutral-900"
                                    value={opt.price || ''}
                                    onChange={(e) => {
                                      const updatedGroups = [...(editingProduct.optionGroups || [])];
                                      const updatedOpts = [...group.options];
                                      updatedOpts[oIdx] = { ...opt, price: e.target.value ? Number(e.target.value) : undefined };
                                      updatedGroups[gIdx] = { ...group, options: updatedOpts };
                                      setEditingProduct({ ...editingProduct, optionGroups: updatedGroups });
                                    }}
                                  />
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const updatedGroups = [...(editingProduct.optionGroups || [])];
                                    const updatedOpts = group.options.filter((_, i) => i !== oIdx);
                                    updatedGroups[gIdx] = { ...group, options: updatedOpts };
                                    setEditingProduct({ ...editingProduct, optionGroups: updatedGroups });
                                  }}
                                  className="p-2 text-neutral-300 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Descrição</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all resize-none"
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 bg-neutral-100 text-neutral-600 py-4 rounded-2xl font-bold hover:bg-neutral-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-black text-white py-4 rounded-2xl font-bold shadow-lg shadow-neutral-200 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    Salvar Produto
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold capitalize">{activeTab}</h2>
            <p className="text-neutral-500">Gerencie sua loja e cardápio em tempo real.</p>
          </div>
          <button 
            onClick={handleSaveConfig}
            className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all"
          >
            <Save size={20} />
            Salvar Alterações
          </button>
        </header>

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Pedidos Recentes</h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs text-neutral-500">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" /> Pendente
                </span>
                <span className="flex items-center gap-1 text-xs text-neutral-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" /> Em Preparo
                </span>
                <span className="flex items-center gap-1 text-xs text-neutral-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full" /> Concluído
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Pedido #{order.id.slice(0, 8)}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm font-bold">
                            <User size={14} className="text-neutral-400" />
                            {order.customer_name}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-neutral-500">
                            <Phone size={14} className="text-neutral-400" />
                            {order.customer_phone}
                          </div>
                        </div>
                      </div>
                      <select 
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border-none focus:ring-2 focus:ring-neutral-900 transition-all cursor-pointer",
                          order.status === 'pendente' ? "bg-amber-100 text-amber-700" :
                          order.status === 'preparando' ? "bg-blue-100 text-blue-700" :
                          order.status === 'concluido' ? "bg-green-100 text-green-700" :
                          "bg-neutral-100 text-neutral-700"
                        )}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="preparando">Preparando</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>

                    <div className="bg-neutral-50 p-4 rounded-xl space-y-2">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-neutral-600">
                            <span className="font-bold text-neutral-900">{item.quantity}x</span> {item.name}
                            {item.selectedOptions?.map((g: any) => (
                              <span key={g.groupId} className="block text-[10px] text-neutral-400 ml-4">
                                {g.groupName}: {g.options.map((o: any) => o.name).join(', ')}
                              </span>
                            ))}
                          </span>
                          <span className="font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Calendar size={14} />
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Clock size={14} />
                        {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Truck size={14} />
                        {order.delivery_type === 'entrega' ? `Entrega (${order.neighborhood})` : 'Retirada'}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-neutral-400">Total</span>
                        <span className="text-xl font-black">R$ {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <p className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-2">Total de Produtos</p>
              <p className="text-4xl font-bold">{localProducts.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <p className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-2">Pedidos Hoje</p>
              <p className="text-4xl font-bold">{orders.filter(o => new Date(o.createdAt || '').toDateString() === new Date().toDateString()).length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <p className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-2">Status da Loja</p>
              <div className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full", localStoreConfig.isOpen ? "bg-black" : "bg-neutral-300")} />
                <p className="text-2xl font-bold">{localStoreConfig.isOpen ? 'Aberta' : 'Fechada'}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <p className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-2">Taxa de Entrega</p>
              <p className="text-2xl font-bold">R$ {localStoreConfig.deliveryFee.toFixed(2)}</p>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="font-bold text-lg">Pedidos Recentes</h3>
              </div>
              <div className="divide-y">
                {orders.length === 0 ? (
                  <div className="p-12 text-center text-neutral-400">Nenhum pedido recebido ainda.</div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="p-6 hover:bg-neutral-50 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Pedido #{order.id.slice(0, 8)}</span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              order.status === 'delivered' ? "bg-green-100 text-green-700" : 
                              order.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-500"
                            )}>
                              {order.status === 'pending' ? 'Pendente' :
                               order.status === 'preparing' ? 'Preparando' :
                               order.status === 'delivered' ? 'Entregue' : 'Cancelado'}
                            </span>
                          </div>
                          <p className="font-bold text-lg">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                            <span className="flex items-center gap-1"><User size={14} /> {order.customerPhone}</span>
                            <span className="flex items-center gap-1"><MapPin size={14} /> {order.deliveryType === 'entrega' ? order.neighborhood : order.deliveryType}</span>
                            <span className="flex items-center gap-1"><DollarSign size={14} /> {order.paymentMethod}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-4">
                          <p className="text-2xl font-bold">R$ {order.total.toFixed(2)}</p>
                          <div className="flex gap-2">
                            <select 
                              className="bg-neutral-100 border-none rounded-lg py-2 px-3 text-xs font-bold focus:ring-2 focus:ring-neutral-900"
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                            >
                              <option value="pending">Pendente</option>
                              <option value="preparing">Preparando</option>
                              <option value="delivered">Entregue</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Lista de Produtos</h3>
              <button 
                onClick={() => setEditingProduct({
                  id: Math.random().toString(36).substr(2, 9),
                  name: '',
                  description: '',
                  price: 0,
                  image: 'https://picsum.photos/seed/new-product/400/300',
                  categoryId: localCategories[0]?.id || '',
                  available: true
                })}
                className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-neutral-800 transition-all"
              >
                <Plus size={18} />
                Novo Produto
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-neutral-50 text-neutral-400 text-xs uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Preço</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {localProducts.map(product => (
                  <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-sm">{product.name}</p>
                          <p className="text-xs text-neutral-400 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {localCategories.find(c => c.id === product.categoryId)?.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        {product.oldPrice && <span className="text-[10px] text-neutral-400 line-through">R$ {product.oldPrice.toFixed(2)}</span>}
                        <span className="font-bold text-sm">R$ {product.price.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        product.available ? "bg-black text-white" : "bg-neutral-100 text-neutral-400"
                      )}>
                        {product.available ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingProduct(product)}
                          className="p-2 hover:bg-neutral-100 text-neutral-600 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setLocalProducts(localProducts.filter(p => p.id !== product.id))}
                          className="p-2 hover:bg-neutral-100 text-neutral-400 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Award className="text-neutral-900" />
                  Configuração do Programa de Fidelidade
                </h3>
                <button 
                  onClick={() => setLocalStoreConfig({
                    ...localStoreConfig, 
                    loyalty: { ...localStoreConfig.loyalty, enabled: !localStoreConfig.loyalty.enabled }
                  })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    localStoreConfig.loyalty.enabled ? "bg-black" : "bg-neutral-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    localStoreConfig.loyalty.enabled ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Pontos por R$ 1,00</label>
                  <input 
                    type="number" 
                    className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                    value={localStoreConfig.loyalty.pointsPerReal}
                    onChange={(e) => setLocalStoreConfig({
                      ...localStoreConfig, 
                      loyalty: { ...localStoreConfig.loyalty, pointsPerReal: Number(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Bônus de Boas-vindas (Pontos)</label>
                  <input 
                    type="number" 
                    className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                    value={localStoreConfig.loyalty.welcomeBonus}
                    onChange={(e) => setLocalStoreConfig({
                      ...localStoreConfig, 
                      loyalty: { ...localStoreConfig.loyalty, welcomeBonus: Number(e.target.value) }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Prêmios / Recompensas</h3>
                <button 
                  onClick={addReward}
                  className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                >
                  <Plus size={18} />
                  Novo Prêmio
                </button>
              </div>
              <div className="divide-y">
                {localStoreConfig.loyalty.rewards.map(reward => (
                  <div key={reward.id} className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      <input 
                        type="text" 
                        placeholder="Nome do prêmio"
                        className="bg-neutral-50 border-none rounded-xl py-2 px-4 focus:ring-2 focus:ring-neutral-900 transition-all text-sm"
                        value={reward.name}
                        onChange={(e) => updateReward(reward.id, { name: e.target.value })}
                      />
                      <input 
                        type="number" 
                        placeholder="Pontos necessários"
                        className="bg-neutral-50 border-none rounded-xl py-2 px-4 focus:ring-2 focus:ring-neutral-900 transition-all text-sm"
                        value={reward.pointsNeeded}
                        onChange={(e) => updateReward(reward.id, { pointsNeeded: Number(e.target.value) })}
                      />
                      <select 
                        className="bg-neutral-50 border-none rounded-xl py-2 px-4 focus:ring-2 focus:ring-neutral-900 transition-all text-sm"
                        value={reward.productId || ''}
                        onChange={(e) => updateReward(reward.id, { productId: e.target.value })}
                      >
                        <option value="">Vincular a um produto (Opcional)</option>
                        {localCategories.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={() => removeReward(reward.id)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'neighborhoods' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MapPin className="text-neutral-900" />
                Taxas de Entrega por Bairro
              </h3>
              <button 
                onClick={addNeighborhood}
                className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-neutral-800 transition-all"
              >
                <Plus size={18} />
                Novo Bairro
              </button>
            </div>
            <div className="divide-y">
              {localStoreConfig.neighborhoods.map(neighborhood => (
                <div key={neighborhood.id} className="p-6 flex items-center gap-4">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Nome do bairro"
                      className="bg-neutral-50 border-none rounded-xl py-2 px-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                      value={neighborhood.name}
                      onChange={(e) => updateNeighborhood(neighborhood.id, { name: e.target.value })}
                    />
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">R$</span>
                      <input 
                        type="number" 
                        placeholder="Taxa"
                        className="w-full bg-neutral-50 border-none rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                        value={neighborhood.fee}
                        onChange={(e) => updateNeighborhood(neighborhood.id, { fee: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => removeNeighborhood(neighborhood.id)}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Store className="text-neutral-900" />
                Informações da Loja
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Logo da Loja</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full overflow-hidden relative group">
                      {localStoreConfig.logo ? (
                        <img src={localStoreConfig.logo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Upload size={14} className="text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await supabaseService.uploadImage(file);
                            if (url) setLocalStoreConfig({...localStoreConfig, logo: url});
                          }
                        }} />
                      </label>
                    </div>
                    <input 
                      type="text" 
                      placeholder="URL da Logo"
                      className="flex-1 bg-neutral-50 border-none rounded-xl py-2 px-4 focus:ring-2 focus:ring-neutral-900 transition-all text-sm"
                      value={localStoreConfig.logo}
                      onChange={(e) => setLocalStoreConfig({...localStoreConfig, logo: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Banner da Loja</label>
                  <div className="flex flex-col gap-2">
                    <div className="w-full h-32 bg-neutral-100 rounded-2xl overflow-hidden relative group">
                      {localStoreConfig.banner ? (
                        <img src={localStoreConfig.banner} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <ImageIcon size={32} />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Upload size={20} className="text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await supabaseService.uploadImage(file);
                            if (url) setLocalStoreConfig({...localStoreConfig, banner: url});
                          }
                        }} />
                      </label>
                    </div>
                    <input 
                      type="text" 
                      placeholder="URL do Banner"
                      className="w-full bg-neutral-50 border-none rounded-xl py-2 px-4 focus:ring-2 focus:ring-neutral-900 transition-all text-sm"
                      value={localStoreConfig.banner}
                      onChange={(e) => setLocalStoreConfig({...localStoreConfig, banner: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nome da Loja</label>
                  <input 
                    type="text" 
                    className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                    value={localStoreConfig.name}
                    onChange={(e) => setLocalStoreConfig({...localStoreConfig, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Localização (Cidade - UF)</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="text" 
                      className="w-full bg-neutral-50 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                      value={localStoreConfig.location}
                      onChange={(e) => setLocalStoreConfig({...localStoreConfig, location: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">WhatsApp</label>
                  <input 
                    type="text" 
                    className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                    value={localStoreConfig.whatsappNumber}
                    onChange={(e) => setLocalStoreConfig({...localStoreConfig, whatsappNumber: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ImageIcon className="text-neutral-900" />
                Imagens das Abas
              </h3>
              <div className="space-y-4">
                {['inicio', 'promos', 'pedidos', 'perfil'].map((tab) => (
                  <div key={tab}>
                    <label className="block text-sm font-medium text-neutral-700 mb-1 capitalize">Imagem {tab}</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all text-sm"
                        value={localStoreConfig.tabImages?.[tab as keyof typeof localStoreConfig.tabImages] || ''}
                        onChange={(e) => setLocalStoreConfig({
                          ...localStoreConfig,
                          tabImages: {
                            ...localStoreConfig.tabImages,
                            [tab]: e.target.value
                          }
                        })}
                      />
                      <label className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-colors flex-shrink-0">
                        <Upload className="w-5 h-5 text-neutral-500" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleTabImageUpload(e, tab)}
                        />
                      </label>
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                        <img 
                          src={localStoreConfig.tabImages?.[tab as keyof typeof localStoreConfig.tabImages]} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Truck className="text-neutral-900" />
                Entrega e Funcionamento
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Taxa de Entrega</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">R$</span>
                      <input 
                        type="number" 
                        className="w-full bg-neutral-50 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                        value={localStoreConfig.deliveryFee}
                        onChange={(e) => setLocalStoreConfig({...localStoreConfig, deliveryFee: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Pedido Mínimo</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">R$</span>
                      <input 
                        type="number" 
                        className="w-full bg-neutral-50 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                        value={localStoreConfig.minOrder}
                        onChange={(e) => setLocalStoreConfig({...localStoreConfig, minOrder: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Frete Grátis acima de</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">R$</span>
                    <input 
                      type="number" 
                      className="w-full bg-neutral-50 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                      value={localStoreConfig.freeDeliveryOver || 0}
                      onChange={(e) => setLocalStoreConfig({...localStoreConfig, freeDeliveryOver: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", localStoreConfig.isOpen ? "bg-black" : "bg-neutral-300")} />
                    <span className="font-bold">Loja Aberta</span>
                  </div>
                  <button 
                    onClick={() => setLocalStoreConfig({...localStoreConfig, isOpen: !localStoreConfig.isOpen})}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      localStoreConfig.isOpen ? "bg-black" : "bg-neutral-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      localStoreConfig.isOpen ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4 text-neutral-400" />
                    <span className="font-bold">Aceitar pedidos fechado</span>
                  </div>
                  <button 
                    onClick={() => setLocalStoreConfig({...localStoreConfig, allowOrdersWhenClosed: !localStoreConfig.allowOrdersWhenClosed})}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      localStoreConfig.allowOrdersWhenClosed ? "bg-black" : "bg-neutral-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      localStoreConfig.allowOrdersWhenClosed ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Peça mais (Sugestões no Carrinho)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-neutral-50 rounded-xl border border-neutral-100">
                    {localProducts.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const current = localStoreConfig.cartSuggestions || [];
                          const updated = current.includes(p.id) 
                            ? current.filter(id => id !== p.id)
                            : [...current, p.id];
                          setLocalStoreConfig({...localStoreConfig, cartSuggestions: updated});
                        }}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg text-xs transition-all border",
                          (localStoreConfig.cartSuggestions || []).includes(p.id)
                            ? "bg-black text-white border-black"
                            : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                        )}
                      >
                        <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                          <img src={p.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="truncate flex-1 text-left">{p.name}</span>
                        {(localStoreConfig.cartSuggestions || []).includes(p.id) && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

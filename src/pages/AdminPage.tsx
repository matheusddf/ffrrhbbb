import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { categories, products, storeConfig } from '../data';
import { Link } from 'react-router-dom';
import { Product, Neighborhood, LoyaltyReward } from '../types';

export default function AdminPage() {
  const [localStoreConfig, setLocalStoreConfig] = useState(storeConfig);
  const [localProducts, setLocalProducts] = useState(products);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'settings' | 'loyalty' | 'neighborhoods'>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setLocalProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
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
                        {categories.map(cat => (
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
                      <label className="block text-sm font-medium text-neutral-700 mb-1">URL da Imagem</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          className="flex-1 bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all"
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
          <button className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all">
            <Save size={20} />
            Salvar Alterações
          </button>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <p className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-2">Total de Produtos</p>
              <p className="text-4xl font-bold">{localProducts.length}</p>
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

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Lista de Produtos</h3>
              <button className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-neutral-800 transition-all">
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
                      {categories.find(c => c.id === product.categoryId)?.name}
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
                        {localProducts.map(p => (
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
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

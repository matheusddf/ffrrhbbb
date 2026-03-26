import { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Plus, 
  Minus, 
  X, 
  Search,
  MessageCircle,
  ArrowLeft,
  Truck,
  Award,
  User,
  ChevronDown,
  Home,
  Tag,
  ClipboardList,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { categories, products, storeConfig } from '../data';
import { CartItem, Product, Neighborhood, Customer } from '../types';

export default function ClientPage() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [observation, setObservation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loginPhone, setLoginPhone] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);
  const [activeTab, setActiveTab] = useState('inicio');

  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'Pix'
  });

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const deliveryFee = useMemo(() => {
    if (storeConfig.freeDeliveryOver && cartTotal >= storeConfig.freeDeliveryOver) {
      return 0;
    }
    return selectedNeighborhood ? selectedNeighborhood.fee : storeConfig.deliveryFee;
  }, [cartTotal, selectedNeighborhood]);

  const addToCart = (product: Product, obs?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.observation === obs);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.observation === obs) 
            ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, observation: obs }];
    });
  };

  const handleLogin = () => {
    if (loginPhone.length < 10) return;
    // Mock customer identification
    setCustomer({
      phone: loginPhone,
      points: storeConfig.loyalty.welcomeBonus,
      orderHistory: []
    });
    setCheckoutForm(prev => ({ ...prev, phone: loginPhone }));
    setIsLoginOpen(false);
  };

  const removeFromCart = (productId: string, obs?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId && item.observation === obs);
      if (existing && existing.quantity > 1) {
        return prev.map(item => 
          (item.id === productId && item.observation === obs) 
            ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter(item => !(item.id === productId && item.observation === obs));
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const sendOrderToWhatsApp = () => {
    const itemsText = cart.map(item => 
      `*${item.quantity}x ${item.name}* ${item.observation ? `\n   _Obs: ${item.observation}_` : ''} - R$ ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const message = `
*NOVO PEDIDO - ${storeConfig.name}*
------------------------------
*Cliente:* ${checkoutForm.name}
*Telefone:* ${checkoutForm.phone}
*Endereço:* ${checkoutForm.address}
*Pagamento:* ${checkoutForm.paymentMethod}
------------------------------
*Itens:*
${itemsText}
------------------------------
*Subtotal:* R$ ${cartTotal.toFixed(2)}
*Taxa de Entrega:* ${deliveryFee === 0 ? 'GRÁTIS' : `R$ ${deliveryFee.toFixed(2)}`}
*TOTAL:* R$ ${(cartTotal + deliveryFee).toFixed(2)}
    `.trim();

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${storeConfig.whatsappNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 pb-24">
      {/* Store Closed Indicator */}
      {!storeConfig.isOpen && (
        <div className="fixed bottom-24 right-4 bg-neutral-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl shadow-lg z-[100] flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider">
          <Clock className="w-3 h-3" />
          <span>Loja Fechada</span>
        </div>
      )}

      <header className="relative">
        <div className="h-48 w-full overflow-hidden">
          <img 
            src={storeConfig.banner} 
            alt="Banner" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-10">
          <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg -mt-16 md:mt-0">
              <img 
                src={storeConfig.logo} 
                alt="Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold tracking-tight">{storeConfig.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-neutral-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-neutral-900" />
                  <span>{storeConfig.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-neutral-900" />
                  <span>{storeConfig.openHours}</span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-center md:justify-start gap-2">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  storeConfig.isOpen ? "bg-black text-white" : "bg-neutral-200 text-neutral-500"
                )}>
                  {storeConfig.isOpen ? 'Aberto' : 'Fechado'}
                </div>
                <span className="text-xs text-neutral-400">Pedido mínimo: R$ {storeConfig.minOrder.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {/* Loyalty Program Card */}
        {storeConfig.loyalty.enabled && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 mb-6 flex items-center gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-neutral-50 rounded-full -mr-12 -mt-12 opacity-50" />
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-neutral-900" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-neutral-800">Programa de fidelidade</h3>
              <p className="text-xs text-neutral-500 mt-1">
                {customer 
                  ? `Você tem ${customer.points} pontos acumulados.` 
                  : `A cada R$ ${storeConfig.loyalty.pointsPerReal.toFixed(2)} em compras você ganha 1 ponto.`}
              </p>
              {!customer && (
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="text-neutral-900 text-xs font-bold mt-2 hover:underline"
                >
                  Entrar ou cadastrar-se →
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Category List & Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <button 
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className="w-full bg-white rounded-2xl py-4 px-5 shadow-sm flex items-center justify-between text-neutral-700 font-medium"
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-neutral-900" />
                <span>{categories.find(c => c.id === activeCategory)?.name || 'Categorias'}</span>
              </div>
              <ChevronDown className={cn("w-5 h-5 transition-transform", isCategoryMenuOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isCategoryMenuOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsCategoryMenuOpen(false)}
                    className="fixed inset-0 z-20"
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-100 z-30 overflow-hidden"
                  >
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setIsCategoryMenuOpen(false);
                          setSearchTerm('');
                        }}
                        className={cn(
                          "w-full text-left px-6 py-4 hover:bg-neutral-50 transition-colors flex items-center justify-between",
                          activeCategory === cat.id ? "text-neutral-900 bg-neutral-50 font-bold" : "text-neutral-600"
                        )}
                      >
                        {cat.name}
                        {activeCategory === cat.id && <div className="w-2 h-2 bg-neutral-900 rounded-full" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => {
              // Toggle search or focus
              const input = document.getElementById('search-input');
              input?.focus();
            }}
            className="bg-white p-4 rounded-2xl shadow-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input (Hidden by default, shown when focused or typing) */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input 
            id="search-input"
            type="text" 
            placeholder="O que você está procurando?" 
            className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-neutral-900 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Product List */}
        <div className="space-y-12">
          {categories.filter(c => searchTerm || c.id === activeCategory).map(category => {
            const categoryProducts = filteredProducts.filter(p => p.categoryId === category.id);
            if (categoryProducts.length === 0) return null;

            return (
              <section key={category.id}>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-neutral-900 rounded-full" />
                  {category.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryProducts.map(product => (
                    <motion.div 
                      layout
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex gap-4 group cursor-pointer relative overflow-hidden"
                    >
                      {product.badge && (
                        <div className={cn(
                          "absolute top-0 left-0 px-3 py-1 text-[10px] font-bold text-white rounded-br-xl uppercase tracking-wider z-10",
                          product.badge === 'MAIS PEDIDO' ? "bg-black" : 
                          product.badge === 'NOVIDADE' ? "bg-neutral-800" : "bg-neutral-600"
                        )}>
                          {product.badge}
                        </div>
                      )}
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                          <p className="text-sm text-neutral-500 line-clamp-2 mt-1">{product.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex flex-col">
                            {product.oldPrice && (
                              <span className="text-xs text-neutral-400 line-through">R$ {product.oldPrice.toFixed(2)}</span>
                            )}
                            <span className="font-bold text-neutral-900">R$ {product.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        {product.oldPrice && (
                          <div className="absolute top-2 right-2 bg-neutral-900 text-white p-1.5 rounded-full shadow-lg border border-white/20">
                            <Gift className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed inset-x-0 bottom-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl bg-white z-50 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="relative h-64 md:h-80">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/40 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                  <p className="text-neutral-500 mt-2 leading-relaxed">{selectedProduct.description}</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-4">R$ {selectedProduct.price.toFixed(2)}</p>
                </div>

                <div className="space-y-3">
                  <label className="block font-bold text-sm uppercase tracking-widest text-neutral-400">Alguma observação?</label>
                  <textarea 
                    rows={3}
                    placeholder="Ex: sem cebola, ponto da carne, etc..."
                    className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all resize-none"
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-6 bg-neutral-50 border-t flex items-center gap-4">
                <button 
                  onClick={() => {
                    addToCart(selectedProduct, observation);
                    setSelectedProduct(null);
                    setObservation('');
                  }}
                  className="flex-1 bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-neutral-200 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-3"
                >
                  <Plus className="w-6 h-6" />
                  Adicionar ao Carrinho
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && !isCartOpen && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-[88px] left-4 right-4 bg-black text-white px-6 py-4 z-40 flex items-center justify-between font-bold shadow-2xl rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-white text-black w-5 h-5 rounded-full text-[10px] flex items-center justify-center border-2 border-black">
                  {cart.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              </div>
              <span className="text-lg font-bold">Ver carrinho</span>
            </div>
            <span className="text-lg font-bold">R$ {cartTotal.toFixed(2)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-bottom flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-neutral-900" />
                  <h2 className="text-xl font-bold">Seu Carrinho</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-400 gap-4">
                    <ShoppingBag className="w-16 h-16 opacity-20" />
                    <p>Seu carrinho está vazio</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{item.name}</h3>
                        {item.observation && (
                          <p className="text-xs text-neutral-400 italic mt-1">Obs: {item.observation}</p>
                        )}
                        <p className="text-neutral-900 font-bold text-sm mt-1">R$ {item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                            <button onClick={() => removeFromCart(item.id, item.observation)} className="p-1 hover:bg-white rounded-md transition-colors">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                            <button onClick={() => addToCart(item, item.observation)} className="p-1 hover:bg-white rounded-md transition-colors">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-neutral-50 border-t space-y-4">
                  {!storeConfig.isOpen && (
                    <div className="bg-neutral-100 text-neutral-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Não estamos aceitando pedidos no momento.
                    </div>
                  )}
                  {cartTotal < storeConfig.minOrder && storeConfig.isOpen && (
                    <div className="bg-neutral-100 text-neutral-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Faltam R$ {(storeConfig.minOrder - cartTotal).toFixed(2)} para o pedido mínimo.
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-neutral-500">
                      <span>Subtotal</span>
                      <span>R$ {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>Taxa de Entrega</span>
                      <span>{deliveryFee === 0 ? <span className="text-neutral-900 font-bold">GRÁTIS</span> : `R$ ${deliveryFee.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-neutral-900">R$ {(cartTotal + deliveryFee).toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    disabled={cartTotal < storeConfig.minOrder || !storeConfig.isOpen}
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-neutral-200 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {storeConfig.isOpen ? 'Finalizar Pedido' : 'Loja Fechada'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white z-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 bg-black text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-xl font-bold">Finalizar Pedido</h2>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-neutral-500 uppercase text-xs tracking-widest">Informações de Entrega</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Seu Nome</label>
                      <input 
                        type="text" 
                        placeholder="Como devemos te chamar?"
                        className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                        value={checkoutForm.name}
                        onChange={(e) => setCheckoutForm({...checkoutForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Telefone / WhatsApp</label>
                      <input 
                        type="tel" 
                        placeholder="(00) 00000-0000"
                        className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                        value={checkoutForm.phone}
                        onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Bairro</label>
                      <select 
                        className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                        value={selectedNeighborhood?.id || ''}
                        onChange={(e) => {
                          const neighborhood = storeConfig.neighborhoods.find(n => n.id === e.target.value);
                          setSelectedNeighborhood(neighborhood || null);
                        }}
                      >
                        <option value="">Selecione seu bairro</option>
                        {storeConfig.neighborhoods.map(n => (
                          <option key={n.id} value={n.id}>{n.name} - R$ {n.fee.toFixed(2)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Endereço Completo</label>
                      <textarea 
                        rows={3}
                        placeholder="Rua, número e ponto de referência"
                        className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all resize-none"
                        value={checkoutForm.address}
                        onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-neutral-500 uppercase text-xs tracking-widest">Forma de Pagamento</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['Pix', 'Cartão', 'Dinheiro'].map(method => (
                      <button
                        key={method}
                        onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: method})}
                        className={cn(
                          "py-3 rounded-xl font-bold transition-all border-2",
                          checkoutForm.paymentMethod === method 
                            ? "bg-neutral-50 border-neutral-900 text-neutral-900" 
                            : "bg-white border-neutral-100 text-neutral-500"
                        )}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-neutral-50 border-t">
                <button 
                  disabled={!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address}
                  onClick={sendOrderToWhatsApp}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-neutral-200 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-6 h-6" />
                  Enviar para o WhatsApp
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Login Modal (Loyalty) */}
      <AnimatePresence>
        {isLoginOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white z-50 rounded-3xl shadow-2xl p-8"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-8 h-8 text-neutral-900" />
                </div>
                <h2 className="text-xl font-bold">Identifique-se</h2>
                <p className="text-sm text-neutral-500">Informe seu telefone para ver seus pontos e histórico de pedidos.</p>
                
                <input 
                  type="tel" 
                  placeholder="(00) 00000-0000"
                  className="w-full bg-neutral-50 border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-neutral-900 transition-all text-center text-lg font-bold"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                />

                <button 
                  onClick={handleLogin}
                  disabled={loginPhone.length < 10}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold shadow-lg shadow-neutral-200 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  Continuar
                </button>
                
                <button 
                  onClick={() => setIsLoginOpen(false)}
                  className="text-neutral-400 text-sm hover:text-neutral-600"
                >
                  Pular por enquanto
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-6 py-3 flex items-center justify-between z-40 md:hidden">
        <button 
          onClick={() => setActiveTab('inicio')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'inicio' ? "text-neutral-900" : "text-neutral-400")}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold">Início</span>
        </button>
        <button 
          onClick={() => setActiveTab('promos')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'promos' ? "text-neutral-900" : "text-neutral-400")}
        >
          <Tag className="w-6 h-6" />
          <span className="text-[10px] font-bold">Promoções</span>
        </button>
        <button 
          onClick={() => setActiveTab('pedidos')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'pedidos' ? "text-neutral-900" : "text-neutral-400")}
        >
          <ClipboardList className="w-6 h-6" />
          <span className="text-[10px] font-bold">Pedidos</span>
        </button>
        <button 
          onClick={() => setIsLoginOpen(true)}
          className={cn("flex flex-col items-center gap-1", customer ? "text-neutral-900" : "text-neutral-400")}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold">{customer ? 'Perfil' : 'Entrar'}</span>
        </button>
      </nav>
    </div>
  );
}

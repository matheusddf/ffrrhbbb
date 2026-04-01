import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Gift,
  LogOut,
  Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { categories as initialCategories, products as initialProducts, storeConfig as initialStoreConfig } from '../data';
import { CartItem, Product, Neighborhood, Customer, LoyaltyReward } from '../types';
import { supabase } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';

const SUPER_ADMIN_EMAIL = 'beleensematheus350@gmail.com';

export default function ClientPage() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [store, setStore] = useState<any>(null);
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [storeConfig, setStoreConfig] = useState(initialStoreConfig);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<CartItem['selectedOptions']>([]);
  const [observation, setObservation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginStep, setLoginStep] = useState<'phone' | 'name'>('phone');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);
  const [neighborhoodSearch, setNeighborhoodSearch] = useState('');
  const [deliveryType, setDeliveryType] = useState<'entrega' | 'retirada' | 'consumo'>('entrega');
  const [activeTab, setActiveTab] = useState('inicio');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthUser(user);
    });
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!storeSlug) return;
      setLoading(true);
      setError(null);
      try {
        const foundStore = await supabaseService.getStoreBySlug(storeSlug);
        if (!foundStore) {
          setError('Loja não encontrada');
          setLoading(false);
          return;
        }
        setStore(foundStore);

        const [config, cats, prods] = await Promise.all([
          supabaseService.getStoreConfig(foundStore.id),
          supabaseService.getCategories(foundStore.id),
          supabaseService.getProducts(foundStore.id)
        ]);
        
        if (config) setStoreConfig(config);
        if (cats.length > 0) {
          setCategories(cats);
          setActiveCategory(cats[0].id);
        }
        if (prods.length > 0) setProducts(prods);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Erro ao carregar os dados da loja');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [storeSlug]);

  useEffect(() => {
    if (customer && activeTab === 'pedidos' && store) {
      fetchOrders();
    }
  }, [customer, activeTab, store]);

  async function fetchOrders() {
    if (!customer || !store) return;
    const data = await supabaseService.getOrdersByCustomer(customer.phone, store.id);
    if (data) setOrders(data);
  }

  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'Pix'
  });

  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);

  const cartTotal = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => {
      const optionsPrice = item.selectedOptions?.reduce((sum, group) => 
        sum + group.options.reduce((optSum, opt) => optSum + (opt.price || 0), 0), 0) || 0;
      return acc + (item.price + optionsPrice) * item.quantity;
    }, 0);
    
    if (selectedReward) {
      return Math.max(0, subtotal - (selectedReward.discount || 0));
    }
    return subtotal;
  }, [cart, selectedReward]);

  const deliveryFee = useMemo(() => {
    if (deliveryType !== 'entrega') return 0;
    if (storeConfig.freeDeliveryOver && cartTotal >= storeConfig.freeDeliveryOver) {
      return 0;
    }
    return selectedNeighborhood ? selectedNeighborhood.fee : storeConfig.deliveryFee;
  }, [cartTotal, selectedNeighborhood, deliveryType]);

  const addToCart = (product: Product, obs?: string, options?: CartItem['selectedOptions']) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        item.observation === obs && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(options)
      );
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.observation === obs && JSON.stringify(item.selectedOptions) === JSON.stringify(options)) 
            ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, observation: obs, selectedOptions: options }];
    });
  };

  const handleLogin = async () => {
    if (loginPhone.length < 10 || !store) return;
    
    try {
      const { data: existingCustomer, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', loginPhone)
        .eq('store_id', store.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching customer:', fetchError);
        return;
      }

      if (existingCustomer) {
        setCustomer(existingCustomer);
        setCheckoutForm(prev => ({ ...prev, phone: loginPhone, name: existingCustomer.name }));
        setIsLoginOpen(false);
        setActiveTab('perfil');
      } else {
        if (loginStep === 'phone') {
          setLoginStep('name');
        } else if (loginName.trim()) {
          const { data: createdCustomer, error: insertError } = await supabase
            .from('customers')
            .insert([{ 
              phone: loginPhone, 
              name: loginName, 
              points: storeConfig.loyalty.welcomeBonus,
              store_id: store.id
            }])
            .select()
            .single();
          
          if (insertError) {
            console.error('Error creating customer:', insertError);
            return;
          }

          if (createdCustomer) {
            setCustomer(createdCustomer);
            setCheckoutForm(prev => ({ ...prev, phone: loginPhone, name: loginName }));
            setIsLoginOpen(false);
            setActiveTab('perfil');
          }
        }
      }
    } catch (error) {
      console.error('Error in handleLogin:', error);
    }
  };

  const removeFromCart = (productId: string, obs?: string, options?: CartItem['selectedOptions']) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.id === productId && 
        item.observation === obs && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(options)
      );
      if (existing && existing.quantity > 1) {
        return prev.map(item => 
          (item.id === productId && item.observation === obs && JSON.stringify(item.selectedOptions) === JSON.stringify(options)) 
            ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter(item => !(item.id === productId && item.observation === obs && JSON.stringify(item.selectedOptions) === JSON.stringify(options)));
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const sendOrderToWhatsApp = async () => {
    if (!store) return;

    const itemsText = cart.map(item => {
      const optionsPrice = item.selectedOptions?.reduce((sum, group) => 
        sum + group.options.reduce((optSum, opt) => optSum + (opt.price || 0), 0), 0) || 0;
      const itemTotal = (item.price + optionsPrice) * item.quantity;
      
      let optionsText = '';
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        optionsText = item.selectedOptions.map(group => 
          `   - ${group.groupName}: ${group.options.map(o => o.name).join(', ')}`
        ).join('\n');
      }

      return `*${item.quantity}x ${item.name}*${optionsText ? `\n${optionsText}` : ''}${item.observation ? `\n   _Obs: ${item.observation}_` : ''} - R$ ${itemTotal.toFixed(2)}`;
    }).join('\n\n');

    const total = cartTotal + deliveryFee;

    const message = `
*NOVO PEDIDO - ${storeConfig.name}*
------------------------------
*Cliente:* ${checkoutForm.name}
*Telefone:* ${checkoutForm.phone}
${deliveryType === 'entrega' 
  ? `*Bairro:* ${neighborhoodSearch || 'Não informado'}${!selectedNeighborhood && neighborhoodSearch ? ' (Bairro não cadastrado - Localização será enviada)' : ''}
*Endereço:* ${checkoutForm.address}`
  : `*Tipo:* ${deliveryType === 'retirada' ? 'Retirada no local' : 'Consumo no local'}`
}
*Pagamento:* ${checkoutForm.paymentMethod}
------------------------------
*Itens:*
${itemsText}
------------------------------
*Subtotal:* R$ ${cartTotal.toFixed(2)}
*Taxa de Entrega:* ${deliveryFee === 0 ? 'GRÁTIS' : `R$ ${deliveryFee.toFixed(2)}`}
*TOTAL:* R$ ${total.toFixed(2)}
    `.trim();

    try {
      // Save order to database
      await supabaseService.createOrder({
        customer_phone: checkoutForm.phone,
        customer_name: checkoutForm.name,
        items: cart,
        total: total,
        status: 'pendente',
        delivery_type: deliveryType,
        payment_method: checkoutForm.paymentMethod,
        address: checkoutForm.address,
        neighborhood: neighborhoodSearch,
        delivery_fee: deliveryFee
      }, store.id);

      // If customer is logged in, update points
      if (customer) {
        const earnedPoints = Math.floor(cartTotal * storeConfig.loyalty.pointsPerReal);
        const { error: updateError } = await supabase
          .from('customers')
          .update({ points: customer.points + earnedPoints })
          .eq('id', customer.id);
        
        if (!updateError) {
          setCustomer({ ...customer, points: customer.points + earnedPoints });
        }
      }

      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/${storeConfig.whatsappNumber}?text=${encoded}`, '_blank');
      
      // Clear cart and close modals
      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      alert('Pedido enviado com sucesso!');
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">{error || 'Loja não encontrada'}</h2>
        <p className="text-neutral-500">Verifique o link ou entre em contato com o suporte.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 pb-24">
      {/* Header (Only on Home tab) */}
      {activeTab === 'inicio' && (
        <header className="relative">
          <div className="h-40 md:h-48 w-full overflow-hidden">
            <img 
              src={storeConfig.tabImages?.inicio || storeConfig.banner || "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=1200"} 
              alt="Banner" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=1200";
              }}
            />
          </div>
          
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm -mt-16 md:mt-[-5rem] flex flex-col items-center text-center">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg -mt-12 md:-mt-14 bg-white">
                <img 
                  src={storeConfig.logo || "https://picsum.photos/seed/burger-logo/400/400"} 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://picsum.photos/seed/burger-logo/400/400";
                  }}
                />
              </div>
              
              <div className="mt-4 space-y-1">
                <h1 className="text-2xl font-extrabold tracking-tight">{storeConfig.name}</h1>
                <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 font-medium">
                  <MapPin className="w-4 h-4" />
                  <span>{storeConfig.location}</span>
                  <span className="text-neutral-300">•</span>
                  <button className="text-neutral-900 font-bold hover:underline">Mais informações</button>
                  {(authUser?.email === store?.owner_email || authUser?.email === SUPER_ADMIN_EMAIL) && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <a 
                        href="/admin" 
                        className="text-red-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Store size={14} />
                        Painel Admin
                      </a>
                    </>
                  )}
                </div>
                
                <div className="pt-2">
                  {!storeConfig.isOpen ? (
                    <p className="text-red-600 font-bold text-sm">
                      Fechado • Abrimos às {storeConfig.openHours?.split(' às ')[1] || '18h00'}
                    </p>
                  ) : (
                    <p className="text-green-600 font-bold text-sm">
                      Aberto • Fecha às {storeConfig.openHours?.split(' às ')[1] || '23h00'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={cn("max-w-4xl mx-auto px-4", activeTab === 'inicio' ? "mt-6" : "pt-12")}>
        {activeTab === 'inicio' && (
          <>
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
                  : `A cada R$ ${storeConfig.loyalty.pointsPerReal.toFixed(2)} em compras você ganha 1 ponto que pode ser trocado por prêmios.`}
              </p>
              {!customer && (
                <div className="mt-2">
                  <p className="text-[10px] text-neutral-400 mb-1 italic">
                    Novos clientes ganham automaticamente {storeConfig.loyalty.welcomeBonus} pontos.
                  </p>
                  <button 
                    onClick={() => setIsLoginOpen(true)}
                    className="text-neutral-900 text-xs font-bold hover:underline"
                  >
                    Entrar ou cadastrar-se →
                  </button>
                </div>
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
      </>
    )}

    {activeTab === 'promos' && (
      <div className="space-y-8">
        {storeConfig.tabImages?.promos && (
          <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg mb-8">
            <img 
              src={storeConfig.tabImages.promos} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <h2 className="text-3xl font-bold text-white">Promoções Imperdíveis</h2>
            </div>
          </div>
        )}
        {!storeConfig.tabImages?.promos && <h2 className="text-2xl font-bold">Promoções Imperdíveis</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.filter(p => p.oldPrice).map(product => (
            <motion.div 
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex gap-4 group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 px-3 py-1 text-[10px] font-bold text-white bg-red-600 rounded-br-xl uppercase tracking-wider z-10">
                OFERTA
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                  <p className="text-sm text-neutral-500 line-clamp-2 mt-1">{product.description}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-neutral-400 line-through">R$ {product.oldPrice?.toFixed(2)}</span>
                    <span className="font-bold text-red-600">R$ {product.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img src={product.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )}

    {activeTab === 'pedidos' && (
      <div className="space-y-8">
        {storeConfig.tabImages?.pedidos && (
          <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg mb-8">
            <img 
              src={storeConfig.tabImages.pedidos} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <h2 className="text-3xl font-bold text-white">Meus Pedidos</h2>
            </div>
          </div>
        )}
        {!storeConfig.tabImages?.pedidos && <h2 className="text-2xl font-bold">Meus Pedidos</h2>}
        {!customer ? (
          <div className="bg-white p-12 rounded-3xl text-center space-y-6 shadow-sm">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto">
              <ClipboardList className="w-10 h-10 text-neutral-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Faça seu pedido agora!</h3>
              <p className="text-neutral-500">Você ainda não tem pedidos. Que tal escolher algo delicioso?</p>
            </div>
            <button 
              onClick={() => setActiveTab('inicio')}
              className="bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-neutral-200 hover:bg-neutral-800 transition-all"
            >
              Ver Cardápio
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center space-y-6 shadow-sm">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto">
              <ClipboardList className="w-10 h-10 text-neutral-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Você ainda não tem pedidos</h3>
              <p className="text-neutral-500">Que tal experimentar nossas delícias hoje?</p>
            </div>
            <button 
              onClick={() => setActiveTab('inicio')}
              className="bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-neutral-200 hover:bg-neutral-800 transition-all"
            >
              Faça seu pedido agora
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Pedido #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-neutral-500">{new Date(order.createdAt || '').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    order.status === 'delivered' ? "bg-green-100 text-green-700" : 
                    order.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-500"
                  )}>
                    {order.status === 'pending' ? 'Pendente' :
                     order.status === 'preparing' ? 'Preparando' :
                     order.status === 'delivered' ? 'Entregue' : 'Cancelado'}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-neutral-600">{item.quantity}x {item.name}</span>
                      <span className="font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-lg font-bold">R$ {order.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {activeTab === 'perfil' && (
      <div className="space-y-8">
        {storeConfig.tabImages?.perfil && (
          <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg mb-8">
            <img 
              src={storeConfig.tabImages.perfil} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <h2 className="text-3xl font-bold text-white">Meu Perfil</h2>
            </div>
          </div>
        )}
        {!storeConfig.tabImages?.perfil && <h2 className="text-2xl font-bold">Meu Perfil</h2>}
        {!customer ? (
          <div className="bg-white p-12 rounded-3xl text-center space-y-6 shadow-sm">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-neutral-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Identifique-se</h3>
              <p className="text-neutral-500">Entre para ver seus pontos de fidelidade e histórico de pedidos.</p>
            </div>
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-neutral-200 hover:bg-neutral-800 transition-all"
            >
              Entrar agora
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm flex items-center gap-6">
              <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center text-white">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{customer.name}</h3>
                <p className="text-neutral-500">{customer.phone}</p>
                <button 
                  onClick={() => setCustomer(null)}
                  className="text-red-600 text-xs font-bold flex items-center gap-1 mt-2"
                >
                  <LogOut className="w-3 h-3" />
                  Sair da conta
                </button>
              </div>
            </div>

            <div className="bg-black text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest opacity-60">Seus Pontos</p>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-5xl font-black">{customer.points}</span>
                  <span className="text-sm font-bold mb-2 opacity-60">pontos</span>
                </div>
                <p className="text-sm mt-4 opacity-80">Continue pedindo para ganhar mais prêmios!</p>
              </div>
              <Gift className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
            </div>

            {(authUser?.email === store?.owner_email || authUser?.email === SUPER_ADMIN_EMAIL) && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                    <Store size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold">Painel Administrativo</h4>
                    <p className="text-xs text-neutral-500">Gerencie sua loja e pedidos</p>
                  </div>
                </div>
                <a 
                  href="/admin" 
                  className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all"
                >
                  Acessar
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    )}
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

                {selectedProduct.optionGroups?.map(group => (
                  <div key={group.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-neutral-900">{group.name}</h3>
                        <p className="text-xs text-neutral-500">
                          {group.required ? 'Obrigatório' : 'Opcional'} • {group.max === 1 ? 'Selecione 1' : `Selecione até ${group.max}`}
                        </p>
                      </div>
                      {group.required && (
                        <span className="bg-neutral-900 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Obrigatório</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {group.options.map(option => {
                        const isSelected = selectedOptions.find(g => g.groupId === group.id)?.options.some(o => o.id === option.id);
                        return (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSelectedOptions(prev => {
                                const groupIdx = prev.findIndex(g => g.groupId === group.id);
                                if (groupIdx === -1) {
                                  return [...prev, { groupId: group.id, groupName: group.name, options: [option] }];
                                }
                                const currentGroup = prev[groupIdx];
                                const isOptSelected = currentGroup.options.some(o => o.id === option.id);
                                
                                if (isOptSelected) {
                                  const newOpts = currentGroup.options.filter(o => o.id !== option.id);
                                  if (newOpts.length === 0) {
                                    return prev.filter(g => g.groupId !== group.id);
                                  }
                                  return prev.map(g => g.groupId === group.id ? { ...g, options: newOpts } : g);
                                } else {
                                  if (group.max === 1) {
                                    return prev.map(g => g.groupId === group.id ? { ...g, options: [option] } : g);
                                  }
                                  if (group.max && currentGroup.options.length >= group.max) return prev;
                                  return prev.map(g => g.groupId === group.id ? { ...g, options: [...g.options, option] } : g);
                                }
                              });
                            }}
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                              isSelected ? "border-neutral-900 bg-neutral-50" : "border-neutral-100 bg-white hover:border-neutral-200"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                isSelected ? "border-neutral-900 bg-neutral-900" : "border-neutral-300"
                              )}>
                                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                              <span className={cn("font-medium", isSelected ? "text-neutral-900" : "text-neutral-600")}>{option.name}</span>
                            </div>
                            {option.price && (
                              <span className="text-sm font-bold text-neutral-900">+ R$ {option.price.toFixed(2)}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

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

                {selectedProduct.suggestedProducts && selectedProduct.suggestedProducts.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Peça também
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {selectedProduct.suggestedProducts.map(id => {
                        const suggested = products.find(p => p.id === id);
                        if (!suggested) return null;
                        return (
                          <div 
                            key={id}
                            className="flex-shrink-0 w-40 bg-neutral-50 rounded-2xl p-3 border border-neutral-100 flex flex-col"
                          >
                            <div className="w-full h-24 rounded-xl overflow-hidden mb-2">
                              <img src={suggested.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <h4 className="text-xs font-bold truncate">{suggested.name}</h4>
                            <p className="text-xs font-bold text-neutral-900 mt-1">R$ {suggested.price.toFixed(2)}</p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(suggested);
                              }}
                              className="mt-2 w-full bg-white border border-neutral-200 py-1.5 rounded-lg text-[10px] font-bold hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all"
                            >
                              Adicionar
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-neutral-50 border-t flex items-center gap-4">
                <button 
                  disabled={selectedProduct.optionGroups?.some(g => g.required && !selectedOptions.find(sg => sg.groupId === g.id))}
                  onClick={() => {
                    addToCart(selectedProduct, observation, selectedOptions);
                    setSelectedProduct(null);
                    setObservation('');
                    setSelectedOptions([]);
                  }}
                  className="flex-1 bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-neutral-200 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
        {cart.length > 0 && !isCartOpen && !isCheckoutOpen && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-[88px] md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-80 bg-red-600 text-white px-6 py-4 z-40 flex items-center justify-between font-bold shadow-2xl rounded-2xl hover:bg-red-700 transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-white text-red-600 w-5 h-5 rounded-full text-[10px] flex items-center justify-center border-2 border-red-600">
                  {cart.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              </div>
              <span className="text-lg font-bold">Ver sacola</span>
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
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {item.selectedOptions.map(group => (
                              <p key={group.groupId} className="text-[10px] text-neutral-500">
                                <span className="font-bold">{group.groupName}:</span> {group.options.map(o => o.name).join(', ')}
                              </p>
                            ))}
                          </div>
                        )}
                        {item.observation && (
                          <p className="text-xs text-neutral-400 italic mt-1">Obs: {item.observation}</p>
                        )}
                        <p className="text-neutral-900 font-bold text-sm mt-1">
                          R$ {(() => {
                            const optionsPrice = item.selectedOptions?.reduce((sum, group) => 
                              sum + group.options.reduce((optSum, opt) => optSum + (opt.price || 0), 0), 0) || 0;
                            return (item.price + optionsPrice).toFixed(2);
                          })()}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                            <button onClick={() => removeFromCart(item.id, item.observation, item.selectedOptions)} className="p-1 hover:bg-white rounded-md transition-colors">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                            <button onClick={() => addToCart(item, item.observation, item.selectedOptions)} className="p-1 hover:bg-white rounded-md transition-colors">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {cart.length > 0 && (
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Peça mais
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {(storeConfig.cartSuggestions && storeConfig.cartSuggestions.length > 0 
                        ? storeConfig.cartSuggestions.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[]
                        : products.filter(p => !cart.some(item => item.id === p.id)).slice(0, 5)
                      ).map(p => (
                        <div 
                          key={p.id}
                          className="flex-shrink-0 w-32 bg-neutral-50 rounded-2xl p-2 border border-neutral-100 flex flex-col"
                        >
                            <div className="w-full h-20 rounded-xl overflow-hidden mb-2">
                              <img src={p.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <h4 className="text-[10px] font-bold truncate">{p.name}</h4>
                            <p className="text-[10px] font-bold text-neutral-900 mt-1">R$ {p.price.toFixed(2)}</p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(p);
                              }}
                              className="mt-2 w-full bg-white border border-neutral-200 py-1 rounded-lg text-[9px] font-bold hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all"
                            >
                              Adicionar
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-neutral-50 border-t space-y-4">
                  {cartTotal < storeConfig.minOrder && storeConfig.isOpen && (
                    <div className="bg-neutral-100 text-neutral-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Faltam R$ {(storeConfig.minOrder - cartTotal).toFixed(2)} para o pedido mínimo.
                    </div>
                  )}
                  <div className="space-y-4">
                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        setIsCheckoutOpen(true);
                      }}
                      className="w-full bg-white border border-neutral-200 p-4 rounded-2xl flex items-center justify-between hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-neutral-400" />
                        <span className="font-bold text-neutral-700">Calcular taxa e tempo de entrega</span>
                      </div>
                      <ChevronDown className="w-5 h-5 text-neutral-400 -rotate-90" />
                    </button>

                    {/* Loyalty Redemption */}
                    {customer && storeConfig.loyalty.enabled && storeConfig.loyalty.rewards.length > 0 && (
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2 uppercase tracking-wider">
                            <Award className="w-4 h-4" />
                            Resgatar Prêmios
                          </h4>
                          <span className="text-[10px] font-bold bg-amber-900 text-white px-2 py-0.5 rounded-full">
                            {customer.points} pts
                          </span>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                          {storeConfig.loyalty.rewards.map(reward => {
                            const canRedeem = customer.points >= reward.points;
                            const isSelected = selectedReward?.id === reward.id;
                            
                            return (
                              <button
                                key={reward.id}
                                disabled={!canRedeem}
                                onClick={() => setSelectedReward(isSelected ? null : reward)}
                                className={cn(
                                  "flex-shrink-0 w-32 p-3 rounded-xl border-2 transition-all text-left",
                                  isSelected 
                                    ? "bg-amber-900 border-amber-900 text-white shadow-lg" 
                                    : canRedeem 
                                      ? "bg-white border-amber-200 text-amber-900 hover:border-amber-400" 
                                      : "bg-neutral-50 border-neutral-100 text-neutral-400 opacity-60 grayscale cursor-not-allowed"
                                )}
                              >
                                <p className="text-[10px] font-bold uppercase tracking-tight line-clamp-1">{reward.name}</p>
                                <p className="text-[10px] font-bold mt-1">{reward.points} pts</p>
                                {isSelected && (
                                  <div className="mt-2 text-[8px] font-bold bg-white text-amber-900 px-1.5 py-0.5 rounded inline-block">
                                    SELECIONADO
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {storeConfig.freeDeliveryOver && (
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-green-600">
                          <span className="text-green-600">Entrega grátis</span> em pedidos a partir de R$ {storeConfig.freeDeliveryOver.toFixed(2)}
                        </p>
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
                      {!storeConfig.isOpen && storeConfig.allowOrdersWhenClosed && (
                        <div className="bg-neutral-100 p-3 rounded-xl text-[10px] text-neutral-600 font-medium">
                          Estamos fechados agora, mas você pode adiantar seu pedido! Entregaremos assim que abrirmos.
                        </div>
                      )}
                      <div className="flex justify-between text-xl font-bold pt-2 border-t">
                        <span>Total</span>
                        <span className="text-neutral-900">R$ {(cartTotal + deliveryFee).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    disabled={cartTotal < storeConfig.minOrder || (!storeConfig.isOpen && !storeConfig.allowOrdersWhenClosed)}
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-neutral-200 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Finalizar Pedido
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
                  <h3 className="font-bold text-neutral-900">Como você quer receber o pedido?</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'entrega', label: 'Entrega', sub: 'A gente leva até você', icon: Truck },
                      { id: 'retirada', label: 'Retirada', sub: 'Você retira no local', icon: User },
                      { id: 'consumo', label: 'Consumo no local', sub: 'Você consome no local', icon: ShoppingBag }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setDeliveryType(type.id as any)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                          deliveryType === type.id 
                            ? "border-neutral-900 bg-neutral-50" 
                            : "border-neutral-100 hover:border-neutral-200"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          deliveryType === type.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"
                        )}>
                          <type.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">{type.label}</p>
                          <p className="text-xs text-neutral-500">{type.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-neutral-500 uppercase text-xs tracking-widest">
                    {deliveryType === 'entrega' ? 'Informações de Entrega' : 'Suas Informações'}
                  </h3>
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
                    {deliveryType === 'entrega' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Bairro</label>
                          <input 
                            list="neighborhoods"
                            placeholder="Digite seu bairro"
                            className="w-full bg-neutral-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-neutral-900 transition-all"
                            value={neighborhoodSearch}
                            onChange={(e) => {
                              const value = e.target.value;
                              setNeighborhoodSearch(value);
                              const neighborhood = storeConfig.neighborhoods.find(n => 
                                n.name.toLowerCase() === value.toLowerCase()
                              );
                              setSelectedNeighborhood(neighborhood || null);
                            }}
                          />
                          <datalist id="neighborhoods">
                            {storeConfig.neighborhoods.map(n => (
                              <option key={n.id} value={n.name} />
                            ))}
                          </datalist>
                          {selectedNeighborhood && (
                            <p className="mt-1 text-[10px] font-bold text-green-600">
                              Taxa de entrega: R$ {selectedNeighborhood.fee.toFixed(2)}
                            </p>
                          )}
                          {!selectedNeighborhood && neighborhoodSearch && (
                            <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                              <p className="text-[10px] text-amber-800 leading-tight">
                                Bairro não encontrado. Por favor, <strong>mande sua localização fixa no WhatsApp</strong> do estabelecimento para sabermos o valor da entrega e não perder seu pedido!
                              </p>
                            </div>
                          )}
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
                      </>
                    )}
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
                  disabled={
                    !checkoutForm.name || 
                    !checkoutForm.phone || 
                    (deliveryType === 'entrega' && (!checkoutForm.address || !neighborhoodSearch))
                  }
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-white z-50 rounded-3xl shadow-2xl p-6 md:p-8"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-8 h-8 text-neutral-900" />
                </div>
                <h2 className="text-xl font-bold">{loginStep === 'phone' ? 'Identifique-se' : 'Quase lá!'}</h2>
                <p className="text-sm text-neutral-500">
                  {loginStep === 'phone' 
                    ? 'Informe seu telefone para ver seus pontos e histórico de pedidos.' 
                    : 'Como devemos te chamar?'}
                </p>
                
                {loginStep === 'phone' ? (
                  <input 
                    type="tel" 
                    placeholder="(00) 00000-0000"
                    className="w-full bg-neutral-50 border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-neutral-900 transition-all text-center text-lg font-bold"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                  />
                ) : (
                  <input 
                    type="text" 
                    placeholder="Seu nome"
                    className="w-full bg-neutral-50 border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-neutral-900 transition-all text-center text-lg font-bold"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    autoFocus
                  />
                )}

                <button 
                  onClick={handleLogin}
                  disabled={loginStep === 'phone' ? loginPhone.length < 10 : !loginName.trim()}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold shadow-lg shadow-neutral-200 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {loginStep === 'phone' ? 'Continuar' : 'Criar conta'}
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-4 md:px-6 py-3 flex items-center justify-between z-40 md:hidden">
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
          onClick={() => setActiveTab('perfil')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'perfil' ? "text-neutral-900" : "text-neutral-400")}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold">{customer ? 'Perfil' : 'Entrar'}</span>
        </button>
      </nav>
    </div>
  );
}

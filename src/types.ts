export interface Store {
  id: string;
  name: string;
  slug: string;
  owner_email: string;
  created_at: string;
}

export interface ProductOption {
  id: string;
  name: string;
  price?: number;
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  required: boolean;
  min?: number;
  max?: number;
  options: ProductOption[];
}

export interface Product {
  id: string;
  store_id?: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  categoryId: string;
  available: boolean;
  badge?: 'MAIS PEDIDO' | 'NOVIDADE' | 'RECOMENDADO';
  suggestedProducts?: string[];
  optionGroups?: ProductOptionGroup[];
}

export interface Category {
  id: string;
  store_id?: string;
  name: string;
  icon?: string;
}

export interface Neighborhood {
  id: string;
  store_id?: string;
  name: string;
  fee: number;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  points: number;
  discount?: number;
  productId?: string; // If it's a specific product
}

export interface LoyaltyConfig {
  enabled: boolean;
  pointsPerReal: number;
  welcomeBonus: number;
  rewards: LoyaltyReward[];
}

export interface StoreConfig {
  id?: number;
  store_id?: string;
  name: string;
  logo: string;
  banner: string;
  whatsappNumber: string;
  address: string;
  location: string;
  deliveryFee: number; // Default fee if no neighborhood selected
  minOrder: number;
  openHours: string;
  isOpen: boolean;
  allowOrdersWhenClosed: boolean;
  cartSuggestions?: string[];
  freeDeliveryOver?: number;
  neighborhoods: Neighborhood[];
  loyalty: LoyaltyConfig;
  tabImages?: {
    inicio?: string;
    promos?: string;
    pedidos?: string;
    perfil?: string;
  };
}

export interface Order {
  id: string;
  store_id?: string;
  total: number;
  items: CartItem[];
  customer_phone: string;
  customer_name: string;
  status: 'pendente' | 'preparando' | 'concluido' | 'cancelado';
  delivery_type: 'entrega' | 'retirada' | 'consumo';
  payment_method: string;
  address?: string;
  neighborhood?: string;
  delivery_fee?: number;
  created_at?: string;
}

export interface Customer {
  phone: string;
  store_id?: string;
  points: number;
  orderHistory: Order[];
}

export interface CartItem extends Product {
  quantity: number;
  observation?: string;
  selectedOptions?: {
    groupId: string;
    groupName: string;
    options: ProductOption[];
  }[];
}

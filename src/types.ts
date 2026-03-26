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
  name: string;
  icon?: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  fee: number;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  pointsNeeded: number;
  productId?: string; // If it's a specific product
}

export interface LoyaltyConfig {
  enabled: boolean;
  pointsPerReal: number;
  welcomeBonus: number;
  rewards: LoyaltyReward[];
}

export interface StoreConfig {
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
}

export interface Order {
  id: string;
  date: string;
  total: number;
  items: CartItem[];
}

export interface Customer {
  phone: string;
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

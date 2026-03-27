import { supabase } from '../lib/supabase';
import { Product, Category, StoreConfig, Neighborhood, LoyaltyReward, Order, Customer } from '../types';

export const supabaseService = {
  // Store Config
  async getStoreConfig(): Promise<StoreConfig | null> {
    const { data, error } = await supabase
      .from('store_config')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error fetching store config:', error);
      return null;
    }
    return {
      ...data,
      deliveryFee: data.delivery_fee,
      freeDeliveryOver: data.free_delivery_over,
      tabImages: data.tab_images
    };
  },

  async updateStoreConfig(config: Partial<StoreConfig>) {
    const configToSave = {
      ...config,
      delivery_fee: config.deliveryFee,
      free_delivery_over: config.freeDeliveryOver,
      tab_images: config.tabImages
    };
    // Remove camelCase fields
    delete (configToSave as any).deliveryFee;
    delete (configToSave as any).freeDeliveryOver;
    delete (configToSave as any).tabImages;

    const { error } = await supabase
      .from('store_config')
      .update(configToSave)
      .eq('id', 1); // Assuming a single row with id 1
    
    if (error) throw error;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    return data || [];
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    return (data || []).map(p => ({
      ...p,
      oldPrice: p.old_price,
      categoryId: p.category_id,
      suggestedProducts: p.suggested_products,
      optionGroups: p.option_groups
    }));
  },

  async saveProduct(product: Product) {
    const productToSave = {
      ...product,
      old_price: product.oldPrice,
      category_id: product.categoryId,
      suggested_products: product.suggestedProducts,
      option_groups: product.optionGroups
    };
    // Remove camelCase fields
    delete (productToSave as any).oldPrice;
    delete (productToSave as any).categoryId;
    delete (productToSave as any).suggestedProducts;
    delete (productToSave as any).optionGroups;

    const { error } = await supabase
      .from('products')
      .upsert(productToSave);
    
    if (error) throw error;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Neighborhoods
  async getNeighborhoods(): Promise<Neighborhood[]> {
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching neighborhoods:', error);
      return [];
    }
    return data || [];
  },

  async saveNeighborhood(neighborhood: Neighborhood) {
    const { error } = await supabase
      .from('neighborhoods')
      .upsert(neighborhood);
    
    if (error) throw error;
  },

  async deleteNeighborhood(id: string) {
    const { error } = await supabase
      .from('neighborhoods')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Image Upload
  async uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Orders
  async createOrder(order: Omit<Order, 'id' | 'createdAt'>) {
    const orderToSave = {
      customer_name: (order as any).customerName,
      customer_phone: order.customerPhone,
      items: order.items,
      total: order.total,
      status: order.status,
      delivery_type: order.deliveryType,
      payment_method: order.paymentMethod,
      address: order.address,
      neighborhood: order.neighborhood,
      delivery_fee: order.deliveryFee
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([orderToSave])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getOrdersByCustomer(phone: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
    
    return (data || []).map(order => ({
      ...order,
      customerPhone: order.customer_phone,
      deliveryType: order.delivery_type,
      paymentMethod: order.payment_method,
      deliveryFee: order.delivery_fee,
      createdAt: order.created_at
    }));
  },

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
    
    return (data || []).map(order => ({
      ...order,
      customerPhone: order.customer_phone,
      deliveryType: order.delivery_type,
      paymentMethod: order.payment_method,
      deliveryFee: order.delivery_fee,
      createdAt: order.created_at
    }));
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) throw error;
  }
};

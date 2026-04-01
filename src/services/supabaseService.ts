import { supabase } from '../lib/supabase';
import { Product, Category, StoreConfig, Neighborhood, LoyaltyReward, Order, Customer, Store } from '../types';

export const supabaseService = {
  // Stores
  async getStoreBySlug(slug: string): Promise<Store | null> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error('Error fetching store by slug:', error);
      return null;
    }
    return data;
  },

  async getStoreByEmail(email: string): Promise<Store | null> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching store by email:', error);
      return null;
    }
    return data;
  },

  async getAllStores(): Promise<Store[]> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching all stores:', error);
      return [];
    }
    return data || [];
  },

  async saveStore(store: Store) {
    const { error } = await supabase
      .from('stores')
      .upsert(store);
    
    if (error) throw error;

    // Initialize store config if it doesn't exist
    const { data: existingConfig } = await supabase
      .from('store_config')
      .select('id')
      .eq('store_id', store.id)
      .maybeSingle();

    if (!existingConfig) {
      await supabase.from('store_config').insert({
        store_id: store.id,
        name: store.name,
        is_open: true,
        delivery_fee: 0,
        min_order: 0
      });
    }
  },

  // Store Config
  async getStoreConfig(storeId: string): Promise<StoreConfig | null> {
    const { data, error } = await supabase
      .from('store_config')
      .select('*')
      .eq('store_id', storeId)
      .single();
    
    if (error) {
      console.error('Error fetching store config:', error);
      return null;
    }

    // Fetch neighborhoods separately
    const { data: neighborhoodsData } = await supabase
      .from('neighborhoods')
      .select('*')
      .eq('store_id', storeId)
      .order('name');

    return {
      ...data,
      deliveryFee: data.delivery_fee,
      freeDeliveryOver: data.free_delivery_over,
      tabImages: data.tab_images,
      whatsappNumber: data.whatsapp_number,
      neighborhoods: neighborhoodsData || [],
      loyalty: data.loyalty || {
        enabled: false,
        pointsPerReal: 1,
        welcomeBonus: 0,
        rewards: []
      }
    };
  },

  async updateStoreConfig(config: Partial<StoreConfig>, storeId: string) {
    const configToSave = {
      ...config,
      store_id: storeId,
      delivery_fee: config.deliveryFee,
      free_delivery_over: config.freeDeliveryOver,
      tab_images: config.tabImages,
      whatsapp_number: config.whatsappNumber
    };
    // Remove camelCase fields and neighborhoods (since it's a separate table)
    delete (configToSave as any).deliveryFee;
    delete (configToSave as any).freeDeliveryOver;
    delete (configToSave as any).tabImages;
    delete (configToSave as any).whatsappNumber;
    const neighborhoods = (configToSave as any).neighborhoods;
    delete (configToSave as any).neighborhoods;

    const { error } = await supabase
      .from('store_config')
      .upsert(configToSave, { onConflict: 'store_id' });
    
    if (error) throw error;

    // Save neighborhoods if provided
    if (neighborhoods && Array.isArray(neighborhoods)) {
      // First, get current neighborhoods to see what to delete
      const { data: currentNeighborhoods } = await supabase
        .from('neighborhoods')
        .select('id')
        .eq('store_id', storeId);
      
      const currentIds = currentNeighborhoods?.map(n => n.id) || [];
      const newIds = neighborhoods.map(n => n.id);
      const idsToDelete = currentIds.filter(id => !newIds.includes(id));

      if (idsToDelete.length > 0) {
        await supabase.from('neighborhoods').delete().in('id', idsToDelete);
      }

      if (neighborhoods.length > 0) {
        const { error: nError } = await supabase
          .from('neighborhoods')
          .upsert(neighborhoods.map(n => ({ ...n, store_id: storeId })));
        if (nError) throw nError;
      }
    }
  },

  // Categories
  async getCategories(storeId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    return data || [];
  },

  async saveCategory(category: Category, storeId: string) {
    const categoryToSave = {
      ...category,
      store_id: storeId
    };
    const { error } = await supabase
      .from('categories')
      .upsert(categoryToSave);
    
    if (error) throw error;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Products
  async getProducts(storeId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
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

  async saveProduct(product: Product, storeId: string) {
    const productToSave = {
      id: product.id,
      store_id: storeId,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      available: product.available,
      badge: product.badge,
      old_price: product.oldPrice,
      category_id: product.categoryId,
      suggested_products: product.suggestedProducts || [],
      option_groups: product.optionGroups || []
    };

    const { error } = await supabase
      .from('products')
      .upsert(productToSave);
    
    if (error) {
      console.error('Supabase saveProduct error:', error);
      throw error;
    }
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Neighborhoods
  async getNeighborhoods(storeId: string): Promise<Neighborhood[]> {
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('*')
      .eq('store_id', storeId)
      .order('name');
    
    if (error) {
      console.error('Error fetching neighborhoods:', error);
      return [];
    }
    return data || [];
  },

  async saveNeighborhood(neighborhood: Neighborhood, storeId: string) {
    const { error } = await supabase
      .from('neighborhoods')
      .upsert({ ...neighborhood, store_id: storeId });
    
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
    const fileExt = file?.name?.split('.').pop() || 'png';
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
  async createOrder(order: Omit<Order, 'id' | 'created_at'>, storeId: string) {
    const orderToSave = {
      ...order,
      store_id: storeId
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([orderToSave])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getOrdersByCustomer(phone: string, storeId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_phone', phone)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
    
    return data || [];
  },

  async getAllOrders(storeId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
    
    return data || [];
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) throw error;
  },

  // Customers & Loyalty
  async getCustomer(phone: string, storeId: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .eq('store_id', storeId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching customer:', error);
      return null;
    }
    return data;
  },

  async createOrUpdateCustomer(phone: string, storeId: string, pointsToAdd: number): Promise<Customer | null> {
    const existing = await this.getCustomer(phone, storeId);
    
    if (existing) {
      const { data, error } = await supabase
        .from('customers')
        .update({ points: existing.points + pointsToAdd })
        .eq('phone', phone)
        .eq('store_id', storeId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('customers')
        .insert([{ phone, store_id: storeId, points: pointsToAdd }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  async redeemPoints(phone: string, storeId: string, pointsToSubtract: number): Promise<void> {
    const existing = await this.getCustomer(phone, storeId);
    if (!existing || existing.points < pointsToSubtract) {
      throw new Error('Insufficient points');
    }

    const { error } = await supabase
      .from('customers')
      .update({ points: existing.points - pointsToSubtract })
      .eq('phone', phone)
      .eq('store_id', storeId);
    
    if (error) throw error;
  },

  async getCustomers(storeId: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('store_id', storeId)
      .order('points', { ascending: false });
    
    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
    return data || [];
  }
};

import { Product, Order, UserProfile } from './types';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(credentials: { username: string; password?: string }): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }
    const user = await res.json();
    localStorage.setItem('bazaar_user', JSON.stringify(user));
    return user;
  },

  async register(userData: { username: string; password?: string; email: string; displayName: string }): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Registration failed');
    }
    const user = await res.json();
    localStorage.setItem('bazaar_user', JSON.stringify(user));
    return user;
  },

  logout() {
    localStorage.removeItem('bazaar_user');
  },

  getCurrentUser(): UserProfile | null {
    const stored = localStorage.getItem('bazaar_user');
    return stored ? JSON.parse(stored) : null;
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products`);
    return res.json();
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.json();
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.json();
  },

  async deleteProduct(id: string): Promise<void> {
    await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
  },

  // Orders
  async getOrders(userId?: string): Promise<Order[]> {
    const url = userId ? `${API_BASE}/orders?userId=${userId}` : `${API_BASE}/orders`;
    const res = await fetch(url);
    return res.json();
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async createOrder(order: Partial<Order>): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    return res.json();
  },

  async updateOrder(id: string, order: Partial<Order>): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    return res.json();
  },

  // Settings
  async getSettings(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/settings/${id}`);
    return res.json();
  },

  async updateSettings(id: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/settings/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

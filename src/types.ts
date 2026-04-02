export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating?: number;
  stock?: number;
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  status: 'payment_pending' | 'pending' | 'shipped' | 'delivered';
  trackingNumber?: string;
  estimatedDelivery?: string;
  shippingAddress: {
    name: string;
    address: string;
    phone: string;
  };
  paymentMethod: 'cod' | 'online' | 'upi';
  upiId?: string;
  createdAt: string;
}

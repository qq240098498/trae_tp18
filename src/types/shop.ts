export interface IngredientItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  description: string;
  stock: number;
}

export interface RecipeCombo {
  id: string;
  name: string;
  description: string;
  ingredients: { itemId: string; quantity: number }[];
  totalPrice: number;
  originalPrice: number;
  image: string;
  cuisine: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  cookTime: string;
}

export type CuisineCategory = 'all' | '川菜' | '粤菜' | '家常菜' | '湘菜' | '东北菜' | '素菜' | '汤品';

export interface CartItem {
  itemId: string;
  quantity: number;
}

export type OrderType = 'instant' | 'reservation';
export type OrderStatus = 'pending' | 'confirmed' | 'delivering' | 'delivered' | 'returned' | 'returning' | 'cancelled';
export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type ReturnReason = 'quality' | 'wrong' | 'damaged' | 'expired' | 'other';

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
  subtotal: number;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  reason: ReturnReason;
  description: string;
  status: ReturnStatus;
  createdAt: number;
  processedAt?: number;
  refundAmount?: number;
}

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  totalPrice: number;
  deliveryFee: number;
  finalPrice: number;
  deliveryAddress: string;
  phone: string;
  remark?: string;
  reservationTime?: number;
  createdAt: number;
  updatedAt: number;
  deliveredAt?: number;
  returnRequests?: ReturnRequest[];
}

export interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Order,
  OrderType,
  OrderItem,
  ReturnRequest,
  ReturnReason,
  ReturnStatus,
  TimeSlot,
  CartItem,
} from '@/types/shop';
import { getIngredientById } from '@/data/shopData';

interface CreateOrderParams {
  type: OrderType;
  items: CartItem[];
  totalPrice: number;
  deliveryFee: number;
  finalPrice: number;
  deliveryAddress: string;
  phone: string;
  remark?: string;
  reservationTime?: number;
}

interface CreateReturnParams {
  orderId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  reason: ReturnReason;
  description: string;
}

interface OrderStore {
  orders: Order[];
  createOrder: (params: CreateOrderParams) => Order | null;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: Order['status']) => boolean;
  createReturnRequest: (params: CreateReturnParams) => ReturnRequest | null;
  updateReturnStatus: (orderId: string, returnId: string, status: ReturnStatus, refundAmount?: number) => boolean;
  getTimeSlots: (date: Date) => TimeSlot[];
  cancelOrder: (orderId: string) => boolean;
  getOrdersByStatus: (status?: Order['status']) => Order[];
  getReturnRequests: () => ReturnRequest[];
}

function generateOrderId(): string {
  return `ORD${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function generateReturnId(): string {
  return `RET${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function convertCartItemsToOrderItems(cartItems: CartItem[]): OrderItem[] {
  return cartItems
    .map((item) => {
      const ingredient = getIngredientById(item.itemId);
      if (!ingredient) return null;
      return {
        itemId: item.itemId,
        name: ingredient.name,
        price: ingredient.price,
        unit: ingredient.unit,
        image: ingredient.image,
        quantity: item.quantity,
        subtotal: ingredient.price * item.quantity,
      };
    })
    .filter(Boolean) as OrderItem[];
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],

      createOrder: (params) => {
        const orderItems = convertCartItemsToOrderItems(params.items);
        if (orderItems.length === 0) return null;

        const now = Date.now();
        const newOrder: Order = {
          id: generateOrderId(),
          type: params.type,
          status: 'confirmed',
          items: orderItems,
          totalPrice: params.totalPrice,
          deliveryFee: params.deliveryFee,
          finalPrice: params.finalPrice,
          deliveryAddress: params.deliveryAddress,
          phone: params.phone,
          remark: params.remark,
          reservationTime: params.reservationTime,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return newOrder;
      },

      getOrderById: (id) => {
        return get().orders.find((o) => o.id === id);
      },

      updateOrderStatus: (orderId, status) => {
        const now = Date.now();
        let success = false;

        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id === orderId) {
              success = true;
              const updatedOrder = { ...order, status, updatedAt: now };
              if (status === 'delivered') {
                updatedOrder.deliveredAt = now;
              }
              return updatedOrder;
            }
            return order;
          }),
        }));

        return success;
      },

      createReturnRequest: (params) => {
        const { orderId, itemId, itemName, quantity, reason, description } = params;

        const order = get().getOrderById(orderId);
        if (!order) return null;

        const orderItem = order.items.find((i) => i.itemId === itemId);
        if (!orderItem) return null;

        const returnRequest: ReturnRequest = {
          id: generateReturnId(),
          orderId,
          itemId,
          itemName,
          quantity,
          reason,
          description,
          status: 'pending',
          createdAt: Date.now(),
        };

        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id === orderId) {
              const existingReturns = order.returnRequests || [];
              return {
                ...order,
                status: 'returning',
                returnRequests: [...existingReturns, returnRequest],
                updatedAt: Date.now(),
              };
            }
            return order;
          }),
        }));

        return returnRequest;
      },

      updateReturnStatus: (orderId, returnId, status, refundAmount) => {
        let success = false;

        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id === orderId && order.returnRequests) {
              const updatedReturns = order.returnRequests.map((ret) => {
                if (ret.id === returnId) {
                  success = true;
                  return {
                    ...ret,
                    status,
                    processedAt: Date.now(),
                    refundAmount,
                  };
                }
                return ret;
              });

              const allApproved = updatedReturns.every((r) => r.status === 'approved' || r.status === 'completed');
              const anyRejected = updatedReturns.some((r) => r.status === 'rejected');
              const allCompleted = updatedReturns.every((r) => r.status === 'completed');

              let newStatus = order.status;
              if (allCompleted) {
                newStatus = 'returned';
              } else if (allApproved && !anyRejected) {
                newStatus = 'returning';
              }

              return {
                ...order,
                status: newStatus,
                returnRequests: updatedReturns,
                updatedAt: Date.now(),
              };
            }
            return order;
          }),
        }));

        return success;
      },

      getTimeSlots: (date) => {
        const baseSlots: TimeSlot[] = [
          { id: '1', label: '09:00-10:00', startTime: '09:00', endTime: '10:00', available: true },
          { id: '2', label: '10:00-11:00', startTime: '10:00', endTime: '11:00', available: true },
          { id: '3', label: '11:00-12:00', startTime: '11:00', endTime: '12:00', available: true },
          { id: '4', label: '14:00-15:00', startTime: '14:00', endTime: '15:00', available: true },
          { id: '5', label: '15:00-16:00', startTime: '15:00', endTime: '16:00', available: true },
          { id: '6', label: '16:00-17:00', startTime: '16:00', endTime: '17:00', available: true },
          { id: '7', label: '17:00-18:00', startTime: '17:00', endTime: '18:00', available: false },
        ];

        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        const currentHour = today.getHours();

        return baseSlots.map((slot) => {
          const startHour = parseInt(slot.startTime.split(':')[0]);
          if (isToday && startHour <= currentHour) {
            return { ...slot, available: false };
          }
          return slot;
        });
      },

      cancelOrder: (orderId) => {
        const order = get().getOrderById(orderId);
        if (!order || (order.status !== 'pending' && order.status !== 'confirmed')) {
          return false;
        }

        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id === orderId) {
              return { ...order, status: 'cancelled', updatedAt: Date.now() };
            }
            return order;
          }),
        }));

        return true;
      },

      getOrdersByStatus: (status) => {
        if (!status) return get().orders;
        return get().orders.filter((o) => o.status === status);
      },

      getReturnRequests: () => {
        return get().orders.flatMap((o) => o.returnRequests || []);
      },
    }),
    {
      name: 'order-storage',
    }
  )
);

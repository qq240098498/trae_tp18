import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { getIngredientById } from '@/data/shopData';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Truck,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  onClose: () => void;
}

export default function CartDrawer({ onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');

  const totalPrice = getTotalPrice();
  const deliveryFee = totalPrice >= 99 ? 0 : 8;
  const finalPrice = items.length > 0 ? totalPrice + deliveryFee : 0;

  const handleCheckout = () => {
    if (!deliveryAddress.trim() || !phone.trim()) return;
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderSuccess(true);
      setTimeout(() => {
        clearCart();
        onClose();
      }, 2500);
    }, 1500);
  };

  if (orderSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">下单成功！</h2>
          <p className="text-gray-600 mb-4">
            您的食材订单已提交，预计明天上午 9:00-12:00 送达
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <Truck className="w-4 h-4" />
              <span>配送地址：{deliveryAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-800">
              <CreditCard className="w-4 h-4" />
              <span>实付金额：¥{finalPrice.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">购物车</h2>
              <p className="text-xs text-gray-500">{items.length} 种食材</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">购物车是空的</h3>
            <p className="text-sm text-gray-500 text-center">
              快去挑选新鲜食材吧～
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.map((cartItem) => {
                const ingredient = getIngredientById(cartItem.itemId);
                if (!ingredient) return null;
                const subtotal = ingredient.price * cartItem.quantity;
                return (
                  <div
                    key={cartItem.itemId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm">
                      {ingredient.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {ingredient.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ingredient.unit} · ¥{ingredient.price}
                      </div>
                      <div className="text-sm font-semibold text-emerald-600 mt-0.5">
                        ¥{subtotal.toFixed(1)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(cartItem.itemId)}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                        <button
                          onClick={() => updateQuantity(cartItem.itemId, cartItem.quantity - 1)}
                          className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-gray-800">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(cartItem.itemId, cartItem.quantity + 1)}
                          className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPrice < 99 && items.length > 0 && (
              <div className="mx-5 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-amber-800">
                  <Truck className="w-4 h-4 flex-shrink-0" />
                  <span>
                    再购 <span className="font-bold text-amber-900">¥{(99 - totalPrice).toFixed(1)}</span> 即可免配送费
                  </span>
                </div>
                <div className="mt-2 w-full bg-amber-200/50 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                    style={{ width: `${Math.min(100, (totalPrice / 99) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 p-5 space-y-4 bg-white">
              {!isCheckingOut ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">商品金额</span>
                      <span className="text-gray-800 font-medium">¥{totalPrice.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        配送费
                      </span>
                      <span
                        className={cn(
                          'font-medium',
                          deliveryFee === 0 ? 'text-green-600' : 'text-gray-800'
                        )}
                      >
                        {deliveryFee === 0 ? '免运费' : `¥${deliveryFee}`}
                      </span>
                    </div>
                    <div className="h-px bg-gray-100 my-2" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800">合计</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-gray-500">¥</span>
                        <span className="text-3xl font-bold text-red-500">{finalPrice.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                        配送地址
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="请输入详细配送地址"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                        联系电话
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="请输入手机号码"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={clearCart}
                      className="px-4 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all text-sm"
                    >
                      清空
                    </button>
                    <button
                      onClick={handleCheckout}
                      disabled={!deliveryAddress.trim() || !phone.trim()}
                      className={cn(
                        'flex-1 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2',
                        deliveryAddress.trim() && phone.trim()
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30'
                          : 'bg-gray-300 cursor-not-allowed'
                      )}
                    >
                      立即结算
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                      正品保证
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Truck className="w-3.5 h-3.5 text-blue-500" />
                      次日送达
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <CreditCard className="w-3.5 h-3.5 text-purple-500" />
                      安全支付
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-700 font-medium">正在提交订单...</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

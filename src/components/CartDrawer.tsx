import { useState, useMemo } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import { getIngredientById } from '@/data/shopData';
import type { OrderType, TimeSlot } from '@/types/shop';
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
  AlertTriangle,
  PackageX,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  onClose: () => void;
}

export default function CartDrawer({ onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const stockVersion = useCartStore((s) => s.stockVersion);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const getAvailableStock = useCartStore((s) => s.getAvailableStock);
  const stockError = useCartStore((s) => s.stockError);
  const clearStockError = useCartStore((s) => s.clearStockError);
  const checkout = useCartStore((s) => s.checkout);
  const createOrder = useOrderStore((s) => s.createOrder);
  const getTimeSlots = useOrderStore((s) => s.getTimeSlots);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [localStockError, setLocalStockError] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('instant');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [remark, setRemark] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const totalPrice = getTotalPrice();
  const deliveryFee = totalPrice >= 99 ? 0 : 8;
  const finalPrice = items.length > 0 ? totalPrice + deliveryFee : 0;

  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  const timeSlots = useMemo(() => {
    return getTimeSlots(selectedDate);
  }, [selectedDate, getTimeSlots]);

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return '今天';
    if (date.toDateString() === tomorrow.toDateString()) return '明天';
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${date.getMonth() + 1}/${date.getDate()} ${weekDays[date.getDay()]}`;
  };

  const getReservationTimestamp = () => {
    if (!selectedTimeSlot) return undefined;
    const [hours, minutes] = selectedTimeSlot.startTime.split(':').map(Number);
    const date = new Date(selectedDate);
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  };

  const canSubmit = () => {
    if (!deliveryAddress.trim() || !phone.trim()) return false;
    if (stockCheckResult.hasStockError) return false;
    if (orderType === 'reservation' && !selectedTimeSlot) return false;
    return true;
  };

  const stockCheckResult = useMemo(() => {
    let hasStockError = false;
    let hasLowStock = false;
    const errorItems: string[] = [];

    items.forEach((cartItem) => {
      const stock = getAvailableStock(cartItem.itemId);
      if (stock === 0) {
        hasStockError = true;
        const item = getIngredientById(cartItem.itemId);
        if (item) errorItems.push(`「${item.name}」已售罄`);
      } else if (cartItem.quantity > stock) {
        hasStockError = true;
        const item = getIngredientById(cartItem.itemId);
        if (item) errorItems.push(`「${item.name}」仅剩${stock}份`);
      } else if (stock <= 5) {
        hasLowStock = true;
      }
    });

    return { hasStockError, hasLowStock, errorItems };
  }, [items, getAvailableStock, stockVersion]);

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    const stock = getAvailableStock(itemId);
    if (newQuantity > stock) {
      const item = getIngredientById(itemId);
      setLocalStockError(`「${item?.name}」库存不足，仅剩${stock}份`);
      setTimeout(() => setLocalStockError(null), 3000);
      return;
    }
    const success = updateQuantity(itemId, newQuantity);
    if (!success) {
      setTimeout(() => clearStockError(), 3000);
    }
  };

  const handleCheckout = () => {
    if (!canSubmit()) return;
    if (stockCheckResult.hasStockError) {
      setLocalStockError(`库存不足：${stockCheckResult.errorItems.join('、')}，请调整后再结算`);
      setTimeout(() => setLocalStockError(null), 4000);
      return;
    }
    setIsCheckingOut(true);
    setTimeout(() => {
      const result = checkout();
      setIsCheckingOut(false);
      if (result.success) {
        const order = createOrder({
          type: orderType,
          items,
          totalPrice,
          deliveryFee,
          finalPrice,
          deliveryAddress,
          phone,
          remark: remark.trim() || undefined,
          reservationTime: orderType === 'reservation' ? getReservationTimestamp() : undefined,
        });
        if (order) {
          setOrderSuccess(true);
          setTimeout(() => {
            onClose();
          }, 2500);
        }
      } else {
        const errorMsgs = result.errors.map((e) => `「${e.itemName}」仅剩${e.available}份`).join('、');
        setLocalStockError(`库存不足：${errorMsgs}，请调整后再结算`);
        setTimeout(() => setLocalStockError(null), 4000);
      }
    }, 1500);
  };

  if (orderSuccess) {
    const isReservation = orderType === 'reservation';
    const deliveryTimeText = isReservation && selectedTimeSlot
      ? `${formatDate(selectedDate)} ${selectedTimeSlot.label}`
      : '明天上午 9:00-12:00';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isReservation ? '预约成功！' : '下单成功！'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isReservation
              ? `您的预约订单已提交，预计${deliveryTimeText}送达`
              : '您的食材订单已提交，预计明天上午 9:00-12:00 送达'}
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left space-y-2">
            {isReservation && (
              <div className="flex items-center gap-2 text-sm text-green-800">
                <Calendar className="w-4 h-4" />
                <span>预约时间：{deliveryTimeText}</span>
              </div>
            )}
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
            {(localStockError || stockError) && (
              <div className="mx-5 mt-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-800">{localStockError || `「${stockError?.itemName}」库存不足，仅剩${stockError?.available}份`}</div>
                </div>
              </div>
            )}

            {stockCheckResult.hasLowStock && !stockCheckResult.hasStockError && (
              <div className="mx-5 mt-5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-amber-800">部分商品库存紧张</div>
                  <div className="text-xs text-amber-600 mt-0.5">建议尽快下单，避免售罄</div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.map((cartItem) => {
                const ingredient = getIngredientById(cartItem.itemId);
                if (!ingredient) return null;
                const subtotal = ingredient.price * cartItem.quantity;
                const stock = getAvailableStock(cartItem.itemId);
                const isOutOfStock = stock === 0;
                const isLowStock = stock <= 5 && stock > 0;
                const isOverStock = cartItem.quantity > stock;

                return (
                  <div
                    key={cartItem.itemId}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl transition-colors',
                      isOutOfStock || isOverStock ? 'bg-red-50 border border-red-200' : 'bg-gray-50 hover:bg-gray-100'
                    )}
                  >
                    <div className="relative">
                      <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm">
                        {ingredient.image}
                      </div>
                      {isOutOfStock && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <PackageX className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate flex items-center gap-2">
                        {ingredient.name}
                        {isOutOfStock && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">已售罄</span>
                        )}
                        {isLowStock && !isOutOfStock && (
                          <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">仅剩{stock}份</span>
                        )}
                        {isOverStock && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">超库存{cartItem.quantity - stock}份</span>
                        )}
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
                          onClick={() => handleUpdateQuantity(cartItem.itemId, cartItem.quantity - 1)}
                          className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-gray-800">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(cartItem.itemId, cartItem.quantity + 1)}
                          disabled={isOutOfStock || cartItem.quantity >= stock}
                          className={cn(
                            'w-7 h-7 rounded-md flex items-center justify-center transition-all',
                            isOutOfStock || cartItem.quantity >= stock
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-600 hover:bg-gray-100'
                          )}
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
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                      <button
                        onClick={() => setOrderType('instant')}
                        className={cn(
                          'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5',
                          orderType === 'instant'
                            ? 'bg-white text-emerald-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        )}
                      >
                        <Truck className="w-4 h-4" />
                        立即配送
                      </button>
                      <button
                        onClick={() => setOrderType('reservation')}
                        className={cn(
                          'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5',
                          orderType === 'reservation'
                            ? 'bg-white text-emerald-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        )}
                      >
                        <Calendar className="w-4 h-4" />
                        预约配送
                      </button>
                    </div>

                    {orderType === 'reservation' && (
                      <div className="space-y-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                          <Clock className="w-4 h-4" />
                          选择配送时间
                        </div>

                        <div className="relative">
                          <button
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="w-full flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-emerald-200 text-sm"
                          >
                            <span className="text-gray-800">{formatDate(selectedDate)}</span>
                            <ChevronRight className={cn('w-4 h-4 text-gray-400 transition-transform', showCalendar && 'rotate-90')} />
                          </button>

                          {showCalendar && (
                            <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-gray-100 z-10">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700">选择日期</span>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {availableDates.map((date, idx) => {
                                  const isSelected = date.toDateString() === selectedDate.toDateString();
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        setSelectedDate(date);
                                        setSelectedTimeSlot(null);
                                        setShowCalendar(false);
                                      }}
                                      className={cn(
                                        'py-2 px-1 rounded-lg text-xs transition-all',
                                        isSelected
                                          ? 'bg-emerald-500 text-white'
                                          : 'bg-gray-50 text-gray-600 hover:bg-emerald-50'
                                      )}
                                    >
                                      <div>{formatDate(date).split(' ')[0]}</div>
                                      <div className="text-[10px] opacity-70">{formatDate(date).split(' ')[1]}</div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-gray-500">选择时间段</div>
                          <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((slot) => (
                              <button
                                key={slot.id}
                                onClick={() => slot.available && setSelectedTimeSlot(slot)}
                                disabled={!slot.available}
                                className={cn(
                                  'py-2 px-2 rounded-lg text-xs font-medium transition-all',
                                  selectedTimeSlot?.id === slot.id
                                    ? 'bg-emerald-500 text-white'
                                    : slot.available
                                    ? 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100'
                                )}
                              >
                                {slot.label}
                                {!slot.available && <div className="text-[10px]">已约满</div>}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

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
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1.5 block flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        订单备注
                      </label>
                      <textarea
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="如有特殊要求请备注（选填）"
                        rows={2}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
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
                      disabled={!canSubmit()}
                      className={cn(
                        'flex-1 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2',
                        canSubmit()
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30'
                          : 'bg-gray-300 cursor-not-allowed'
                      )}
                    >
                      {stockCheckResult.hasStockError
                        ? '部分商品库存不足'
                        : orderType === 'reservation' && !selectedTimeSlot
                        ? '请选择预约时间'
                        : orderType === 'reservation'
                        ? '提交预约'
                        : '立即结算'}
                      {!stockCheckResult.hasStockError && <ArrowRight className="w-4 h-4" />}
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

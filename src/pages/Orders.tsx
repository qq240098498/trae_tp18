import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/store/orderStore';
import type { Order, OrderStatus, OrderItem, ReturnRequest } from '@/types/shop';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  RotateCcw,
  XCircle,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReturnModal from '@/components/ReturnModal';

const STATUS_TABS: { key: OrderStatus | 'all'; label: string; emoji: string }[] = [
  { key: 'all', label: '全部', emoji: '📋' },
  { key: 'confirmed', label: '待发货', emoji: '📦' },
  { key: 'delivering', label: '配送中', emoji: '🚚' },
  { key: 'delivered', label: '已送达', emoji: '✅' },
  { key: 'returning', label: '退货中', emoji: '↩️' },
  { key: 'returned', label: '已退货', emoji: '♻️' },
  { key: 'cancelled', label: '已取消', emoji: '❌' },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待确认', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  confirmed: { label: '待发货', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  delivering: { label: '配送中', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  delivered: { label: '已送达', color: 'text-green-600', bgColor: 'bg-green-50' },
  returning: { label: '退货中', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  returned: { label: '已退货', color: 'text-gray-600', bgColor: 'bg-gray-50' },
  cancelled: { label: '已取消', color: 'text-red-600', bgColor: 'bg-red-50' },
};

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case 'confirmed':
      return <Package className="w-4 h-4" />;
    case 'delivering':
      return <Truck className="w-4 h-4" />;
    case 'delivered':
      return <CheckCircle className="w-4 h-4" />;
    case 'returning':
      return <RefreshCw className="w-4 h-4" />;
    case 'returned':
      return <RotateCcw className="w-4 h-4" />;
    case 'cancelled':
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function OrderCard({
  order,
  onOpenReturn,
}: {
  order: Order;
  onOpenReturn: (order: Order, item: OrderItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = STATUS_CONFIG[order.status];
  const canReturn = order.status === 'delivered';

  const hasReturnRequests = order.returnRequests && order.returnRequests.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">订单号: {order.id}</span>
          </div>
          <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', statusConfig.bgColor, statusConfig.color)}>
            {getStatusIcon(order.status)}
            {statusConfig.label}
          </div>
        </div>

        {order.type === 'reservation' && order.reservationTime && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg mb-3">
            <Calendar className="w-4 h-4" />
            <span>预约配送: {formatTime(order.reservationTime)}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-xl border-2 border-white shadow-sm"
              >
                {item.image}
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-medium text-gray-500 border-2 border-white">
                +{order.items.length - 3}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-600 truncate">
              {order.items.map((i) => i.name).join('、')}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {formatDate(order.createdAt)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-red-500">¥{order.finalPrice.toFixed(1)}</div>
            <div className="text-xs text-gray-400">共 {order.items.reduce((s, i) => s + i.quantity, 0)} 件</div>
          </div>
          <div className="ml-2">
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="space-y-3 mb-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                  {item.image}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    {item.unit} × {item.quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">¥{item.subtotal.toFixed(1)}</div>
                  {canReturn && !hasReturnRequestForItem(order, item.itemId) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenReturn(order, item);
                      }}
                      className="mt-1 text-xs text-orange-500 hover:text-orange-600 flex items-center gap-0.5 ml-auto"
                    >
                      <RotateCcw className="w-3 h-3" />
                      申请退货
                    </button>
                  )}
                  {hasReturnRequestForItem(order, item.itemId) && (
                    <div className="mt-1 text-xs text-orange-500 flex items-center gap-0.5 ml-auto">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      退货中
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">商品金额</span>
              <span className="text-gray-800">¥{order.totalPrice.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">配送费</span>
              <span className={order.deliveryFee === 0 ? 'text-green-600' : 'text-gray-800'}>
                {order.deliveryFee === 0 ? '免运费' : `¥${order.deliveryFee}`}
              </span>
            </div>
            {order.remark && (
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  备注
                </span>
                <span className="text-gray-600">{order.remark}</span>
              </div>
            )}
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex justify-between">
              <span className="font-bold text-gray-800">实付金额</span>
              <span className="text-xl font-bold text-red-500">¥{order.finalPrice.toFixed(1)}</span>
            </div>
          </div>

          {order.deliveredAt && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span>送达时间: {formatDate(order.deliveredAt)}</span>
              </div>
            </div>
          )}

          {hasReturnRequests && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <RefreshCw className="w-4 h-4" />
                退货申请
              </div>
              {order.returnRequests?.map((ret) => (
                <ReturnRequestCard key={ret.id} request={ret} />
              ))}
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-100 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">配送信息</div>
            <div className="text-sm text-gray-700">
              <div>地址: {order.deliveryAddress}</div>
              <div>电话: {order.phone}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function hasReturnRequestForItem(order: Order, itemId: string): boolean {
  if (!order.returnRequests) return false;
  return order.returnRequests.some(
    (r) => r.itemId === itemId && r.status !== 'rejected' && r.status !== 'completed'
  );
}

function ReturnRequestCard({ request }: { request: ReturnRequest }) {
  const RETURN_REASON_LABELS: Record<string, string> = {
    quality: '商品质量问题',
    wrong: '发错商品',
    damaged: '商品破损',
    expired: '商品过期',
    other: '其他原因',
  };

  const statusConfig = {
    pending: { label: '待审核', color: 'text-amber-600', bgColor: 'bg-amber-50' },
    approved: { label: '审核通过', color: 'text-green-600', bgColor: 'bg-green-50' },
    rejected: { label: '审核拒绝', color: 'text-red-600', bgColor: 'bg-red-50' },
    completed: { label: '退款完成', color: 'text-gray-600', bgColor: 'bg-gray-50' },
  }[request.status];

  return (
    <div className={cn('p-3 rounded-xl border', statusConfig.bgColor, `border-${statusConfig.color.replace('text-', '')}-200`)}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">{request.itemName}</span>
          <span className="text-xs text-gray-500">× {request.quantity}</span>
        </div>
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusConfig.color, statusConfig.bgColor)}>
          {statusConfig.label}
        </span>
      </div>
      <div className="text-xs text-gray-600 space-y-1">
        <div>原因: {RETURN_REASON_LABELS[request.reason]}</div>
        {request.description && <div>说明: {request.description}</div>}
        {request.refundAmount !== undefined && (
          <div className="text-green-600 font-medium">退款金额: ¥{request.refundAmount.toFixed(1)}</div>
        )}
        <div className="text-gray-400">申请时间: {formatDate(request.createdAt)}</div>
      </div>
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const orders = useOrderStore((s) => s.orders);
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);

  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'all'>('all');
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState<Order | null>(null);
  const [returnItem, setReturnItem] = useState<OrderItem | null>(null);

  const filteredOrders = useMemo(() => {
    if (activeStatus === 'all') return orders;
    return orders.filter((o) => o.status === activeStatus);
  }, [orders, activeStatus]);

  const handleOpenReturn = (order: Order, item: OrderItem) => {
    setReturnOrder(order);
    setReturnItem(item);
    setReturnModalOpen(true);
  };

  const handleCloseReturn = () => {
    setReturnModalOpen(false);
    setReturnOrder(null);
    setReturnItem(null);
  };

  const handleSimulateDelivery = (orderId: string) => {
    updateOrderStatus(orderId, 'delivering');
    setTimeout(() => {
      updateOrderStatus(orderId, 'delivered');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <header className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/shop')}
            className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:border-emerald-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">我的订单</h1>
            <p className="text-xs text-gray-500">查看订单详情及售后</p>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveStatus(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all text-sm',
                activeStatus === tab.key
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-100'
              )}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无订单</h3>
            <p className="text-gray-500 text-sm mb-4">快去商城选购新鲜食材吧</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition-all"
            >
              去选购
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="relative">
                <OrderCard order={order} onOpenReturn={handleOpenReturn} />
                {order.status === 'confirmed' && (
                  <div className="absolute top-4 right-20">
                    <button
                      onClick={() => handleSimulateDelivery(order.id)}
                      className="text-xs px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      模拟发货
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {returnModalOpen && returnOrder && returnItem && (
        <ReturnModal
          order={returnOrder}
          item={returnItem}
          onClose={handleCloseReturn}
        />
      )}
    </div>
  );
}

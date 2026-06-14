import { useState } from 'react';
import { useOrderStore } from '@/store/orderStore';
import type { Order, OrderItem, ReturnReason } from '@/types/shop';
import {
  X,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Package,
  Minus,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReturnModalProps {
  order: Order;
  item: OrderItem;
  onClose: () => void;
}

const RETURN_REASONS: { key: ReturnReason; label: string; icon: string }[] = [
  { key: 'quality', label: '商品质量问题', icon: '⚠️' },
  { key: 'wrong', label: '发错商品', icon: '📦' },
  { key: 'damaged', label: '商品破损', icon: '💔' },
  { key: 'expired', label: '商品过期', icon: '📅' },
  { key: 'other', label: '其他原因', icon: '❓' },
];

export default function ReturnModal({ order, item, onClose }: ReturnModalProps) {
  const createReturnRequest = useOrderStore((s) => s.createReturnRequest);
  const updateReturnStatus = useOrderStore((s) => s.updateReturnStatus);

  const [selectedReason, setSelectedReason] = useState<ReturnReason | null>(null);
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const maxQuantity = item.quantity;
  const refundAmount = (item.price * quantity).toFixed(1);

  const handleSubmit = () => {
    if (!selectedReason) {
      setErrorMsg('请选择退货原因');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    if (quantity <= 0 || quantity > maxQuantity) {
      setErrorMsg('请输入有效的退货数量');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const returnRequest = createReturnRequest({
        orderId: order.id,
        itemId: item.itemId,
        itemName: item.name,
        quantity,
        reason: selectedReason,
        description: description.trim(),
      });

      setIsSubmitting(false);

      if (returnRequest) {
        setSubmitSuccess(true);

        setTimeout(() => {
          updateReturnStatus(order.id, returnRequest.id, 'approved', item.price * quantity);

          setTimeout(() => {
            updateReturnStatus(order.id, returnRequest.id, 'completed', item.price * quantity);
            onClose();
          }, 2000);
        }, 2000);
      } else {
        setErrorMsg('申请失败，请稍后重试');
        setTimeout(() => setErrorMsg(null), 3000);
      }
    }, 1500);
  };

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div
          className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">申请已提交</h2>
          <p className="text-gray-600 mb-4">
            您的退货申请已提交，工作人员将在24小时内审核
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <Package className="w-4 h-4" />
              <span>商品: {item.name} × {quantity}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-800">
              <RotateCcw className="w-4 h-4" />
              <span>预计退款: ¥{refundAmount}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">申请退货</h2>
              <p className="text-xs text-gray-500">请填写退货原因</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-10rem)] space-y-5">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm">
              {item.image}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-800">{item.name}</div>
              <div className="text-xs text-gray-500">{item.unit} × {item.quantity}</div>
              <div className="text-sm font-semibold text-emerald-600 mt-0.5">¥{item.subtotal.toFixed(1)}</div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              退货数量
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                    quantity <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-white'
                  )}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-semibold text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  disabled={quantity >= maxQuantity}
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                    quantity >= maxQuantity ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-white'
                  )}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-gray-500">最多可退 {maxQuantity} 件</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              退货原因
            </label>
            <div className="space-y-2">
              {RETURN_REASONS.map((reason) => (
                <button
                  key={reason.key}
                  onClick={() => setSelectedReason(reason.key)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                    selectedReason === reason.key
                      ? 'bg-orange-50 border-2 border-orange-300'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  )}
                >
                  <span className="text-xl">{reason.icon}</span>
                  <span className="text-sm text-gray-800">{reason.label}</span>
                  {selectedReason === reason.key && (
                    <CheckCircle2 className="w-5 h-5 text-orange-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              问题描述（选填）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请详细描述问题，以便我们更好地为您处理..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <div className="font-medium mb-1">退货须知</div>
                <ul className="text-xs space-y-1 text-orange-700">
                  <li>• 生鲜商品请在签收后24小时内申请退货</li>
                  <li>• 退款将在审核通过后1-3个工作日内到账</li>
                  <li>• 如有疑问请联系客服：400-888-8888</li>
                </ul>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">{errorMsg}</div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">预计退款金额</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-gray-500">¥</span>
              <span className="text-2xl font-bold text-red-500">{refundAmount}</span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={cn(
              'w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2',
              isSubmitting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30'
            )}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                提交申请中...
              </>
            ) : (
              <>
                <RotateCcw className="w-5 h-5" />
                提交退货申请
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

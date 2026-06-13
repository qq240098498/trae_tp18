import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RECIPE_COMBOS, INGREDIENTS, getIngredientById, generateComboFromRecipe } from '@/data/shopData';
import { useCartStore } from '@/store/cartStore';
import type { RecipeCombo, CuisineCategory } from '@/types/shop';
import DifficultyStars from '@/components/DifficultyStars';
import CartDrawer from '@/components/CartDrawer';
import {
  ShoppingBag,
  ArrowLeft,
  Search,
  Clock,
  ChefHat,
  Plus,
  Minus,
  ShoppingCart,
  X,
  Truck,
  ShieldCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CUISINE_TABS: { key: CuisineCategory; label: string; emoji: string }[] = [
  { key: 'all', label: '全部', emoji: '🍽️' },
  { key: '川菜', label: '川菜', emoji: '🌶️' },
  { key: '粤菜', label: '粤菜', emoji: '🥢' },
  { key: '家常菜', label: '家常菜', emoji: '🏠' },
  { key: '湘菜', label: '湘菜', emoji: '🔥' },
  { key: '东北菜', label: '东北菜', emoji: '🥟' },
  { key: '素菜', label: '素菜', emoji: '🥗' },
  { key: '汤品', label: '汤品', emoji: '🍲' },
];

interface LocationState {
  recipeName?: string;
  ingredients?: string[];
  fromAnalysis?: boolean;
}

export default function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [activeCuisine, setActiveCuisine] = useState<CuisineCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCombo, setSelectedCombo] = useState<RecipeCombo | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const addCombo = useCartStore((s) => s.addCombo);
  const addItem = useCartStore((s) => s.addItem);
  const getTotalCount = useCartStore((s) => s.getTotalCount);
  const cartCount = getTotalCount();

  const aiCombo = useMemo(() => {
    if (state?.fromAnalysis && state?.recipeName) {
      return generateComboFromRecipe(state.recipeName, state.ingredients || []);
    }
    return null;
  }, [state]);

  const displayCombos = useMemo(() => {
    let combos = [...RECIPE_COMBOS];

    if (aiCombo) {
      combos = [aiCombo, ...combos];
    }

    if (activeCuisine !== 'all') {
      combos = combos.filter((c) => c.cuisine === activeCuisine);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      combos = combos.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.ingredients.some((ing) => {
            const item = getIngredientById(ing.itemId);
            return item?.name.toLowerCase().includes(q);
          })
      );
    }

    return combos;
  }, [activeCuisine, searchQuery, aiCombo]);

  const showAddedToast = (name: string) => {
    setAddedToast(name);
    setTimeout(() => setAddedToast(null), 2000);
  };

  const handleAddComboToCart = (combo: RecipeCombo) => {
    addCombo(combo.ingredients);
    showAddedToast(combo.name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:border-emerald-200 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">鲜蔬商城</h1>
                  <p className="text-xs text-gray-500">新鲜食材 · 配送到家</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCart(true)}
            className="relative w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:border-emerald-200 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </header>

        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">新鲜直达</h3>
              <p className="text-emerald-50 text-sm leading-relaxed">
                产地直供新鲜食材，当日下单次日配送到家，全程冷链保鲜，品质有保障
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs bg-white/20 rounded-full px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>品质保障</span>
            </div>
          </div>
        </div>

        {aiCombo && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  AI 智能推荐套餐
                  <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full">
                    为您定制
                  </span>
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  根据您识别的菜谱「{state?.recipeName}」智能匹配的食材组合
                </p>
              </div>
            </div>
            <ComboCard
              combo={aiCombo}
              isAiRecommended
              onViewDetail={() => setSelectedCombo(aiCombo)}
              onAddToCart={() => handleAddComboToCart(aiCombo)}
            />
          </div>
        )}

        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索菜品、食材..."
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 placeholder-gray-400"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 scrollbar-hide">
          {CUISINE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCuisine(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all text-sm',
                activeCuisine === tab.key
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-100'
              )}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {displayCombos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无匹配结果</h3>
            <p className="text-gray-500 text-sm">试试其他关键词或菜系分类</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayCombos.map((combo) => (
              <ComboCard
                key={combo.id}
                combo={combo}
                onViewDetail={() => setSelectedCombo(combo)}
                onAddToCart={() => handleAddComboToCart(combo)}
              />
            ))}
          </div>
        )}

        <footer className="mt-10 text-center text-gray-500 text-xs pb-4">
          <p>🛒 满 99 元免配送费 · 🥬 新鲜保证 · 📞 客服 400-888-8888</p>
        </footer>
      </div>

      {selectedCombo && (
        <ComboDetailModal
          combo={selectedCombo}
          onClose={() => setSelectedCombo(null)}
          onAddToCart={() => {
            handleAddComboToCart(selectedCombo);
            setSelectedCombo(null);
          }}
          onAddSingleItem={(itemId, qty) => {
            addItem(itemId, qty);
            const item = getIngredientById(itemId);
            if (item) showAddedToast(item.name);
          }}
        />
      )}

      {showCart && <CartDrawer onClose={() => setShowCart(false)} />}

      {addedToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gray-900 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">已加入「{addedToast}」</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ComboCard({
  combo,
  isAiRecommended = false,
  onViewDetail,
  onAddToCart,
}: {
  combo: RecipeCombo;
  isAiRecommended?: boolean;
  onViewDetail: () => void;
  onAddToCart: () => void;
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer group',
        isAiRecommended ? 'border-amber-300 ring-2 ring-amber-200/50' : 'border-gray-100'
      )}
      onClick={onViewDetail}
    >
      <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <span className="text-6xl transition-transform group-hover:scale-110">{combo.image}</span>
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium',
              isAiRecommended
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                : 'bg-emerald-100 text-emerald-700'
            )}
          >
            {isAiRecommended ? '✨ AI推荐' : combo.cuisine}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
          <Tag className="w-3 h-3 text-red-500" />
          <span className="text-xs font-bold text-red-500">
            {Math.round((1 - combo.totalPrice / combo.originalPrice) * 100)}% OFF
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{combo.name}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 h-8">{combo.description}</p>

        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{combo.cookTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5" />
            <DifficultyStars stars={combo.difficulty} size="sm" showLabel={false} />
          </div>
          <div className="flex items-center gap-1">
            <span>🥬</span>
            <span>{combo.ingredients.length}种</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-red-500">¥{combo.totalPrice}</span>
              <span className="text-xs text-gray-400 line-through">¥{combo.originalPrice}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 hover:shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ComboDetailModal({
  combo,
  onClose,
  onAddToCart,
  onAddSingleItem,
}: {
  combo: RecipeCombo;
  onClose: () => void;
  onAddToCart: () => void;
  onAddSingleItem: (itemId: string, qty: number) => void;
}) {
  const discount = Math.round((1 - combo.totalPrice / combo.originalPrice) * 100);
  const saved = (combo.originalPrice - combo.totalPrice).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-40 bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100 flex items-center justify-center">
          <span className="text-8xl">{combo.image}</span>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-gray-600 hover:text-gray-800 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-emerald-700">
              {combo.cuisine}
            </span>
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold shadow-md">
              省 ¥{saved}
            </span>
          </div>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-10rem)]">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{combo.name}</h2>
          <p className="text-sm text-gray-500 mb-4">{combo.description}</p>

          <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-xl">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div className="font-bold text-gray-800">{combo.cookTime}</div>
              <div className="text-xs text-gray-500">烹饪时长</div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ChefHat className="w-4 h-4 text-amber-500" />
              </div>
              <DifficultyStars stars={combo.difficulty} size="sm" />
              <div className="text-xs text-gray-500 mt-1">难度等级</div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center flex-1">
              <div className="text-lg mb-1">🥬</div>
              <div className="font-bold text-gray-800">{combo.ingredients.length}</div>
              <div className="text-xs text-gray-500">食材种类</div>
            </div>
          </div>

          <div className="mb-5">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>🛒</span>
              套餐食材明细
              <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                套餐立省 {discount}%
              </span>
            </h3>
            <div className="space-y-2">
              {combo.ingredients.map((ing, idx) => {
                const item = getIngredientById(ing.itemId);
                if (!item) return null;
                const itemTotal = item.price * ing.quantity;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                      {item.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.unit} × {ing.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">¥{itemTotal.toFixed(1)}</div>
                      <button
                        onClick={() => onAddSingleItem(ing.itemId, 1)}
                        className="mt-1 text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 ml-auto"
                      >
                        <Plus className="w-3 h-3" />
                        单独加购
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-5 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">套餐原价</span>
              <span className="text-gray-500 line-through">¥{combo.originalPrice}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">优惠金额</span>
              <span className="text-red-500 font-medium">-¥{saved}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-red-100">
              <span className="font-bold text-gray-800">套餐价</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-red-500">¥{combo.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
          <button
            onClick={onAddToCart}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            一键加入套餐 · ¥{combo.totalPrice}
          </button>
        </div>
      </div>
    </div>
  );
}

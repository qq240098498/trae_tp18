import type { IngredientItem, RecipeCombo } from '@/types/shop';

export const INGREDIENTS: IngredientItem[] = [
  { id: 'tomato', name: '番茄', price: 6.8, unit: '500g', image: '🍅', category: '蔬菜', description: '新鲜自然熟番茄，酸甜可口' },
  { id: 'egg', name: '鸡蛋', price: 12.9, unit: '10枚', image: '🥚', category: '蛋类', description: '农家土鸡蛋，营养丰富' },
  { id: 'chicken-breast', name: '鸡胸肉', price: 18.8, unit: '500g', image: '🍗', category: '肉类', description: '新鲜鸡胸肉，低脂高蛋白' },
  { id: 'beef', name: '牛肉', price: 58.0, unit: '500g', image: '🥩', category: '肉类', description: '精选牛里脊，鲜嫩多汁' },
  { id: 'pork', name: '五花肉', price: 32.0, unit: '500g', image: '🥓', category: '肉类', description: '三层五花肉，肥瘦相间' },
  { id: 'tofu', name: '豆腐', price: 4.5, unit: '一盒', image: '🧈', category: '豆制品', description: '嫩豆腐，滑嫩细腻' },
  { id: 'potato', name: '土豆', price: 5.8, unit: '500g', image: '🥔', category: '蔬菜', description: '黄心土豆，粉糯香甜' },
  { id: 'carrot', name: '胡萝卜', price: 4.2, unit: '500g', image: '🥕', category: '蔬菜', description: '新鲜胡萝卜，脆甜多汁' },
  { id: 'cucumber', name: '黄瓜', price: 5.5, unit: '500g', image: '🥒', category: '蔬菜', description: '顶花带刺黄瓜，清脆爽口' },
  { id: 'mushroom', name: '香菇', price: 12.0, unit: '250g', image: '🍄', category: '菌菇', description: '新鲜香菇，肉质肥厚' },
  { id: 'fish', name: '鲈鱼', price: 38.0, unit: '一条', image: '🐟', category: '水产', description: '鲜活鲈鱼，肉质细嫩' },
  { id: 'shrimp', name: '鲜虾', price: 48.0, unit: '500g', image: '🦐', category: '水产', description: '活冻大虾，鲜甜弹牙' },
  { id: 'green-onion', name: '葱', price: 3.5, unit: '一把', image: '🧅', category: '调味', description: '新鲜小葱，香气浓郁' },
  { id: 'garlic', name: '大蒜', price: 8.0, unit: '500g', image: '🧄', category: '调味', description: '新鲜大蒜，辛香浓郁' },
  { id: 'ginger', name: '生姜', price: 9.0, unit: '500g', image: '🫚', category: '调味', description: '老姜，姜味浓郁' },
  { id: 'rice', name: '大米', price: 28.0, unit: '2kg', image: '🍚', category: '主食', description: '东北大米，香糯可口' },
  { id: 'noodle', name: '面条', price: 8.0, unit: '500g', image: '🍜', category: '主食', description: '手工挂面，劲道爽滑' },
  { id: 'spinach', name: '菠菜', price: 6.0, unit: '500g', image: '🥬', category: '蔬菜', description: '新鲜菠菜，翠绿鲜嫩' },
  { id: 'cabbage', name: '白菜', price: 3.8, unit: '一颗', image: '🥗', category: '蔬菜', description: '大白菜，清甜爽口' },
  { id: 'pepper', name: '青椒', price: 7.0, unit: '500g', image: '🫑', category: '蔬菜', description: '新鲜青椒，微辣脆嫩' },
];

export const RECIPE_COMBOS: RecipeCombo[] = [
  {
    id: 'tomato-egg',
    name: '番茄炒蛋套餐',
    description: '经典家常菜，酸甜开胃，新手必学',
    ingredients: [
      { itemId: 'tomato', quantity: 2 },
      { itemId: 'egg', quantity: 1 },
      { itemId: 'green-onion', quantity: 1 },
    ],
    totalPrice: 22.5,
    originalPrice: 28.0,
    image: '🍳',
    cuisine: '家常菜',
    difficulty: 1,
    cookTime: '15分钟',
  },
  {
    id: 'kung-pao-chicken',
    name: '宫保鸡丁套餐',
    description: '川菜经典，麻辣鲜香，下饭神器',
    ingredients: [
      { itemId: 'chicken-breast', quantity: 1 },
      { itemId: 'pepper', quantity: 1 },
      { itemId: 'garlic', quantity: 1 },
      { itemId: 'ginger', quantity: 1 },
    ],
    totalPrice: 37.5,
    originalPrice: 45.0,
    image: '🌶️',
    cuisine: '川菜',
    difficulty: 3,
    cookTime: '25分钟',
  },
  {
    id: 'mapo-tofu',
    name: '麻婆豆腐套餐',
    description: '麻辣鲜香，嫩滑入味，川菜代表',
    ingredients: [
      { itemId: 'tofu', quantity: 2 },
      { itemId: 'pork', quantity: 1 },
      { itemId: 'garlic', quantity: 1 },
      { itemId: 'ginger', quantity: 1 },
      { itemId: 'green-onion', quantity: 1 },
    ],
    totalPrice: 45.5,
    originalPrice: 55.0,
    image: '🥘',
    cuisine: '川菜',
    difficulty: 2,
    cookTime: '20分钟',
  },
  {
    id: 'steamed-fish',
    name: '清蒸鲈鱼套餐',
    description: '粤式经典，鲜嫩清淡，健康美味',
    ingredients: [
      { itemId: 'fish', quantity: 1 },
      { itemId: 'green-onion', quantity: 2 },
      { itemId: 'ginger', quantity: 1 },
    ],
    totalPrice: 48.5,
    originalPrice: 58.0,
    image: '🐠',
    cuisine: '粤菜',
    difficulty: 2,
    cookTime: '20分钟',
  },
  {
    id: 'beef-noodle',
    name: '红烧牛肉面套餐',
    description: '汤浓肉香，面条劲道，一碗满足',
    ingredients: [
      { itemId: 'beef', quantity: 1 },
      { itemId: 'noodle', quantity: 1 },
      { itemId: 'carrot', quantity: 1 },
      { itemId: 'potato', quantity: 1 },
    ],
    totalPrice: 76.0,
    originalPrice: 92.0,
    image: '🍲',
    cuisine: '家常菜',
    difficulty: 3,
    cookTime: '60分钟',
  },
  {
    id: 'shrimp-fried-rice',
    name: '虾仁炒饭套餐',
    description: '粒粒分明，鲜香可口，快手主食',
    ingredients: [
      { itemId: 'shrimp', quantity: 1 },
      { itemId: 'rice', quantity: 1 },
      { itemId: 'egg', quantity: 1 },
      { itemId: 'carrot', quantity: 1 },
      { itemId: 'green-onion', quantity: 1 },
    ],
    totalPrice: 72.9,
    originalPrice: 88.0,
    image: '🍛',
    cuisine: '家常菜',
    difficulty: 2,
    cookTime: '20分钟',
  },
  {
    id: 'vegetable-stir-fry',
    name: '时蔬拼盘套餐',
    description: '清爽健康，营养均衡，素食首选',
    ingredients: [
      { itemId: 'spinach', quantity: 1 },
      { itemId: 'mushroom', quantity: 1 },
      { itemId: 'cucumber', quantity: 1 },
      { itemId: 'garlic', quantity: 1 },
    ],
    totalPrice: 29.5,
    originalPrice: 36.0,
    image: '🥗',
    cuisine: '素菜',
    difficulty: 1,
    cookTime: '15分钟',
  },
  {
    id: 'potato-beef',
    name: '土豆炖牛肉套餐',
    description: '软烂入味，汤汁浓郁，下饭一绝',
    ingredients: [
      { itemId: 'beef', quantity: 1 },
      { itemId: 'potato', quantity: 2 },
      { itemId: 'carrot', quantity: 1 },
      { itemId: 'garlic', quantity: 1 },
      { itemId: 'ginger', quantity: 1 },
    ],
    totalPrice: 79.8,
    originalPrice: 96.0,
    image: '🥘',
    cuisine: '家常菜',
    difficulty: 3,
    cookTime: '90分钟',
  },
  {
    id: 'sweet-sour-pork',
    name: '糖醋里脊套餐',
    description: '酸甜可口，外酥里嫩，老少皆宜',
    ingredients: [
      { itemId: 'pork', quantity: 1 },
      { itemId: 'egg', quantity: 1 },
      { itemId: 'tomato', quantity: 1 },
      { itemId: 'garlic', quantity: 1 },
    ],
    totalPrice: 51.7,
    originalPrice: 62.0,
    image: '🍖',
    cuisine: '家常菜',
    difficulty: 3,
    cookTime: '30分钟',
  },
  {
    id: 'hunan-pork',
    name: '小炒肉套餐',
    description: '湘菜经典，香辣过瘾，超级下饭',
    ingredients: [
      { itemId: 'pork', quantity: 1 },
      { itemId: 'pepper', quantity: 2 },
      { itemId: 'garlic', quantity: 1 },
      { itemId: 'ginger', quantity: 1 },
    ],
    totalPrice: 48.5,
    originalPrice: 58.0,
    image: '🥓',
    cuisine: '湘菜',
    difficulty: 2,
    cookTime: '20分钟',
  },
  {
    id: 'northeast-sauerkraut',
    name: '酸菜白肉套餐',
    description: '东北名菜，酸爽开胃，汤鲜肉嫩',
    ingredients: [
      { itemId: 'pork', quantity: 1 },
      { itemId: 'cabbage', quantity: 1 },
      { itemId: 'noodle', quantity: 1 },
      { itemId: 'ginger', quantity: 1 },
    ],
    totalPrice: 47.3,
    originalPrice: 57.0,
    image: '🍜',
    cuisine: '东北菜',
    difficulty: 2,
    cookTime: '40分钟',
  },
  {
    id: 'chicken-mushroom',
    name: '香菇滑鸡套餐',
    description: '粤式风味，嫩滑鲜香，营养丰富',
    ingredients: [
      { itemId: 'chicken-breast', quantity: 1 },
      { itemId: 'mushroom', quantity: 2 },
      { itemId: 'green-onion', quantity: 1 },
      { itemId: 'ginger', quantity: 1 },
    ],
    totalPrice: 45.8,
    originalPrice: 55.0,
    image: '🍗',
    cuisine: '粤菜',
    difficulty: 2,
    cookTime: '25分钟',
  },
  {
    id: 'egg-drop-soup',
    name: '番茄蛋汤套餐',
    description: '简单快手，营养暖胃，家常必备',
    ingredients: [
      { itemId: 'tomato', quantity: 2 },
      { itemId: 'egg', quantity: 2 },
      { itemId: 'green-onion', quantity: 1 },
    ],
    totalPrice: 26.0,
    originalPrice: 32.0,
    image: '🍲',
    cuisine: '汤品',
    difficulty: 1,
    cookTime: '10分钟',
  },
  {
    id: 'mushroom-tofu',
    name: '香菇豆腐套餐',
    description: '素菜经典，鲜嫩多汁，健康美味',
    ingredients: [
      { itemId: 'tofu', quantity: 2 },
      { itemId: 'mushroom', quantity: 2 },
      { itemId: 'green-onion', quantity: 1 },
      { itemId: 'garlic', quantity: 1 },
    ],
    totalPrice: 34.0,
    originalPrice: 42.0,
    image: '🍲',
    cuisine: '素菜',
    difficulty: 2,
    cookTime: '20分钟',
  },
];

export function getIngredientById(id: string): IngredientItem | undefined {
  return INGREDIENTS.find(item => item.id === id);
}

export function getCombosByCuisine(cuisine: string): RecipeCombo[] {
  if (cuisine === 'all') return RECIPE_COMBOS;
  return RECIPE_COMBOS.filter(combo => combo.cuisine === cuisine);
}

export function generateComboFromRecipe(recipeName: string, ingredients: string[]): RecipeCombo {
  const matchedItems = ingredients.map(ing => {
    const matched = INGREDIENTS.find(i => 
      ing.includes(i.name) || i.name.includes(ing)
    );
    return matched ? { itemId: matched.id, quantity: 1 } : null;
  }).filter(Boolean) as { itemId: string; quantity: number }[];

  const totalPrice = matchedItems.reduce((sum, item) => {
    const ingredient = getIngredientById(item.itemId);
    return sum + (ingredient?.price || 0) * item.quantity;
  }, 0);

  return {
    id: `custom-${Date.now()}`,
    name: `${recipeName}食材包`,
    description: 'AI智能推荐食材组合，新鲜直达',
    ingredients: matchedItems.length > 0 ? matchedItems : [{ itemId: 'tomato', quantity: 1 }, { itemId: 'egg', quantity: 1 }],
    totalPrice: Math.round(totalPrice * 0.9 * 10) / 10,
    originalPrice: Math.round(totalPrice * 10) / 10,
    image: '🥡',
    cuisine: '家常菜',
    difficulty: 2,
    cookTime: '约30分钟',
  };
}

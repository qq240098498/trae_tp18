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

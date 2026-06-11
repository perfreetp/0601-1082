export interface FoodItem {
  id: string;
  name: string;
  imageUrl: string;
  carbs: number;
  calories: number;
  protein: number;
  fat: number;
  portion: number;
  unit: string;
  cookingMethod: string;
  giIndex?: number;
}

export interface RecognitionResult {
  foods: FoodItem[];
  totalCarbs: number;
  totalCalories: number;
  confidence: number;
}

export interface MealRecord {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  time: string;
  foods: FoodItem[];
  totalCarbs: number;
  totalCalories: number;
}

export interface SuggestionItem {
  id: string;
  type: 'substitute' | 'order' | 'snack' | 'tip';
  title: string;
  description: string;
  icon: string;
}

export interface DayMenu {
  date: string;
  breakfast: FoodItem[];
  lunch: FoodItem[];
  dinner: FoodItem[];
  snack: FoodItem[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  category: string;
}

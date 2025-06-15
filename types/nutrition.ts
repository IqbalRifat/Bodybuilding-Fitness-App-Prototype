export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  servingOptions: ServingOption[];
  micronutrients?: Micronutrients;
  isCustom?: boolean;
}

export interface Micronutrients {
  vitaminA?: number; // in mcg
  vitaminC?: number; // in mg
  vitaminD?: number; // in mcg
  vitaminE?: number; // in mg
  vitaminK?: number; // in mcg
  thiamin?: number; // in mg
  riboflavin?: number; // in mg
  niacin?: number; // in mg
  vitaminB6?: number; // in mg
  folate?: number; // in mcg
  vitaminB12?: number; // in mcg
  calcium?: number; // in mg
  iron?: number; // in mg
  magnesium?: number; // in mg
  phosphorus?: number; // in mg
  potassium?: number; // in mg
  sodium?: number; // in mg
  zinc?: number; // in mg
  copper?: number; // in mg
  manganese?: number; // in mg
  selenium?: number; // in mcg
  cholesterol?: number; // in mg
  fiber?: number; // in g
}

export interface ServingOption {
  name: string;
  multiplier: number;
}

export interface MealEntry {
  id: string;
  foodItemId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  servingAmount: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  micronutrients?: Micronutrients;
}

export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  timeOfDay: string;
  taken: boolean;
  date: string;
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
}

export interface NutritionSettings {
  includeBurnedCalories: boolean;
  trackMicronutrients: boolean;
}
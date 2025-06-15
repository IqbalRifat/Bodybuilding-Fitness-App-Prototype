import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealEntry, Supplement, WeightEntry, FoodItem, NutritionSettings } from '@/types/nutrition';
import { foodItems } from '@/mocks/food-items';
import { supplements } from '@/mocks/supplements';

interface NutritionState {
  mealEntries: MealEntry[];
  supplements: Supplement[];
  weightEntries: WeightEntry[];
  customFoodItems: FoodItem[];
  customSupplements: Supplement[];
  settings: NutritionSettings;
  
  // Settings
  updateSettings: (settings: Partial<NutritionSettings>) => void;
  
  // Food items
  addFoodItem: (item: FoodItem) => void;
  updateFoodItem: (item: FoodItem) => void;
  removeFoodItem: (id: string) => void;
  getAllFoodItems: () => FoodItem[];
  getFoodItemById: (id: string) => FoodItem | undefined;
  
  // Meal entries
  addMealEntry: (entry: MealEntry) => void;
  removeMealEntry: (id: string) => void;
  getMealEntriesByDate: (date: string) => MealEntry[];
  getMealEntriesByType: (date: string, type: MealEntry['mealType']) => MealEntry[];
  
  // Supplements
  toggleSupplement: (id: string) => void;
  addSupplement: (supplement: Supplement) => void;
  removeSupplement: (id: string) => void;
  updateSupplement: (supplement: Supplement) => void;
  getSupplementsByDate: (date: string) => Supplement[];
  getAllSupplements: () => Supplement[];
  
  // Weight entries
  addWeightEntry: (entry: WeightEntry) => void;
  removeWeightEntry: (id: string) => void;
  getLatestWeight: () => number | null;
  getWeightEntries: () => WeightEntry[];
  getNormalizedWeightData: () => { date: string; weight: number; normalized: number }[];
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      mealEntries: [],
      supplements: [...supplements], // Initialize with mock data
      weightEntries: [],
      customFoodItems: [],
      customSupplements: [],
      settings: {
        includeBurnedCalories: false,
        trackMicronutrients: false,
      },
      
      // Settings
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      // Food items
      addFoodItem: (item) => set((state) => ({
        customFoodItems: [...state.customFoodItems, { ...item, isCustom: true }]
      })),
      
      updateFoodItem: (item) => set((state) => ({
        customFoodItems: state.customFoodItems.map(food => 
          food.id === item.id ? { ...item, isCustom: true } : food
        )
      })),
      
      removeFoodItem: (id) => set((state) => ({
        customFoodItems: state.customFoodItems.filter(item => item.id !== id)
      })),
      
      getAllFoodItems: () => {
        const { customFoodItems } = get();
        return [...foodItems, ...customFoodItems];
      },
      
      getFoodItemById: (id) => {
        const allItems = get().getAllFoodItems();
        return allItems.find(item => item.id === id);
      },
      
      // Meal entries
      addMealEntry: (entry) => set((state) => ({
        mealEntries: [...state.mealEntries, entry]
      })),
      
      removeMealEntry: (id) => set((state) => ({
        mealEntries: state.mealEntries.filter(entry => entry.id !== id)
      })),
      
      getMealEntriesByDate: (date) => {
        const { mealEntries } = get();
        return mealEntries.filter(entry => entry.date === date);
      },
      
      getMealEntriesByType: (date, type) => {
        const { mealEntries } = get();
        return mealEntries.filter(entry => entry.date === date && entry.mealType === type);
      },
      
      // Supplements
      toggleSupplement: (id) => set((state) => ({
        supplements: state.supplements.map(supp => 
          supp.id === id ? { ...supp, taken: !supp.taken } : supp
        )
      })),
      
      addSupplement: (supplement) => set((state) => ({
        supplements: [...state.supplements, supplement]
      })),
      
      removeSupplement: (id) => set((state) => ({
        supplements: state.supplements.filter(supp => supp.id !== id)
      })),
      
      updateSupplement: (supplement) => set((state) => ({
        supplements: state.supplements.map(supp => 
          supp.id === supplement.id ? { ...supplement } : supp
        )
      })),
      
      getSupplementsByDate: (date) => {
        const { supplements } = get();
        return supplements.filter(supp => supp.date === date);
      },
      
      getAllSupplements: () => {
        const { supplements, customSupplements } = get();
        return [...supplements, ...customSupplements];
      },
      
      // Weight entries
      addWeightEntry: (entry) => set((state) => ({
        weightEntries: [...state.weightEntries, entry]
      })),
      
      removeWeightEntry: (id) => set((state) => ({
        weightEntries: state.weightEntries.filter(entry => entry.id !== id)
      })),
      
      getLatestWeight: () => {
        const { weightEntries } = get();
        if (weightEntries.length === 0) return null;
        
        return weightEntries.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0].weight;
      },
      
      getWeightEntries: () => {
        const { weightEntries } = get();
        return weightEntries.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      },
      
      getNormalizedWeightData: () => {
        const entries = get().getWeightEntries();
        if (entries.length === 0) return [];
        
        // Find min and max for normalization
        const weights = entries.map(e => e.weight);
        const minWeight = Math.min(...weights);
        const maxWeight = Math.max(...weights);
        const range = maxWeight - minWeight;
        
        // Normalize to 0-1 range
        return entries.map(entry => ({
          date: entry.date,
          weight: entry.weight,
          normalized: range === 0 ? 0.5 : (entry.weight - minWeight) / range
        }));
      },
    }),
    {
      name: 'nutrition-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
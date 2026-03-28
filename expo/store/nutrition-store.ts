import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealEntry, Supplement, WeightEntry, FoodItem, NutritionSettings } from '@/types/nutrition';
import { foodItems } from '@/mocks/food-items';
import { supplements } from '@/mocks/supplements';
import { nutritionAPI, foodAPI, FoodItem as SupabaseFoodItem, NutritionEntry } from '@/lib/api';
import { fatSecretAPI } from '@/lib/fatsecret';

interface NutritionState {
  mealEntries: MealEntry[];
  nutritionEntries: NutritionEntry[];
  supplements: Supplement[];
  weightEntries: WeightEntry[];
  customFoodItems: FoodItem[];
  customSupplements: Supplement[];
  settings: NutritionSettings;
  
  // Settings
  updateSettings: (settings: Partial<NutritionSettings>) => void;
  
  // Food items
  searchFoodItems: (query: string) => Promise<FoodItem[]>;
  addFoodItem: (item: FoodItem) => void;
  updateFoodItem: (item: FoodItem) => void;
  removeFoodItem: (id: string) => void;
  getAllFoodItems: () => FoodItem[];
  getFoodItemById: (id: string) => FoodItem | undefined;
  
  // Nutrition entries (Supabase)
  loadNutritionEntries: (date: string) => Promise<void>;
  addNutritionEntry: (entry: Omit<NutritionEntry, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  removeNutritionEntry: (id: string) => Promise<void>;
  
  // Meal entries (legacy)
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
      nutritionEntries: [],
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
      searchFoodItems: async (query) => {
        try {
          // Initialize FatSecret API
          await fatSecretAPI.initialize();
          
          // Search both local database and FatSecret
          const [localResults, fatSecretResults] = await Promise.all([
            foodAPI.search(query),
            fatSecretAPI.isConfigured() ? fatSecretAPI.searchFoods(query) : Promise.resolve([])
          ]);

          // Convert Supabase results to FoodItem format
          const convertedLocal: FoodItem[] = localResults.map(item => ({
            id: item.id,
            name: item.name,
            brand: item.brand,
            calories: item.calories_per_100g,
            protein: item.protein_per_100g,
            carbs: item.carbs_per_100g,
            fat: item.fat_per_100g,
            fiber: item.fiber_per_100g || 0,
            sugar: item.sugar_per_100g || 0,
            sodium: item.sodium_per_100g || 0,
            isCustom: false,
          }));

          // Convert FatSecret results to FoodItem format
          const convertedFatSecret: FoodItem[] = fatSecretResults.map(item => ({
            id: item.id,
            name: item.name,
            brand: item.brand,
            calories: item.calories_per_100g,
            protein: item.protein_per_100g,
            carbs: item.carbs_per_100g,
            fat: item.fat_per_100g,
            fiber: item.fiber_per_100g || 0,
            sugar: item.sugar_per_100g || 0,
            sodium: item.sodium_per_100g || 0,
            isCustom: false,
          }));

          return [...convertedLocal, ...convertedFatSecret];
        } catch (error) {
          console.error('Error searching food items:', error);
          // Fallback to local mock data
          const { customFoodItems } = get();
          return [...foodItems, ...customFoodItems].filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            (item.brand && item.brand.toLowerCase().includes(query.toLowerCase()))
          );
        }
      },


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

      // Nutrition entries (Supabase)
      loadNutritionEntries: async (date) => {
        try {
          const entries = await nutritionAPI.getByDate(date);
          set({ nutritionEntries: entries });
        } catch (error) {
          console.error('Error loading nutrition entries:', error);
        }
      },

      addNutritionEntry: async (entry) => {
        try {
          const newEntry = await nutritionAPI.add(entry);
          set((state) => ({
            nutritionEntries: [...state.nutritionEntries, newEntry]
          }));
        } catch (error) {
          console.error('Error adding nutrition entry:', error);
          throw error;
        }
      },

      removeNutritionEntry: async (id) => {
        try {
          await nutritionAPI.delete(id);
          set((state) => ({
            nutritionEntries: state.nutritionEntries.filter(entry => entry.id !== id)
          }));
        } catch (error) {
          console.error('Error removing nutrition entry:', error);
          throw error;
        }
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
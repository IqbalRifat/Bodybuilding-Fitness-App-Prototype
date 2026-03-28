import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, DailyStats } from '@/types/user';
import { profileAPI, weightAPI, Profile, WeightEntry } from '@/lib/api';

interface UserState {
  profile: UserProfile | null;
  supabaseProfile: Profile | null;
  weightEntries: WeightEntry[];
  dailyStats: DailyStats | null;
  isOnboarded: boolean;
  isAuthenticated: boolean;
  setProfile: (profile: UserProfile) => void;
  loadSupabaseProfile: () => Promise<void>;
  updateSupabaseProfile: (updates: Partial<Profile>) => Promise<void>;
  loadWeightEntries: () => Promise<void>;
  addWeightEntry: (weight: number, date: string) => Promise<void>;
  updateWeight: (weight: number) => void;
  updateDailyStats: (stats: Partial<DailyStats>) => void;
  setOnboarded: (value: boolean) => void;
  setAuthenticated: (value: boolean) => void;
  toggleUnit: (type: 'height' | 'weight') => void;
  calculateCalorieGoals: () => void;
  addCaloriesBurned: (calories: number) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      supabaseProfile: null,
      weightEntries: [],
      dailyStats: null,
      isOnboarded: false,
      isAuthenticated: false,
      
      setProfile: (profile) => {
        set({ profile });
        // Calculate calorie goals when profile is set
        setTimeout(() => get().calculateCalorieGoals(), 0);
      },

      loadSupabaseProfile: async () => {
        try {
          const profile = await profileAPI.get();
          set({ supabaseProfile: profile });
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      },

      updateSupabaseProfile: async (updates) => {
        try {
          const updatedProfile = await profileAPI.update(updates);
          set({ supabaseProfile: updatedProfile });
        } catch (error) {
          console.error('Error updating profile:', error);
          throw error;
        }
      },

      loadWeightEntries: async () => {
        try {
          const entries = await weightAPI.getAll();
          set({ weightEntries: entries });
        } catch (error) {
          console.error('Error loading weight entries:', error);
        }
      },

      addWeightEntry: async (weight, date) => {
        try {
          const entry = await weightAPI.add({ weight_kg: weight, date });
          set((state) => ({
            weightEntries: [entry, ...state.weightEntries]
          }));
        } catch (error) {
          console.error('Error adding weight entry:', error);
          throw error;
        }
      },
      
      updateWeight: (weight) => set((state) => {
        if (!state.profile) return { profile: null };
        
        const updatedProfile = {
          ...state.profile,
          currentWeight: weight
        };
        
        return { profile: updatedProfile };
      }),
      
      updateDailyStats: (stats) => set((state) => ({
        dailyStats: state.dailyStats ? { ...state.dailyStats, ...stats } : null
      })),
      
      setOnboarded: (value) => set({ isOnboarded: value }),
      
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      
      toggleUnit: (type) => set((state) => {
        if (!state.profile) return { profile: null };
        
        if (type === 'height') {
          const currentUnit = state.profile.heightUnit;
          const newUnit = currentUnit === 'cm' ? 'in' : 'cm';
          let newHeight = state.profile.height;
          
          // Convert the height value
          if (newUnit === 'in') {
            newHeight = Math.round(newHeight / 2.54);
          } else {
            newHeight = Math.round(newHeight * 2.54);
          }
          
          const updatedProfile = {
            ...state.profile,
            heightUnit: newUnit as 'cm' | 'in',
            height: newHeight
          };
          
          return { profile: updatedProfile };
        } else {
          const currentUnit = state.profile.weightUnit;
          const newUnit = currentUnit === 'kg' ? 'lb' : 'kg';
          let newCurrentWeight = state.profile.currentWeight;
          let newGoalWeight = state.profile.goalWeight;
          
          // Convert the weight values
          if (newUnit === 'lb') {
            newCurrentWeight = Math.round(newCurrentWeight * 2.20462);
            newGoalWeight = Math.round(newGoalWeight * 2.20462);
          } else {
            newCurrentWeight = Math.round(newCurrentWeight / 2.20462);
            newGoalWeight = Math.round(newGoalWeight / 2.20462);
          }
          
          const updatedProfile = {
            ...state.profile,
            weightUnit: newUnit as 'kg' | 'lb',
            currentWeight: newCurrentWeight,
            goalWeight: newGoalWeight
          };
          
          return { profile: updatedProfile };
        }
      }),
      
      calculateCalorieGoals: () => set((state) => {
        if (!state.profile) return { profile: null };
        
        const { 
          gender, 
          age, 
          currentWeight, 
          weightUnit, 
          height, 
          heightUnit, 
          fitnessGoal, 
          trainingDaysPerWeek, 
          experienceLevel,
          activityLevel
        } = state.profile;
        
        // Convert to metric for calculations if needed
        const weightInKg = weightUnit === 'kg' ? currentWeight : currentWeight / 2.20462;
        const heightInCm = heightUnit === 'cm' ? height : height * 2.54;
        
        // Basic BMR calculation (Mifflin-St Jeor)
        let bmr = 0;
        if (gender === 'male') {
          bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5;
        } else {
          bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age - 161;
        }
        
        // Activity multiplier based on activity level and training days
        let activityMultiplier = 1.2; // Sedentary
        
        if (activityLevel === 'very_active') {
          activityMultiplier = 1.725;
        } else if (activityLevel === 'moderately_active') {
          activityMultiplier = 1.55;
        } else if (activityLevel === 'lightly_active') {
          activityMultiplier = 1.375;
        }
        
        // Add additional activity for training days
        const trainingBonus = trainingDaysPerWeek * 0.05;
        activityMultiplier += trainingBonus;
        
        // TDEE (Total Daily Energy Expenditure)
        let tdee = bmr * activityMultiplier;
        
        // Adjust based on fitness goal
        let calorieGoal = tdee;
        if (fitnessGoal === 'muscle_gain') {
          // Adjust surplus based on experience level
          const surplus = experienceLevel === 'beginner' ? 500 : 
                          experienceLevel === 'intermediate' ? 350 : 250;
          calorieGoal = tdee + surplus;
        } else if (fitnessGoal === 'fat_loss') {
          // Adjust deficit based on experience level
          const deficit = experienceLevel === 'beginner' ? 500 : 
                          experienceLevel === 'intermediate' ? 400 : 300;
          calorieGoal = tdee - deficit;
        } else if (fitnessGoal === 'competition_prep') {
          calorieGoal = tdee - 700; // Larger deficit for competition prep
        }
        
        // Calculate macros
        // Protein: 2g per kg of bodyweight for muscle gain, 2.2g for fat loss/competition
        let proteinGoal = 0;
        if (fitnessGoal === 'muscle_gain') {
          proteinGoal = weightInKg * 2;
        } else if (fitnessGoal === 'fat_loss' || fitnessGoal === 'competition_prep') {
          proteinGoal = weightInKg * 2.2;
        } else {
          proteinGoal = weightInKg * 1.8; // Maintenance
        }
        
        // Fat: 25% of calories
        const fatGoal = Math.round((calorieGoal * 0.25) / 9);
        
        // Carbs: Remaining calories
        const carbsGoal = Math.round((calorieGoal - (proteinGoal * 4) - (fatGoal * 9)) / 4);
        
        const updatedProfile = {
          ...state.profile,
          calorieGoal: Math.round(calorieGoal),
          proteinGoal: Math.round(proteinGoal),
          carbsGoal,
          fatGoal
        };
        
        return { profile: updatedProfile };
      }),
      
      addCaloriesBurned: (calories) => set((state) => {
        if (!state.dailyStats) {
          const today = new Date().toISOString().split('T')[0];
          return {
            dailyStats: {
              date: today,
              caloriesConsumed: 0,
              caloriesGoal: state.profile?.calorieGoal || 2500,
              proteinConsumed: 0,
              proteinGoal: state.profile?.proteinGoal || 150,
              carbsConsumed: 0,
              carbsGoal: state.profile?.carbsGoal || 300,
              fatConsumed: 0,
              fatGoal: state.profile?.fatGoal || 70,
              waterConsumed: 0,
              waterGoal: 8,
              workoutCompleted: true,
              caloriesBurned: calories
            }
          };
        }
        
        return {
          dailyStats: {
            ...state.dailyStats,
            caloriesBurned: (state.dailyStats.caloriesBurned || 0) + calories,
            workoutCompleted: true
          }
        };
      }),
      
      logout: () => set({ 
        profile: null, 
        isAuthenticated: false,
        dailyStats: null
      }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
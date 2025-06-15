import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, DailyStats } from '@/types/user';

interface UserState {
  profile: UserProfile | null;
  dailyStats: DailyStats | null;
  isOnboarded: boolean;
  isAuthenticated: boolean;
  setProfile: (profile: UserProfile) => void;
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
      dailyStats: null,
      isOnboarded: false,
      isAuthenticated: false,
      
      setProfile: (profile) => set({ profile }),
      
      updateWeight: (weight) => set((state) => ({
        profile: state.profile ? { ...state.profile, currentWeight: weight } : null
      })),
      
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
          
          return {
            profile: {
              ...state.profile,
              heightUnit: newUnit,
              height: newHeight
            }
          };
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
          
          return {
            profile: {
              ...state.profile,
              weightUnit: newUnit,
              currentWeight: newCurrentWeight,
              goalWeight: newGoalWeight
            }
          };
        }
      }),
      
      calculateCalorieGoals: () => set((state) => {
        if (!state.profile) return { profile: null };
        
        const { currentWeight, weightUnit, height, heightUnit, fitnessGoal, trainingDaysPerWeek, experienceLevel } = state.profile;
        
        // Convert to metric for calculations if needed
        const weightInKg = weightUnit === 'kg' ? currentWeight : currentWeight / 2.20462;
        const heightInCm = heightUnit === 'cm' ? height : height * 2.54;
        
        // Basic BMR calculation (Mifflin-St Jeor)
        // For simplicity, assuming 30 years old male
        const bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * 30 + 5;
        
        // Activity multiplier based on training days
        let activityMultiplier = 1.2; // Sedentary
        if (trainingDaysPerWeek >= 5) {
          activityMultiplier = 1.725; // Very active
        } else if (trainingDaysPerWeek >= 3) {
          activityMultiplier = 1.55; // Moderately active
        } else if (trainingDaysPerWeek >= 1) {
          activityMultiplier = 1.375; // Lightly active
        }
        
        // TDEE (Total Daily Energy Expenditure)
        let tdee = bmr * activityMultiplier;
        
        // Adjust based on fitness goal
        let calorieGoal = tdee;
        if (fitnessGoal === 'muscle_gain') {
          calorieGoal = tdee + 500; // Surplus for muscle gain
        } else if (fitnessGoal === 'fat_loss') {
          calorieGoal = tdee - 500; // Deficit for fat loss
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
        
        return {
          profile: {
            ...state.profile,
            calorieGoal: Math.round(calorieGoal),
            proteinGoal: Math.round(proteinGoal),
            carbsGoal,
            fatGoal
          }
        };
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
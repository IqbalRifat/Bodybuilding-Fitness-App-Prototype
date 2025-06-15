export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  height: number;
  heightUnit: 'cm' | 'in';
  currentWeight: number;
  weightUnit: 'kg' | 'lb';
  goalWeight: number;
  fitnessGoal: 'muscle_gain' | 'fat_loss' | 'maintenance' | 'competition_prep';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  trainingDaysPerWeek: number;
  competitionDate?: string;
  injuries?: string[];
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export interface DailyStats {
  date: string;
  caloriesConsumed: number;
  caloriesGoal: number;
  proteinConsumed: number;
  proteinGoal: number;
  carbsConsumed: number;
  carbsGoal: number;
  fatConsumed: number;
  fatGoal: number;
  waterConsumed: number;
  waterGoal: number;
  workoutCompleted: boolean;
  caloriesBurned: number;
}
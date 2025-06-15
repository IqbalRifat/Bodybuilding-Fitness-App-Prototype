export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: string[];
  description: string;
  instructions: string;
  type: 'strength' | 'cardio';
  caloriesBurnedPerMinute?: number;
  isCustom?: boolean;
}

export interface Set {
  id: string;
  weight: number;
  reps: number;
  isCompleted: boolean;
}

export interface CardioSet {
  id: string;
  distance?: number;
  duration: number; // in minutes
  intensity?: 'low' | 'medium' | 'high';
  isCompleted: boolean;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseType: 'strength' | 'cardio';
  sets: Set[] | CardioSet[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  exercises: ExerciseLog[];
  notes: string;
  duration: number; // in minutes
  isCompleted: boolean;
  caloriesBurned: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  isCustom: boolean;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    exerciseType: 'strength' | 'cardio';
    targetSets: number;
    targetReps?: number;
    targetDuration?: number;
  }[];
}

export interface ExerciseProgress {
  exerciseId: string;
  date: string;
  maxWeight: number;
  totalVolume: number; // weight * reps * sets
}
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession, WorkoutTemplate, ExerciseLog, Exercise, CardioSet, Set, ExerciseProgress } from '@/types/workout';
import { exercises } from '@/mocks/exercises';
import { workoutTemplates } from '@/mocks/workout-templates';
import { useUserStore } from './user-store';

interface WorkoutState {
  workoutSessions: WorkoutSession[];
  workoutTemplates: WorkoutTemplate[];
  customExercises: Exercise[];
  exerciseProgress: ExerciseProgress[];
  
  // Exercises
  getAllExercises: () => Exercise[];
  getExercisesByMuscleGroup: (muscleGroup: string) => Exercise[];
  getExercisesByType: (type: 'strength' | 'cardio') => Exercise[];
  addCustomExercise: (exercise: Exercise) => void;
  updateExercise: (exercise: Exercise) => void;
  removeExercise: (id: string) => void;
  
  // Workout templates
  addWorkoutTemplate: (template: WorkoutTemplate) => void;
  updateWorkoutTemplate: (template: WorkoutTemplate) => void;
  removeWorkoutTemplate: (id: string) => void;
  getAllWorkoutTemplates: () => WorkoutTemplate[];
  getUserCreatedTemplates: () => WorkoutTemplate[];
  
  // Workout sessions
  startWorkoutSession: (template: WorkoutTemplate) => WorkoutSession;
  updateWorkoutSession: (session: WorkoutSession) => void;
  completeWorkoutSession: (id: string, duration: number) => void;
  removeWorkoutSession: (id: string) => void;
  getWorkoutSessionsByDate: (date: string) => WorkoutSession[];
  getRecentWorkoutSessions: (limit?: number) => WorkoutSession[];
  calculateCaloriesBurned: (session: WorkoutSession) => number;
  
  // Exercise progress
  addExerciseProgress: (progress: ExerciseProgress) => void;
  getExerciseProgressById: (exerciseId: string) => ExerciseProgress[];
  getExerciseMaxWeight: (exerciseId: string) => Array<{ date: string; maxWeight: number }>;
  getExerciseTotalVolume: (exerciseId: string) => Array<{ date: string; totalVolume: number }>;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      workoutSessions: [],
      workoutTemplates: [...workoutTemplates], // Initialize with mock data
      customExercises: [],
      exerciseProgress: [],
      
      // Exercises
      getAllExercises: () => {
        const { customExercises } = get();
        return [...exercises, ...customExercises];
      },
      
      getExercisesByMuscleGroup: (muscleGroup) => {
        const allExercises = get().getAllExercises();
        return allExercises.filter(exercise => 
          exercise.muscleGroup.includes(muscleGroup)
        );
      },
      
      getExercisesByType: (type) => {
        const allExercises = get().getAllExercises();
        return allExercises.filter(exercise => exercise.type === type);
      },
      
      addCustomExercise: (exercise) => set((state) => ({
        customExercises: [...state.customExercises, { ...exercise, isCustom: true }]
      })),
      
      updateExercise: (exercise) => set((state) => ({
        customExercises: state.customExercises.map(ex => 
          ex.id === exercise.id ? { ...exercise, isCustom: true } : ex
        )
      })),
      
      removeExercise: (id) => set((state) => ({
        customExercises: state.customExercises.filter(ex => ex.id !== id)
      })),
      
      // Workout templates
      addWorkoutTemplate: (template) => set((state) => ({
        workoutTemplates: [...state.workoutTemplates, template]
      })),
      
      updateWorkoutTemplate: (template) => set((state) => ({
        workoutTemplates: state.workoutTemplates.map(t => 
          t.id === template.id ? template : t
        )
      })),
      
      removeWorkoutTemplate: (id) => set((state) => ({
        workoutTemplates: state.workoutTemplates.filter(template => template.id !== id)
      })),
      
      getAllWorkoutTemplates: () => {
        const { workoutTemplates } = get();
        return workoutTemplates;
      },
      
      getUserCreatedTemplates: () => {
        const { workoutTemplates } = get();
        return workoutTemplates.filter(template => template.isCustom);
      },
      
      // Workout sessions
      startWorkoutSession: (template) => {
        const newSession: WorkoutSession = {
          id: Date.now().toString(),
          name: template.name,
          date: new Date().toISOString().split('T')[0],
          exercises: template.exercises.map(ex => {
            if (ex.exerciseType === 'strength') {
              // Start with just one set
              return {
                id: Date.now().toString() + ex.exerciseId,
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                exerciseType: 'strength',
                sets: [{
                  id: `${Date.now()}-${ex.exerciseId}-0`,
                  weight: 0,
                  reps: 0,
                  isCompleted: false,
                }] as Set[],
              };
            } else {
              return {
                id: Date.now().toString() + ex.exerciseId,
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                exerciseType: 'cardio',
                sets: [{
                  id: `${Date.now()}-${ex.exerciseId}-0`,
                  duration: ex.targetDuration || 30,
                  distance: 0,
                  intensity: 'medium',
                  isCompleted: false,
                }] as CardioSet[],
              };
            }
          }),
          notes: '',
          duration: 0,
          isCompleted: false,
          caloriesBurned: 0,
        };
        
        set((state) => ({
          workoutSessions: [...state.workoutSessions, newSession]
        }));
        
        return newSession;
      },
      
      updateWorkoutSession: (session) => set((state) => ({
        workoutSessions: state.workoutSessions.map(s => 
          s.id === session.id ? session : s
        )
      })),
      
      completeWorkoutSession: (id, duration) => {
        const { workoutSessions } = get();
        const session = workoutSessions.find(s => s.id === id);
        
        if (!session) return;
        
        const caloriesBurned = get().calculateCaloriesBurned({
          ...session,
          duration
        });
        
        const updatedSession = {
          ...session,
          isCompleted: true,
          duration,
          caloriesBurned
        };
        
        set((state) => ({
          workoutSessions: state.workoutSessions.map(session => 
            session.id === id ? updatedSession : session
          )
        }));
        
        // Record exercise progress
        updatedSession.exercises.forEach(exerciseLog => {
          if (exerciseLog.exerciseType === 'strength') {
            const sets = exerciseLog.sets as Set[];
            const completedSets = sets.filter(set => set.isCompleted);
            
            if (completedSets.length > 0) {
              const maxWeight = Math.max(...completedSets.map(set => set.weight));
              const totalVolume = completedSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
              
              if (maxWeight > 0) {
                get().addExerciseProgress({
                  exerciseId: exerciseLog.exerciseId,
                  date: updatedSession.date,
                  maxWeight,
                  totalVolume
                });
              }
            }
          }
        });
        
        // Update user's calories burned if setting is enabled
        const includeBurnedCalories = useNutritionStore.getState().settings.includeBurnedCalories;
        if (includeBurnedCalories) {
          useUserStore.getState().addCaloriesBurned(caloriesBurned);
        }
      },
      
      removeWorkoutSession: (id) => set((state) => ({
        workoutSessions: state.workoutSessions.filter(session => session.id !== id)
      })),
      
      getWorkoutSessionsByDate: (date) => {
        const { workoutSessions } = get();
        return workoutSessions.filter(session => session.date === date);
      },
      
      getRecentWorkoutSessions: (limit = 5) => {
        const { workoutSessions } = get();
        return [...workoutSessions]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit);
      },
      
      calculateCaloriesBurned: (session) => {
        let totalCalories = 0;
        
        // Get all exercises
        const allExercises = get().getAllExercises();
        
        session.exercises.forEach(exerciseLog => {
          const exercise = allExercises.find(e => e.id === exerciseLog.exerciseId);
          
          if (!exercise) return;
          
          if (exercise.type === 'cardio') {
            const cardioSets = exerciseLog.sets as CardioSet[];
            
            // Calculate calories based on duration and intensity
            cardioSets.forEach(set => {
              if (set.isCompleted) {
                const intensityMultiplier = set.intensity === 'high' ? 1.2 : 
                                           set.intensity === 'medium' ? 1 : 0.8;
                
                totalCalories += (exercise.caloriesBurnedPerMinute || 10) * 
                                set.duration * intensityMultiplier;
              }
            });
          } else {
            // For strength exercises, use a simple formula based on sets completed
            const strengthSets = exerciseLog.sets as Set[];
            const completedSets = strengthSets.filter(set => set.isCompleted);
            
            // Calculate based on volume (weight * reps)
            let volumeCalories = 0;
            completedSets.forEach(set => {
              volumeCalories += set.weight * set.reps * 0.075; // Rough estimate
            });
            
            totalCalories += volumeCalories;
          }
        });
        
        // Add base metabolic rate for the workout duration
        // Assuming 1.5 calories per minute of general activity
        totalCalories += session.duration * 1.5;
        
        return Math.round(totalCalories);
      },
      
      // Exercise progress
      addExerciseProgress: (progress) => set((state) => {
        // Check if we already have a progress entry for this exercise on this date
        const existingIndex = state.exerciseProgress.findIndex(
          p => p.exerciseId === progress.exerciseId && p.date === progress.date
        );
        
        if (existingIndex >= 0) {
          // Update existing entry if the new one has higher values
          const existing = state.exerciseProgress[existingIndex];
          const updated = {
            ...existing,
            maxWeight: Math.max(existing.maxWeight, progress.maxWeight),
            totalVolume: Math.max(existing.totalVolume, progress.totalVolume)
          };
          
          const newProgress = [...state.exerciseProgress];
          newProgress[existingIndex] = updated;
          
          return { exerciseProgress: newProgress };
        } else {
          // Add new entry
          return { exerciseProgress: [...state.exerciseProgress, progress] };
        }
      }),
      
      getExerciseProgressById: (exerciseId) => {
        const { exerciseProgress } = get();
        return exerciseProgress
          .filter(progress => progress.exerciseId === exerciseId)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },
      
      getExerciseMaxWeight: (exerciseId) => {
        const progress = get().getExerciseProgressById(exerciseId);
        return progress.map(p => ({
          date: p.date,
          maxWeight: p.maxWeight
        }));
      },
      
      getExerciseTotalVolume: (exerciseId) => {
        const progress = get().getExerciseProgressById(exerciseId);
        return progress.map(p => ({
          date: p.date,
          totalVolume: p.totalVolume
        }));
      },
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Import at the top of the file
import { useNutritionStore } from './nutrition-store';
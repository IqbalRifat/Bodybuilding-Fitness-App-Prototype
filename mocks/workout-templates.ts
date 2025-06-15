import { WorkoutTemplate } from '@/types/workout';

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: '1',
    name: 'Push Day',
    description: 'Focus on chest, shoulders, and triceps',
    isCustom: false,
    exercises: [
      {
        exerciseId: '1',
        exerciseName: 'Barbell Bench Press',
        exerciseType: 'strength',
        targetSets: 4,
        targetReps: 8,
      },
      {
        exerciseId: '5',
        exerciseName: 'Dumbbell Shoulder Press',
        exerciseType: 'strength',
        targetSets: 3,
        targetReps: 10,
      },
      {
        exerciseId: '8',
        exerciseName: 'Dumbbell Bicep Curl',
        exerciseType: 'strength',
        targetSets: 3,
        targetReps: 12,
      },
    ],
  },
  {
    id: '2',
    name: 'Pull Day',
    description: 'Focus on back and biceps',
    isCustom: false,
    exercises: [
      {
        exerciseId: '4',
        exerciseName: 'Pull-up',
        exerciseType: 'strength',
        targetSets: 4,
        targetReps: 8,
      },
      {
        exerciseId: '6',
        exerciseName: 'Barbell Row',
        exerciseType: 'strength',
        targetSets: 3,
        targetReps: 10,
      },
      {
        exerciseId: '8',
        exerciseName: 'Dumbbell Bicep Curl',
        exerciseType: 'strength',
        targetSets: 3,
        targetReps: 12,
      },
    ],
  },
  {
    id: '3',
    name: 'Leg Day',
    description: 'Focus on quadriceps, hamstrings, and glutes',
    isCustom: false,
    exercises: [
      {
        exerciseId: '2',
        exerciseName: 'Barbell Squat',
        exerciseType: 'strength',
        targetSets: 4,
        targetReps: 8,
      },
      {
        exerciseId: '3',
        exerciseName: 'Deadlift',
        exerciseType: 'strength',
        targetSets: 3,
        targetReps: 6,
      },
      {
        exerciseId: '7',
        exerciseName: 'Leg Press',
        exerciseType: 'strength',
        targetSets: 3,
        targetReps: 12,
      },
    ],
  },
  {
    id: '4',
    name: 'Cardio Session',
    description: 'Improve cardiovascular health and burn calories',
    isCustom: false,
    exercises: [
      {
        exerciseId: '9',
        exerciseName: 'Running',
        exerciseType: 'cardio',
        targetSets: 1,
        targetDuration: 30,
      },
      {
        exerciseId: '10',
        exerciseName: 'Cycling',
        exerciseType: 'cardio',
        targetSets: 1,
        targetDuration: 20,
      },
      {
        exerciseId: '12',
        exerciseName: 'Jump Rope',
        exerciseType: 'cardio',
        targetSets: 3,
        targetDuration: 5,
      },
    ],
  },
];
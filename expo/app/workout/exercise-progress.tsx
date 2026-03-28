import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { ExerciseProgressGraph } from '@/components/workout/ExerciseProgressGraph';
import Colors from '@/constants/colors';
import { useWorkoutStore } from '@/store/workout-store';

export default function ExerciseProgressScreen() {
  const router = useRouter();
  const getAllExercises = useWorkoutStore(state => state.getAllExercises);
  const getExerciseProgressById = useWorkoutStore(state => state.getExerciseProgressById);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const exercises = getAllExercises();
  
  // Filter exercises that have progress data and match search query
  const exercisesWithProgress = exercises.filter(exercise => {
    const hasProgress = getExerciseProgressById(exercise.id).length > 0;
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    return hasProgress && matchesSearch;
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise Progress</Text>
      <Text style={styles.subtitle}>Track your strength gains over time</Text>
      
      <Input
        placeholder="Search exercises..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        containerStyle={styles.searchInput}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {exercisesWithProgress.length > 0 ? (
          exercisesWithProgress.map(exercise => (
            <ExerciseProgressGraph 
              key={exercise.id}
              exerciseId={exercise.id}
              exerciseName={exercise.name}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? "No exercises found matching your search." 
                : "No exercise progress data available yet. Complete workouts to see your progress."}
            </Text>
            {!searchQuery && (
              <TouchableOpacity 
                style={styles.startWorkoutButton}
                onPress={() => router.push('/workout')}
              >
                <Text style={styles.startWorkoutText}>Start a Workout</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 24,
  },
  startWorkoutButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  startWorkoutText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
});
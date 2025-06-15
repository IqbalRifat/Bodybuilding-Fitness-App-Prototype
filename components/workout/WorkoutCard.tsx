import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { WorkoutTemplate } from '@/types/workout';
import Colors from '@/constants/colors';

interface WorkoutCardProps {
  template: WorkoutTemplate;
  onPress: () => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ template, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.container}>
        <Text style={styles.title}>{template.name}</Text>
        <Text style={styles.description}>{template.description}</Text>
        
        <View style={styles.exerciseList}>
          {template.exercises.slice(0, 3).map((exercise, index) => (
            <View key={exercise.exerciseId} style={styles.exerciseItem}>
              <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
              <Text style={styles.exerciseDetails}>
                {exercise.targetSets} sets × {exercise.targetReps} reps
              </Text>
            </View>
          ))}
          
          {template.exercises.length > 3 && (
            <Text style={styles.moreExercises}>
              +{template.exercises.length - 3} more exercises
            </Text>
          )}
        </View>
        
        <View style={styles.startButtonContainer}>
          <TouchableOpacity style={styles.startButton} onPress={onPress}>
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 16,
  },
  exerciseList: {
    marginBottom: 16,
  },
  exerciseItem: {
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  exerciseDetails: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  moreExercises: {
    fontSize: 14,
    color: Colors.dark.primary,
    marginTop: 4,
  },
  startButtonContainer: {
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
});
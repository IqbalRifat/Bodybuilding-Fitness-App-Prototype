import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ExerciseLogItem } from '@/components/workout/ExerciseLogItem';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Colors from '@/constants/colors';
import { useWorkoutStore } from '@/store/workout-store';
import { WorkoutSession, ExerciseLog } from '@/types/workout';

export default function ActiveWorkoutScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  
  const updateWorkoutSession = useWorkoutStore(state => state.updateWorkoutSession);
  const completeWorkoutSession = useWorkoutStore(state => state.completeWorkoutSession);
  const workoutSessions = useWorkoutStore(state => state.workoutSessions);
  const calculateCaloriesBurned = useWorkoutStore(state => state.calculateCaloriesBurned);
  
  useEffect(() => {
    if (!sessionId) return;
    
    const foundSession = workoutSessions.find(s => s.id === sessionId);
    if (foundSession) {
      setSession(foundSession);
      setNotes(foundSession.notes);
      
      if (!startTime && !foundSession.isCompleted) {
        setStartTime(new Date());
      }
    }
  }, [sessionId, workoutSessions]);
  
  // Timer for workout duration
  useEffect(() => {
    if (!startTime || !session || session.isCompleted) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const seconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(seconds);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, session]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleExerciseUpdate = (updatedExercise: ExerciseLog) => {
    if (!session) return;
    
    const updatedExercises = session.exercises.map(ex => 
      ex.id === updatedExercise.id ? updatedExercise : ex
    );
    
    const updatedSession = {
      ...session,
      exercises: updatedExercises,
    };
    
    setSession(updatedSession);
    updateWorkoutSession(updatedSession);
  };
  
  const handleSaveNotes = () => {
    if (!session) return;
    
    const updatedSession = {
      ...session,
      notes,
    };
    
    setSession(updatedSession);
    updateWorkoutSession(updatedSession);
    
    Alert.alert("Success", "Notes saved successfully!");
  };
  
  const handleCompleteWorkout = () => {
    if (!session || !startTime) return;
    
    const durationMinutes = Math.ceil(elapsedTime / 60);
    
    // Calculate calories burned
    const estimatedCalories = calculateCaloriesBurned({
      ...session,
      duration: durationMinutes
    });
    
    completeWorkoutSession(session.id, durationMinutes);
    
    Alert.alert(
      "Workout Completed",
      `Great job! You completed your ${session.name} workout.\n\nEstimated calories burned: ${estimatedCalories}`,
      [
        { text: "OK", onPress: () => router.push('/workout') }
      ]
    );
  };
  
  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Workout Time</Text>
        <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{session.name}</Text>
        <Text style={styles.date}>
          {new Date(session.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        <View style={styles.exercisesContainer}>
          {session.exercises.map(exercise => (
            <ExerciseLogItem 
              key={exercise.id} 
              exerciseLog={exercise}
              onUpdate={handleExerciseUpdate}
            />
          ))}
        </View>
        
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>Workout Notes</Text>
          <Input
            placeholder="Add notes about your workout..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            inputStyle={styles.notesInput}
          />
          <Button 
            title="Save Notes" 
            onPress={handleSaveNotes}
            style={styles.saveNotesButton}
          />
        </View>
        
        <Button 
          title="Complete Workout" 
          onPress={handleCompleteWorkout}
          style={styles.completeButton}
          size="large"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  timerContainer: {
    backgroundColor: Colors.dark.card,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  timerLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 4,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.primary,
  },
  scrollContent: {
    padding: 16,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.dark.text,
    textAlign: 'center',
    marginTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: Colors.dark.subtext,
    marginBottom: 24,
  },
  exercisesContainer: {
    marginBottom: 24,
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  notesInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  saveNotesButton: {
    marginTop: 12,
  },
  completeButton: {
    marginBottom: 24,
  },
});
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { WorkoutCard } from '@/components/workout/WorkoutCard';
import { CreateWorkoutModal } from '@/components/workout/CreateWorkoutModal';
import { Card } from '@/components/ui/Card';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Colors from '@/constants/colors';
import { useWorkoutStore } from '@/store/workout-store';

export default function WorkoutScreen() {
  const router = useRouter();
  const getAllWorkoutTemplates = useWorkoutStore(state => state.getAllWorkoutTemplates);
  const getUserCreatedTemplates = useWorkoutStore(state => state.getUserCreatedTemplates);
  const startWorkoutSession = useWorkoutStore(state => state.startWorkoutSession);
  const getRecentWorkoutSessions = useWorkoutStore(state => state.getRecentWorkoutSessions);
  const removeWorkoutTemplate = useWorkoutStore(state => state.removeWorkoutTemplate);
  const removeWorkoutSession = useWorkoutStore(state => state.removeWorkoutSession);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const defaultTemplates = getAllWorkoutTemplates().filter(t => !t.isCustom);
  const userTemplates = getUserCreatedTemplates();
  const recentSessions = getRecentWorkoutSessions(1);
  
  const handleStartWorkout = (templateId: string) => {
    const template = [...defaultTemplates, ...userTemplates].find(t => t.id === templateId);
    if (!template) return;
    
    const session = startWorkoutSession(template);
    
    router.push({
      pathname: '/workout/active-workout',
      params: { sessionId: session.id }
    });
  };
  
  const handleDeleteWorkout = (id: string) => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout template?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => removeWorkoutTemplate(id)
        }
      ]
    );
  };
  
  const handleDeleteSession = (id: string) => {
    Alert.alert(
      "Delete Session",
      "Are you sure you want to delete this workout session?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            removeWorkoutSession(id);
            // Force refresh
            getRecentWorkoutSessions(1);
          }
        }
      ]
    );
  };
  
  return (
    <AuthGuard>
      <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Workout</Text>
        
        {recentSessions.length > 0 && !recentSessions[0].isCompleted && (
          <>
            <Text style={styles.sectionTitle}>Continue Workout</Text>
            <Card style={styles.continueCard}>
              <View style={styles.continueHeader}>
                <View>
                  <Text style={styles.continueTitle}>{recentSessions[0].name}</Text>
                  <Text style={styles.continueSubtitle}>
                    Started {new Date(recentSessions[0].date).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteSession(recentSessions[0].id)}
                >
                  <Trash2 size={20} color={Colors.dark.error} />
                </TouchableOpacity>
              </View>
              <Text style={styles.continueProgress}>
                {recentSessions[0].exercises.filter(ex => 
                  ex.sets.some(set => set.isCompleted)
                ).length} / {recentSessions[0].exercises.length} exercises completed
              </Text>
              <View style={styles.continueButtonContainer}>
                <TouchableOpacity 
                  style={styles.continueButton}
                  onPress={() => router.push({
                    pathname: '/workout/active-workout',
                    params: { sessionId: recentSessions[0].id }
                  })}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </>
        )}
        
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>My Workouts</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color={Colors.dark.text} />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
        
        {userTemplates.length > 0 ? (
          userTemplates.map(template => (
            <View key={template.id} style={styles.workoutItemContainer}>
              <WorkoutCard 
                template={template} 
                onPress={() => handleStartWorkout(template.id)}
              />
              <TouchableOpacity 
                style={styles.deleteWorkoutButton}
                onPress={() => handleDeleteWorkout(template.id)}
              >
                <Trash2 size={20} color={Colors.dark.error} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            You haven't created any custom workouts yet. Tap the Create button to get started.
          </Text>
        )}
        
        <TouchableOpacity 
          style={styles.exerciseProgressButton}
          onPress={() => router.push('/workout/exercise-progress')}
        >
          <Text style={styles.exerciseProgressText}>View Exercise Progress</Text>
        </TouchableOpacity>
        
        <Text style={styles.sectionTitle}>Recommended Workouts</Text>
        
        {defaultTemplates.map(template => (
          <WorkoutCard 
            key={template.id} 
            template={template} 
            onPress={() => handleStartWorkout(template.id)}
          />
        ))}
      </ScrollView>
      
        <CreateWorkoutModal 
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  createButtonText: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
  emptyText: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  continueCard: {
    marginBottom: 24,
  },
  continueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  continueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  continueSubtitle: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  continueProgress: {
    fontSize: 14,
    color: Colors.dark.primary,
    marginBottom: 16,
  },
  continueButtonContainer: {
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
  },
  workoutItemContainer: {
    position: 'relative',
  },
  deleteWorkoutButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  exerciseProgressButton: {
    backgroundColor: Colors.dark.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  exerciseProgressText: {
    color: Colors.dark.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});
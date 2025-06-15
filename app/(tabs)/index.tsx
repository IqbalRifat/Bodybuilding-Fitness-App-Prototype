import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { useNutritionStore } from '@/store/nutrition-store';
import { useWorkoutStore } from '@/store/workout-store';

export default function HomeScreen() {
  const router = useRouter();
  const profile = useUserStore(state => state.profile);
  const getMealEntriesByDate = useNutritionStore(state => state.getMealEntriesByDate);
  const getRecentWorkoutSessions = useWorkoutStore(state => state.getRecentWorkoutSessions);
  
  const today = new Date().toISOString().split('T')[0];
  const todaysMeals = getMealEntriesByDate(today);
  const recentWorkouts = getRecentWorkoutSessions(3);
  
  // Calculate today's nutrition totals
  const caloriesConsumed = todaysMeals.reduce((sum, meal) => 
    sum + meal.calories * meal.servingAmount, 0);
  const proteinConsumed = todaysMeals.reduce((sum, meal) => 
    sum + meal.protein * meal.servingAmount, 0);
  
  // Calculate calorie and protein goals based on user profile (simplified)
  const calorieGoal = profile?.fitnessGoal === 'muscle_gain' ? 3000 : 2500;
  const proteinGoal = profile?.currentWeight ? profile.currentWeight * 2 : 150; // 2g per kg
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.greeting}>
          Hello, {profile?.name || 'Fitness Enthusiast'}
        </Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        {/* Daily Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Today's Progress</Text>
          
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Calories</Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${Math.min(100, (caloriesConsumed / calorieGoal) * 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(caloriesConsumed)} / {calorieGoal} kcal
            </Text>
          </View>
          
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Protein</Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${Math.min(100, (proteinConsumed / proteinGoal) * 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(proteinConsumed)} / {Math.round(proteinGoal)} g
            </Text>
          </View>
          
          <View style={styles.buttonRow}>
            <Button 
              title="Log Food" 
              style={styles.actionButton}
              onPress={() => router.push('/nutrition')}
            />
            <Button 
              title="Start Workout" 
              style={styles.actionButton}
              onPress={() => router.push('/workout')}
            />
          </View>
        </Card>
        
        {/* Recent Workouts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <Text 
            style={styles.seeAllText}
            onPress={() => router.push('/workout')}
          >
            See All
          </Text>
        </View>
        
        {recentWorkouts.length > 0 ? (
          recentWorkouts.map(workout => (
            <Card key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDate}>
                  {new Date(workout.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              <Text style={styles.workoutStats}>
                {workout.exercises.length} exercises • {workout.duration} min
              </Text>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No recent workouts</Text>
            <Button 
              title="Start Your First Workout" 
              onPress={() => router.push('/workout')}
              style={styles.emptyButton}
            />
          </Card>
        )}
        
        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Card style={styles.quickActionCard}>
            <Text style={styles.quickActionTitle}>Track Nutrition</Text>
            <Text style={styles.quickActionSubtitle}>Log your meals and supplements</Text>
            <Button 
              title="Go" 
              size="small" 
              style={styles.quickActionButton}
              onPress={() => router.push('/nutrition')}
            />
          </Card>
          
          <Card style={styles.quickActionCard}>
            <Text style={styles.quickActionTitle}>Update Weight</Text>
            <Text style={styles.quickActionSubtitle}>Keep your progress on track</Text>
            <Button 
              title="Go" 
              size="small" 
              style={styles.quickActionButton}
              onPress={() => router.push('/profile')}
            />
          </Card>
          
          <Card style={styles.quickActionCard}>
            <Text style={styles.quickActionTitle}>Learn</Text>
            <Text style={styles.quickActionSubtitle}>Latest bodybuilding research</Text>
            <Button 
              title="Go" 
              size="small" 
              style={styles.quickActionButton}
              onPress={() => router.push('/education')}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  greeting: {
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
  summaryCard: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 16,
    color: Colors.dark.primary,
  },
  workoutCard: {
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  workoutDate: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  workoutStats: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.dark.subtext,
    marginBottom: 16,
  },
  emptyButton: {
    width: '100%',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionCard: {
    width: '48%',
    marginBottom: 12,
    padding: 16,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 12,
  },
  quickActionButton: {
    alignSelf: 'flex-start',
  },
});
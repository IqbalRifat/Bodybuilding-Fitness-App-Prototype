import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { useNutritionStore } from '@/store/nutrition-store';
import { useWorkoutStore } from '@/store/workout-store';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginScreen } from '@/components/auth/LoginScreen';

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = React.useState(false);
  const profile = useUserStore(state => state.profile);
  const getMealEntriesByDate = useNutritionStore(state => state.getMealEntriesByDate);
  const getRecentWorkoutSessions = useWorkoutStore(state => state.getRecentWorkoutSessions);
  
  const colorScheme = useColorScheme() || 'dark';
  const colors = Colors[colorScheme];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <LoginScreen 
        isSignUp={isSignUp}
        onToggleMode={() => setIsSignUp(!isSignUp)}
      />
    );
  }
  
  // Use current date for tracking
  const today = new Date().toISOString().split('T')[0];
  const todaysMeals = getMealEntriesByDate(today);
  const recentWorkouts = getRecentWorkoutSessions(3);
  
  // Calculate today's nutrition totals
  const caloriesConsumed = todaysMeals.reduce((sum, meal) => 
    sum + meal.calories * meal.servingAmount, 0);
  const proteinConsumed = todaysMeals.reduce((sum, meal) => 
    sum + meal.protein * meal.servingAmount, 0);
  
  // Calculate calorie and protein goals based on user profile (simplified)
  const calorieGoal = profile?.calorieGoal || 2500;
  const proteinGoal = profile?.proteinGoal || 150;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['right', 'left']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          Hello, {profile?.name || 'Fitness Enthusiast'}
        </Text>
        <Text style={[styles.date, { color: colors.subtext }]}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        {/* Daily Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Today's Progress</Text>
          
          <View style={styles.progressSection}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>Calories</Text>
            <View style={[styles.progressBarContainer, { backgroundColor: colors.neutral }]}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${Math.min(100, (caloriesConsumed / calorieGoal) * 100)}%`, backgroundColor: colors.primary }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.subtext }]}>
              {Math.round(caloriesConsumed)} / {calorieGoal} kcal
            </Text>
          </View>
          
          <View style={styles.progressSection}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>Protein</Text>
            <View style={[styles.progressBarContainer, { backgroundColor: colors.neutral }]}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${Math.min(100, (proteinConsumed / proteinGoal) * 100)}%`, backgroundColor: colors.primary }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.subtext }]}>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Workouts</Text>
          <Text 
            style={[styles.seeAllText, { color: colors.primary }]}
            onPress={() => router.push('/workout')}
          >
            See All
          </Text>
        </View>
        
        {recentWorkouts.length > 0 ? (
          recentWorkouts.map(workout => (
            <Card key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <Text style={[styles.workoutName, { color: colors.text }]}>{workout.name}</Text>
                <Text style={[styles.workoutDate, { color: colors.subtext }]}>
                  {new Date(workout.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              <Text style={[styles.workoutStats, { color: colors.subtext }]}>
                {workout.exercises.length} exercises • {workout.duration} min
              </Text>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No recent workouts</Text>
            <Button 
              title="Start Your First Workout" 
              onPress={() => router.push('/workout')}
              style={styles.emptyButton}
            />
          </Card>
        )}
        
        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionWrapper}
            onPress={() => router.push('/nutrition')}
          >
            <Card style={styles.quickActionCard}>
              <Text style={[styles.quickActionTitle, { color: colors.text }]}>Track Nutrition</Text>
              <Text style={[styles.quickActionSubtitle, { color: colors.subtext }]}>Log your meals and supplements</Text>
              <Button 
                title="Go" 
                size="small" 
                style={styles.quickActionButton}
                onPress={() => router.push('/nutrition')}
              />
            </Card>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionWrapper}
            onPress={() => router.push('/profile')}
          >
            <Card style={styles.quickActionCard}>
              <Text style={[styles.quickActionTitle, { color: colors.text }]}>Update Weight</Text>
              <Text style={[styles.quickActionSubtitle, { color: colors.subtext }]}>Keep your progress on track</Text>
              <Button 
                title="Go" 
                size="small" 
                style={styles.quickActionButton}
                onPress={() => router.push('/profile')}
              />
            </Card>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionWrapper}
            onPress={() => router.push('/education')}
          >
            <Card style={styles.quickActionCard}>
              <Text style={[styles.quickActionTitle, { color: colors.text }]}>Learn</Text>
              <Text style={[styles.quickActionSubtitle, { color: colors.subtext }]}>Latest bodybuilding research</Text>
              <Button 
                title="Go" 
                size="small" 
                style={styles.quickActionButton}
                onPress={() => router.push('/education')}
              />
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    marginBottom: 24,
  },
  summaryCard: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
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
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 16,
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
  },
  workoutDate: {
    fontSize: 14,
  },
  workoutStats: {
    fontSize: 14,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 16,
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
  quickActionWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  quickActionCard: {
    width: '100%',
    padding: 16,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  quickActionButton: {
    alignSelf: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
});
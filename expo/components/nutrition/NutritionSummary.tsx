import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { useNutritionStore } from '@/store/nutrition-store';

interface NutritionSummaryProps {
  date: string;
  onToggleMicronutrients: () => void;
}

export const NutritionSummary: React.FC<NutritionSummaryProps> = ({ 
  date,
  onToggleMicronutrients
}) => {
  const profile = useUserStore(state => state.profile);
  const dailyStats = useUserStore(state => state.dailyStats);
  const getMealEntriesByDate = useNutritionStore(state => state.getMealEntriesByDate);
  const settings = useNutritionStore(state => state.settings);
  const updateSettings = useNutritionStore(state => state.updateSettings);
  
  const mealEntries = getMealEntriesByDate(date);
  
  // Calculate today's nutrition totals
  const caloriesConsumed = mealEntries.reduce((sum, meal) => 
    sum + meal.calories * meal.servingAmount, 0);
  const proteinConsumed = mealEntries.reduce((sum, meal) => 
    sum + meal.protein * meal.servingAmount, 0);
  const carbsConsumed = mealEntries.reduce((sum, meal) => 
    sum + meal.carbs * meal.servingAmount, 0);
  const fatConsumed = mealEntries.reduce((sum, meal) => 
    sum + meal.fat * meal.servingAmount, 0);
  
  // Get goals from profile
  const calorieGoal = profile?.calorieGoal || 2500;
  const proteinGoal = profile?.proteinGoal || 150;
  const carbsGoal = profile?.carbsGoal || 300;
  const fatGoal = profile?.fatGoal || 70;
  
  // Calculate calories burned
  const caloriesBurned = dailyStats?.caloriesBurned || 0;
  
  // Calculate net calories (consumed - burned)
  const netCalories = settings.includeBurnedCalories 
    ? caloriesConsumed - caloriesBurned 
    : caloriesConsumed;
  const netCalorieGoal = calorieGoal;
  
  const toggleBurnedCalories = () => {
    updateSettings({ includeBurnedCalories: !settings.includeBurnedCalories });
  };
  
  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Nutrition Summary</Text>
      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Calories</Text>
          <Text style={styles.progressText}>
            {Math.round(netCalories)} / {netCalorieGoal} kcal
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${Math.min(100, (netCalories / netCalorieGoal) * 100)}%` }
            ]} 
          />
        </View>
        {caloriesBurned > 0 && (
          <View style={styles.burnedCaloriesRow}>
            <Text style={styles.burnedText}>
              {Math.round(caloriesConsumed)} consumed {settings.includeBurnedCalories ? `- ${Math.round(caloriesBurned)} burned` : ''}
            </Text>
            <TouchableOpacity onPress={toggleBurnedCalories}>
              <Text style={styles.toggleBurnedText}>
                {settings.includeBurnedCalories ? "Exclude burned" : "Include burned"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Protein</Text>
          <Text style={styles.progressText}>
            {Math.round(proteinConsumed)} / {proteinGoal} g
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${Math.min(100, (proteinConsumed / proteinGoal) * 100)}%` }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Carbs</Text>
          <Text style={styles.progressText}>
            {Math.round(carbsConsumed)} / {carbsGoal} g
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${Math.min(100, (carbsConsumed / carbsGoal) * 100)}%` }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Fat</Text>
          <Text style={styles.progressText}>
            {Math.round(fatConsumed)} / {fatGoal} g
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${Math.min(100, (fatConsumed / fatGoal) * 100)}%` }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.macroDistribution}>
        <View style={styles.macroItem}>
          <View style={[styles.macroCircle, styles.proteinCircle]} />
          <Text style={styles.macroLabel}>Protein</Text>
          <Text style={styles.macroPercent}>
            {Math.round((proteinConsumed * 4 / caloriesConsumed) * 100 || 0)}%
          </Text>
        </View>
        <View style={styles.macroItem}>
          <View style={[styles.macroCircle, styles.carbsCircle]} />
          <Text style={styles.macroLabel}>Carbs</Text>
          <Text style={styles.macroPercent}>
            {Math.round((carbsConsumed * 4 / caloriesConsumed) * 100 || 0)}%
          </Text>
        </View>
        <View style={styles.macroItem}>
          <View style={[styles.macroCircle, styles.fatCircle]} />
          <Text style={styles.macroLabel}>Fat</Text>
          <Text style={styles.macroPercent}>
            {Math.round((fatConsumed * 9 / caloriesConsumed) * 100 || 0)}%
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.micronutrientsButton}
        onPress={onToggleMicronutrients}
      >
        <Text style={styles.micronutrientsButtonText}>
          {settings.trackMicronutrients ? "Hide Micronutrients" : "Show Micronutrients"}
        </Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  progressText: {
    fontSize: 16,
    color: Colors.dark.text,
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
  burnedCaloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  burnedText: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  toggleBurnedText: {
    fontSize: 14,
    color: Colors.dark.primary,
    fontWeight: '500',
  },
  macroDistribution: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  proteinCircle: {
    backgroundColor: '#FF5252',
  },
  carbsCircle: {
    backgroundColor: '#FFD740',
  },
  fatCircle: {
    backgroundColor: '#8AE9FF',
  },
  macroLabel: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  macroPercent: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginTop: 2,
  },
  micronutrientsButton: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  micronutrientsButtonText: {
    color: Colors.dark.primary,
    fontWeight: '600',
  },
});
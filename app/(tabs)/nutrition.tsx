import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MealSection } from '@/components/nutrition/MealSection';
import { NutritionSummary } from '@/components/nutrition/NutritionSummary';
import { MicronutrientsList } from '@/components/nutrition/MicronutrientsList';
import { WeightUpdate } from '@/components/nutrition/WeightUpdate';
import { SupplementsList } from '@/components/nutrition/SupplementsList';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { useNutritionStore } from '@/store/nutrition-store';

export default function NutritionScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const calculateCalorieGoals = useUserStore(state => state.calculateCalorieGoals);
  const settings = useNutritionStore(state => state.settings);
  const updateSettings = useNutritionStore(state => state.updateSettings);
  
  useEffect(() => {
    // Calculate calorie goals when the screen loads
    calculateCalorieGoals();
  }, []);
  
  const handleAddFood = (mealType: string) => {
    router.push({
      pathname: '/nutrition/add-food',
      params: { mealType, date: selectedDate }
    });
  };
  
  const toggleMicronutrients = () => {
    updateSettings({ trackMicronutrients: !settings.trackMicronutrients });
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Nutrition Tracker</Text>
        <Text style={styles.subtitle}>
          {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        <NutritionSummary 
          date={selectedDate}
          onToggleMicronutrients={toggleMicronutrients}
        />
        
        {settings.trackMicronutrients && (
          <MicronutrientsList date={selectedDate} />
        )}
        
        <MealSection 
          title="Breakfast" 
          mealType="breakfast" 
          date={selectedDate}
          onAddPress={() => handleAddFood('breakfast')}
        />
        
        <MealSection 
          title="Lunch" 
          mealType="lunch" 
          date={selectedDate}
          onAddPress={() => handleAddFood('lunch')}
        />
        
        <MealSection 
          title="Dinner" 
          mealType="dinner" 
          date={selectedDate}
          onAddPress={() => handleAddFood('dinner')}
        />
        
        <MealSection 
          title="Snacks" 
          mealType="snacks" 
          date={selectedDate}
          onAddPress={() => handleAddFood('snacks')}
        />
        
        <SupplementsList date={selectedDate} />
        
        <WeightUpdate date={selectedDate} />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
    marginBottom: 24,
  },
});
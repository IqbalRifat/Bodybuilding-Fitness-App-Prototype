import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { MealEntry } from '@/types/nutrition';
import Colors from '@/constants/colors';
import { useNutritionStore } from '@/store/nutrition-store';

interface MealSectionProps {
  title: string;
  mealType: MealEntry['mealType'];
  date: string;
  onAddPress: () => void;
}

export const MealSection: React.FC<MealSectionProps> = ({
  title,
  mealType,
  date,
  onAddPress,
}) => {
  const getMealEntriesByType = useNutritionStore(state => state.getMealEntriesByType);
  const removeMealEntry = useNutritionStore(state => state.removeMealEntry);
  
  const mealEntries = getMealEntriesByType(date, mealType);
  
  const totalCalories = mealEntries.reduce((sum, entry) => sum + entry.calories * entry.servingAmount, 0);
  const totalProtein = mealEntries.reduce((sum, entry) => sum + entry.protein * entry.servingAmount, 0);
  const totalCarbs = mealEntries.reduce((sum, entry) => sum + entry.carbs * entry.servingAmount, 0);
  const totalFat = mealEntries.reduce((sum, entry) => sum + entry.fat * entry.servingAmount, 0);
  
  const handleRemove = (id: string) => {
    removeMealEntry(id);
  };
  
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Track your {title.toLowerCase()}</Text>
        </View>
        {mealEntries.length > 0 && (
          <View style={styles.macros}>
            <Text style={styles.calories}>{Math.round(totalCalories)} cal</Text>
            <Text style={styles.macroText}>{Math.round(totalProtein)}g P • {Math.round(totalCarbs)}g C • {Math.round(totalFat)}g F</Text>
          </View>
        )}
      </View>
      
      {mealEntries.length > 0 ? (
        <View style={styles.entriesContainer}>
          {mealEntries.map(entry => (
            <View key={entry.id} style={styles.entryRow}>
              <View style={styles.entryInfo}>
                <Text style={styles.entryName}>{entry.name}</Text>
                <Text style={styles.entryServing}>
                  {entry.servingAmount} {entry.servingSize}
                </Text>
              </View>
              <View style={styles.entryMacros}>
                <Text style={styles.entryCalories}>
                  {Math.round(entry.calories * entry.servingAmount)} cal
                </Text>
                <TouchableOpacity 
                  onPress={() => handleRemove(entry.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : null}
      
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={onAddPress}
        activeOpacity={0.7}
      >
        <Plus size={20} color="#000" />
        <Text style={styles.addButtonText}>Add food item</Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginTop: 2,
  },
  macros: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  macroText: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  entriesContainer: {
    marginBottom: 16,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  entryServing: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  entryMacros: {
    alignItems: 'flex-end',
  },
  entryCalories: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  removeButton: {
    marginTop: 4,
  },
  removeText: {
    fontSize: 14,
    color: Colors.dark.error,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    padding: 12,
  },
  addButtonText: {
    color: '#000',
    fontWeight: '600',
    marginLeft: 8,
  },
});
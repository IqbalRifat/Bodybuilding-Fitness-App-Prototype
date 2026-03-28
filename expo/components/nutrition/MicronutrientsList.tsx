import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import Colors from '@/constants/colors';
import { useNutritionStore } from '@/store/nutrition-store';
import { Micronutrients } from '@/types/nutrition';

interface MicronutrientsListProps {
  date: string;
}

export const MicronutrientsList: React.FC<MicronutrientsListProps> = ({ date }) => {
  const getMealEntriesByDate = useNutritionStore(state => state.getMealEntriesByDate);
  const mealEntries = getMealEntriesByDate(date);
  
  // Calculate total micronutrients
  const totalMicronutrients: Micronutrients = {};
  
  // Define recommended daily values (RDV)
  const rdv = {
    vitaminA: 900, // mcg
    vitaminC: 90, // mg
    vitaminD: 20, // mcg
    vitaminE: 15, // mg
    vitaminK: 120, // mcg
    thiamin: 1.2, // mg
    riboflavin: 1.3, // mg
    niacin: 16, // mg
    vitaminB6: 1.7, // mg
    folate: 400, // mcg
    vitaminB12: 2.4, // mcg
    calcium: 1200, // mg
    iron: 18, // mg
    magnesium: 420, // mg
    phosphorus: 700, // mg
    potassium: 4700, // mg
    sodium: 2300, // mg
    zinc: 11, // mg
    copper: 0.9, // mg
    manganese: 2.3, // mg
    selenium: 55, // mcg
    cholesterol: 300, // mg
    fiber: 30, // g
  };
  
  // Sum up all micronutrients from meal entries
  mealEntries.forEach(meal => {
    if (meal.micronutrients) {
      Object.entries(meal.micronutrients).forEach(([key, value]) => {
        if (value) {
          const nutrientKey = key as keyof Micronutrients;
          totalMicronutrients[nutrientKey] = (totalMicronutrients[nutrientKey] || 0) + (value * meal.servingAmount);
        }
      });
    }
  });
  
  // Group micronutrients by category
  const vitamins = [
    { key: 'vitaminA', name: 'Vitamin A', unit: 'mcg', value: totalMicronutrients.vitaminA, rdv: rdv.vitaminA },
    { key: 'vitaminC', name: 'Vitamin C', unit: 'mg', value: totalMicronutrients.vitaminC, rdv: rdv.vitaminC },
    { key: 'vitaminD', name: 'Vitamin D', unit: 'mcg', value: totalMicronutrients.vitaminD, rdv: rdv.vitaminD },
    { key: 'vitaminE', name: 'Vitamin E', unit: 'mg', value: totalMicronutrients.vitaminE, rdv: rdv.vitaminE },
    { key: 'vitaminK', name: 'Vitamin K', unit: 'mcg', value: totalMicronutrients.vitaminK, rdv: rdv.vitaminK },
    { key: 'thiamin', name: 'Thiamin (B1)', unit: 'mg', value: totalMicronutrients.thiamin, rdv: rdv.thiamin },
    { key: 'riboflavin', name: 'Riboflavin (B2)', unit: 'mg', value: totalMicronutrients.riboflavin, rdv: rdv.riboflavin },
    { key: 'niacin', name: 'Niacin (B3)', unit: 'mg', value: totalMicronutrients.niacin, rdv: rdv.niacin },
    { key: 'vitaminB6', name: 'Vitamin B6', unit: 'mg', value: totalMicronutrients.vitaminB6, rdv: rdv.vitaminB6 },
    { key: 'folate', name: 'Folate', unit: 'mcg', value: totalMicronutrients.folate, rdv: rdv.folate },
    { key: 'vitaminB12', name: 'Vitamin B12', unit: 'mcg', value: totalMicronutrients.vitaminB12, rdv: rdv.vitaminB12 },
  ];
  
  const minerals = [
    { key: 'calcium', name: 'Calcium', unit: 'mg', value: totalMicronutrients.calcium, rdv: rdv.calcium },
    { key: 'iron', name: 'Iron', unit: 'mg', value: totalMicronutrients.iron, rdv: rdv.iron },
    { key: 'magnesium', name: 'Magnesium', unit: 'mg', value: totalMicronutrients.magnesium, rdv: rdv.magnesium },
    { key: 'phosphorus', name: 'Phosphorus', unit: 'mg', value: totalMicronutrients.phosphorus, rdv: rdv.phosphorus },
    { key: 'potassium', name: 'Potassium', unit: 'mg', value: totalMicronutrients.potassium, rdv: rdv.potassium },
    { key: 'sodium', name: 'Sodium', unit: 'mg', value: totalMicronutrients.sodium, rdv: rdv.sodium },
    { key: 'zinc', name: 'Zinc', unit: 'mg', value: totalMicronutrients.zinc, rdv: rdv.zinc },
    { key: 'copper', name: 'Copper', unit: 'mg', value: totalMicronutrients.copper, rdv: rdv.copper },
    { key: 'manganese', name: 'Manganese', unit: 'mg', value: totalMicronutrients.manganese, rdv: rdv.manganese },
    { key: 'selenium', name: 'Selenium', unit: 'mcg', value: totalMicronutrients.selenium, rdv: rdv.selenium },
  ];
  
  const other = [
    { key: 'cholesterol', name: 'Cholesterol', unit: 'mg', value: totalMicronutrients.cholesterol, rdv: rdv.cholesterol },
    { key: 'fiber', name: 'Fiber', unit: 'g', value: totalMicronutrients.fiber, rdv: rdv.fiber },
  ];
  
  // Check if we have any micronutrient data
  const hasData = [...vitamins, ...minerals, ...other].some(item => item.value !== undefined);
  
  if (!hasData) {
    return (
      <Card style={styles.container}>
        <Text style={styles.title}>Micronutrients</Text>
        <Text style={styles.noDataText}>
          No micronutrient data available for today's meals. Add foods with micronutrient information to see your daily intake.
        </Text>
      </Card>
    );
  }
  
  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Micronutrients</Text>
      
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Vitamins</Text>
        {vitamins.map(item => (
          item.value !== undefined && (
            <NutrientItem 
              key={item.key} 
              name={item.name} 
              value={item.value} 
              unit={item.unit} 
              rdv={item.rdv} 
            />
          )
        ))}
        
        <Text style={styles.sectionTitle}>Minerals</Text>
        {minerals.map(item => (
          item.value !== undefined && (
            <NutrientItem 
              key={item.key} 
              name={item.name} 
              value={item.value} 
              unit={item.unit} 
              rdv={item.rdv} 
            />
          )
        ))}
        
        <Text style={styles.sectionTitle}>Other</Text>
        {other.map(item => (
          item.value !== undefined && (
            <NutrientItem 
              key={item.key} 
              name={item.name} 
              value={item.value} 
              unit={item.unit} 
              rdv={item.rdv} 
            />
          )
        ))}
      </ScrollView>
    </Card>
  );
};

interface NutrientItemProps {
  name: string;
  value: number | undefined;
  unit: string;
  rdv: number;
}

const NutrientItem: React.FC<NutrientItemProps> = ({ name, value, unit, rdv }) => {
  if (value === undefined) return null;
  
  const percentage = Math.round((value / rdv) * 100);
  
  return (
    <View style={styles.nutrientItem}>
      <View style={styles.nutrientInfo}>
        <Text style={styles.nutrientName}>{name}</Text>
        <Text style={styles.nutrientValue}>
          {value.toFixed(1)} {unit}
        </Text>
      </View>
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${Math.min(100, percentage)}%` },
            percentage > 100 ? styles.progressBarExcess : null
          ]} 
        />
      </View>
      <Text style={styles.percentage}>{percentage}%</Text>
    </View>
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
  scrollContainer: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 8,
  },
  nutrientItem: {
    marginBottom: 12,
  },
  nutrientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nutrientName: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  nutrientValue: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    marginBottom: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
    borderRadius: 3,
  },
  progressBarExcess: {
    backgroundColor: Colors.dark.warning,
  },
  percentage: {
    fontSize: 12,
    color: Colors.dark.subtext,
    textAlign: 'right',
  },
  noDataText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
});
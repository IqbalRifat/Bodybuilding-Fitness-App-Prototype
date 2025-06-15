import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Supplement } from '@/types/nutrition';
import Colors from '@/constants/colors';
import { useNutritionStore } from '@/store/nutrition-store';

interface SupplementsListProps {
  date: string;
}

export const SupplementsList: React.FC<SupplementsListProps> = ({ date }) => {
  const getSupplementsByDate = useNutritionStore(state => state.getSupplementsByDate);
  const toggleSupplement = useNutritionStore(state => state.toggleSupplement);
  
  const supplements = getSupplementsByDate(date);
  
  if (supplements.length === 0) {
    return null;
  }
  
  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Supplements</Text>
      <Text style={styles.subtitle}>Servings</Text>
      
      <View style={styles.supplementsList}>
        {supplements.map(supplement => (
          <SupplementItem 
            key={supplement.id} 
            supplement={supplement} 
            onToggle={() => toggleSupplement(supplement.id)} 
          />
        ))}
      </View>
    </Card>
  );
};

interface SupplementItemProps {
  supplement: Supplement;
  onToggle: () => void;
}

const SupplementItem: React.FC<SupplementItemProps> = ({ supplement, onToggle }) => {
  return (
    <View style={styles.supplementItem}>
      <View>
        <Text style={styles.supplementName}>{supplement.name}</Text>
        <Text style={styles.supplementDosage}>{supplement.dosage} • {supplement.timeOfDay}</Text>
      </View>
      <TouchableOpacity 
        style={[
          styles.checkButton,
          supplement.taken ? styles.checkButtonActive : null
        ]}
        onPress={onToggle}
      >
        <Text style={styles.checkButtonText}>
          {supplement.taken ? 'Taken' : 'Take'}
        </Text>
      </TouchableOpacity>
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
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginTop: 2,
    marginBottom: 16,
  },
  supplementsList: {
    gap: 12,
  },
  supplementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  supplementName: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  supplementDosage: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginTop: 2,
  },
  checkButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  checkButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  checkButtonText: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
});
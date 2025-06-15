import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { useNutritionStore } from '@/store/nutrition-store';
import { useUserStore } from '@/store/user-store';

interface WeightUpdateProps {
  date: string;
}

export const WeightUpdate: React.FC<WeightUpdateProps> = ({ date }) => {
  const addWeightEntry = useNutritionStore(state => state.addWeightEntry);
  const getLatestWeight = useNutritionStore(state => state.getLatestWeight);
  const updateWeight = useUserStore(state => state.updateWeight);
  
  const [weight, setWeight] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const currentWeight = getLatestWeight() || 0;
  
  const handleUpdateWeight = () => {
    if (!weight) return;
    
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue)) return;
    
    addWeightEntry({
      id: Date.now().toString(),
      weight: weightValue,
      date,
    });
    
    updateWeight(weightValue);
    setWeight('');
    setIsEditing(false);
  };
  
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Current Weight</Text>
        <Text style={styles.weight}>{currentWeight} kg</Text>
      </View>
      
      {isEditing ? (
        <View style={styles.updateForm}>
          <Input
            placeholder="Enter weight in kg"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            containerStyle={styles.input}
          />
          <View style={styles.buttonRow}>
            <Button 
              title="Cancel" 
              variant="outline" 
              style={styles.cancelButton}
              onPress={() => {
                setIsEditing(false);
                setWeight('');
              }}
            />
            <Button 
              title="Save" 
              onPress={handleUpdateWeight}
              style={styles.saveButton}
            />
          </View>
        </View>
      ) : (
        <Button 
          title="Update Weight" 
          onPress={() => setIsEditing(true)}
          style={styles.updateButton}
        />
      )}
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
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  weight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.primary,
  },
  updateButton: {
    width: '100%',
  },
  updateForm: {
    width: '100%',
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
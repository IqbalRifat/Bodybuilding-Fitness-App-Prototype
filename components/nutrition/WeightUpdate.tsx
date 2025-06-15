import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useNutritionStore } from '@/store/nutrition-store';
import { useUserStore } from '@/store/user-store';

interface WeightUpdateProps {
  date: string;
}

export const WeightUpdate: React.FC<WeightUpdateProps> = ({ date }) => {
  const addWeightEntry = useNutritionStore(state => state.addWeightEntry);
  const getWeightEntries = useNutritionStore(state => state.getWeightEntries);
  const removeWeightEntry = useNutritionStore(state => state.removeWeightEntry);
  const getLatestWeight = useNutritionStore(state => state.getLatestWeight);
  const updateWeight = useUserStore(state => state.updateWeight);
  const profile = useUserStore(state => state.profile);
  
  const [weight, setWeight] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const weightUnit = profile?.weightUnit || 'kg';
  const currentWeight = getLatestWeight() || 0;
  const weightEntries = getWeightEntries();
  
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
  
  const handleDeleteEntry = (id: string) => {
    Alert.alert(
      "Delete Weight Entry",
      "Are you sure you want to delete this weight entry?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            removeWeightEntry(id);
            // Update current weight to the latest entry after deletion
            const latestWeight = getLatestWeight();
            if (latestWeight) {
              updateWeight(latestWeight);
            }
          }
        }
      ]
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Current Weight</Text>
        <Text style={styles.weight}>{currentWeight} {weightUnit}</Text>
      </View>
      
      {isEditing ? (
        <View style={styles.updateForm}>
          <Input
            placeholder={`Enter weight in ${weightUnit}`}
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
        <View style={styles.buttonContainer}>
          <Button 
            title="Update Weight" 
            onPress={() => setIsEditing(true)}
            style={styles.updateButton}
          />
          <Button 
            title={showHistory ? "Hide History" : "Show History"} 
            variant="outline"
            onPress={() => setShowHistory(!showHistory)}
            style={styles.historyButton}
          />
        </View>
      )}
      
      {showHistory && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Weight History</Text>
          {weightEntries.length > 0 ? (
            <FlatList
              data={weightEntries}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <View>
                    <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                    <Text style={styles.historyWeight}>{item.weight} {weightUnit}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteEntry(item.id)}
                  >
                    <Trash2 size={18} color={Colors.dark.error} />
                  </TouchableOpacity>
                </View>
              )}
              style={styles.historyList}
            />
          ) : (
            <Text style={styles.emptyText}>No weight entries yet</Text>
          )}
        </View>
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
  buttonContainer: {
    gap: 12,
  },
  updateButton: {
    width: '100%',
  },
  historyButton: {
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
  historyContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  historyDate: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  historyWeight: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
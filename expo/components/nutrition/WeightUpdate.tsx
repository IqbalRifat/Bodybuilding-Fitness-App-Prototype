import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, useColorScheme } from 'react-native';
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
  
  const colorScheme = useColorScheme() || 'dark';
  const colors = Colors[colorScheme];
  
  const weightUnit = profile?.weightUnit || 'kg';
  const currentWeight = getLatestWeight() || 0;
  const weightEntries = getWeightEntries();
  
  const handleUpdateWeight = () => {
    if (!weight) return;
    
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue)) return;
    
    // Use the current date when adding a new weight entry
    const currentDate = new Date().toISOString().split('T')[0];
    
    addWeightEntry({
      id: Date.now().toString(),
      weight: weightValue,
      date: currentDate,
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
        <Text style={[styles.title, { color: colors.text }]}>Current Weight</Text>
        <Text style={[styles.weight, { color: colors.primary }]}>
          {currentWeight} {weightUnit}
        </Text>
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
              variant="neutral" 
              style={styles.cancelButton}
              onPress={() => {
                setIsEditing(false);
                setWeight('');
              }}
            />
            <Button 
              title="Save" 
              variant="secondary"
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
            variant="neutral"
            onPress={() => setShowHistory(!showHistory)}
            style={styles.historyButton}
          />
        </View>
      )}
      
      {showHistory && (
        <View style={[styles.historyContainer, { borderTopColor: colors.border }]}>
          <Text style={[styles.historyTitle, { color: colors.text }]}>Weight History</Text>
          {weightEntries.length > 0 ? (
            <FlatList
              data={weightEntries}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.historyItem, { borderBottomColor: colors.border }]}>
                  <View>
                    <Text style={[styles.historyDate, { color: colors.subtext }]}>
                      {formatDate(item.date)}
                    </Text>
                    <Text style={[styles.historyWeight, { color: colors.text }]}>
                      {item.weight} {weightUnit}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteEntry(item.id)}
                  >
                    <Trash2 size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              )}
              style={styles.historyList}
            />
          ) : (
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              No weight entries yet
            </Text>
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
  },
  weight: {
    fontSize: 18,
    fontWeight: 'bold',
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
    paddingTop: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  historyDate: {
    fontSize: 14,
  },
  historyWeight: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 16,
  },
});
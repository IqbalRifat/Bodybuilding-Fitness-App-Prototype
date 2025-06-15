import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import { ExerciseLog, Set, CardioSet } from '@/types/workout';
import { Input } from '@/components/ui/Input';
import Colors from '@/constants/colors';

interface ExerciseLogItemProps {
  exerciseLog: ExerciseLog;
  onUpdate: (updatedExerciseLog: ExerciseLog) => void;
}

export const ExerciseLogItem: React.FC<ExerciseLogItemProps> = ({ 
  exerciseLog, 
  onUpdate 
}) => {
  const [expanded, setExpanded] = useState(false);
  const colorScheme = useColorScheme() || 'dark';
  const colors = Colors[colorScheme];
  
  const handleStrengthSetUpdate = (index: number, field: 'weight' | 'reps', value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    
    if (exerciseLog.exerciseType === 'strength') {
      const updatedSets = [...exerciseLog.sets] as Set[];
      updatedSets[index] = {
        ...updatedSets[index],
        [field]: numValue,
      };
      
      onUpdate({
        ...exerciseLog,
        sets: updatedSets,
      });
    }
  };
  
  const handleCardioSetUpdate = (index: number, field: 'duration' | 'distance', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    if (exerciseLog.exerciseType === 'cardio') {
      const updatedSets = [...exerciseLog.sets] as CardioSet[];
      updatedSets[index] = {
        ...updatedSets[index],
        [field]: numValue,
      };
      
      onUpdate({
        ...exerciseLog,
        sets: updatedSets,
      });
    }
  };
  
  const handleIntensityUpdate = (index: number, intensity: 'low' | 'medium' | 'high') => {
    if (exerciseLog.exerciseType === 'cardio') {
      const updatedSets = [...exerciseLog.sets] as CardioSet[];
      updatedSets[index] = {
        ...updatedSets[index],
        intensity,
      };
      
      onUpdate({
        ...exerciseLog,
        sets: updatedSets,
      });
    }
  };
  
  const handleSetComplete = (index: number) => {
    if (exerciseLog.exerciseType === 'strength') {
      const updatedSets = [...exerciseLog.sets] as Set[];
      updatedSets[index] = {
        ...updatedSets[index],
        isCompleted: !updatedSets[index].isCompleted,
      };
      
      onUpdate({
        ...exerciseLog,
        sets: updatedSets,
      });
    } else if (exerciseLog.exerciseType === 'cardio') {
      const updatedSets = [...exerciseLog.sets] as CardioSet[];
      updatedSets[index] = {
        ...updatedSets[index],
        isCompleted: !updatedSets[index].isCompleted,
      };
      
      onUpdate({
        ...exerciseLog,
        sets: updatedSets,
      });
    }
  };
  
  const handleAddSet = () => {
    if (exerciseLog.exerciseType === 'strength') {
      const currentSets = exerciseLog.sets as Set[];
      const newSet: Set = {
        id: `${Date.now()}-${exerciseLog.exerciseId}-${currentSets.length}`,
        weight: 0,
        reps: 0,
        isCompleted: false,
      };
      
      onUpdate({
        ...exerciseLog,
        sets: [...currentSets, newSet],
      });
    } else if (exerciseLog.exerciseType === 'cardio') {
      const currentSets = exerciseLog.sets as CardioSet[];
      const newSet: CardioSet = {
        id: `${Date.now()}-${exerciseLog.exerciseId}-${currentSets.length}`,
        duration: 30,
        distance: 0,
        intensity: 'medium',
        isCompleted: false,
      };
      
      onUpdate({
        ...exerciseLog,
        sets: [...currentSets, newSet],
      });
    }
  };
  
  const handleRemoveSet = (index: number) => {
    if (exerciseLog.sets.length <= 1) return; // Don't remove the last set
    
    if (exerciseLog.exerciseType === 'strength') {
      const updatedSets = [...exerciseLog.sets] as Set[];
      updatedSets.splice(index, 1);
      
      onUpdate({
        ...exerciseLog,
        sets: updatedSets,
      });
    } else if (exerciseLog.exerciseType === 'cardio') {
      const updatedSets = [...exerciseLog.sets] as CardioSet[];
      updatedSets.splice(index, 1);
      
      onUpdate({
        ...exerciseLog,
        sets: updatedSets,
      });
    }
  };
  
  const completedSets = exerciseLog.sets.filter(set => set.isCompleted).length;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View>
          <Text style={[styles.exerciseName, { color: colors.text }]}>
            {exerciseLog.exerciseName}
          </Text>
          <Text style={[styles.setCount, { color: colors.subtext }]}>
            {completedSets}/{exerciseLog.sets.length} sets completed
          </Text>
        </View>
        <Text style={[styles.expandText, { color: colors.primary }]}>
          {expanded ? 'Hide' : 'Show'}
        </Text>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.setsContainer}>
          {exerciseLog.exerciseType === 'strength' ? (
            <>
              <View style={[styles.setHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.setHeaderText, { color: colors.subtext }]}>Set</Text>
                <Text style={[styles.setHeaderText, { color: colors.subtext }]}>Weight</Text>
                <Text style={[styles.setHeaderText, { color: colors.subtext }]}>Reps</Text>
                <Text style={[styles.setHeaderText, { color: colors.subtext }]}>Done</Text>
                <Text style={[styles.setHeaderText, { color: colors.subtext }]}></Text>
              </View>
              
              {(exerciseLog.sets as Set[]).map((set, index) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={[styles.setNumber, { color: colors.text }]}>{index + 1}</Text>
                  
                  <Input
                    value={set.weight > 0 ? set.weight.toString() : ''}
                    onChangeText={(value) => handleStrengthSetUpdate(index, 'weight', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    containerStyle={styles.inputContainer}
                    inputStyle={styles.input}
                  />
                  
                  <Input
                    value={set.reps > 0 ? set.reps.toString() : ''}
                    onChangeText={(value) => handleStrengthSetUpdate(index, 'reps', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    containerStyle={styles.inputContainer}
                    inputStyle={styles.input}
                  />
                  
                  <TouchableOpacity 
                    style={[
                      styles.completeButton,
                      { backgroundColor: colors.neutral },
                      set.isCompleted ? { backgroundColor: colors.primary } : null
                    ]}
                    onPress={() => handleSetComplete(index)}
                  >
                    <Text style={[styles.completeButtonText, { color: colors.text }]}>
                      {set.isCompleted ? '✓' : ''}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveSet(index)}
                    disabled={exerciseLog.sets.length <= 1}
                  >
                    <Trash2 
                      size={16} 
                      color={exerciseLog.sets.length <= 1 ? colors.border : colors.error} 
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          ) : (
            <>
              <View style={[styles.setHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.setHeaderText, { color: colors.subtext }]}>Set</Text>
                <Text style={[styles.setHeaderText, { color: colors.subtext }]}>Duration (min)</Text>
                <Text style={[styles.setHeaderText, { color: colors.subtext }]}>Distance (km)</Text>
                <Text style={[styles.setHeaderText, { color: colors.subtext }]}>Done</Text>
                <Text style={[styles.setHeaderText, { color: colors.subtext }]}></Text>
              </View>
              
              {(exerciseLog.sets as CardioSet[]).map((set, index) => (
                <View key={set.id}>
                  <View style={styles.setRow}>
                    <Text style={[styles.setNumber, { color: colors.text }]}>{index + 1}</Text>
                    
                    <Input
                      value={set.duration > 0 ? set.duration.toString() : ''}
                      onChangeText={(value) => handleCardioSetUpdate(index, 'duration', value)}
                      keyboardType="numeric"
                      placeholder="0"
                      containerStyle={styles.inputContainer}
                      inputStyle={styles.input}
                    />
                    
                    <Input
                      value={set.distance ? set.distance.toString() : ''}
                      onChangeText={(value) => handleCardioSetUpdate(index, 'distance', value)}
                      keyboardType="numeric"
                      placeholder="0"
                      containerStyle={styles.inputContainer}
                      inputStyle={styles.input}
                    />
                    
                    <TouchableOpacity 
                      style={[
                        styles.completeButton,
                        { backgroundColor: colors.neutral },
                        set.isCompleted ? { backgroundColor: colors.primary } : null
                      ]}
                      onPress={() => handleSetComplete(index)}
                    >
                      <Text style={[styles.completeButtonText, { color: colors.text }]}>
                        {set.isCompleted ? '✓' : ''}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleRemoveSet(index)}
                      disabled={exerciseLog.sets.length <= 1}
                    >
                      <Trash2 
                        size={16} 
                        color={exerciseLog.sets.length <= 1 ? colors.border : colors.error} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.intensityContainer}>
                    <Text style={[styles.intensityLabel, { color: colors.subtext }]}>Intensity:</Text>
                    <View style={styles.intensityButtons}>
                      <TouchableOpacity 
                        style={[
                          styles.intensityButton,
                          { backgroundColor: colors.neutral },
                          set.intensity === 'low' ? { backgroundColor: colors.primary } : null
                        ]}
                        onPress={() => handleIntensityUpdate(index, 'low')}
                      >
                        <Text style={[styles.intensityButtonText, { color: colors.text }]}>Low</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.intensityButton,
                          { backgroundColor: colors.neutral },
                          set.intensity === 'medium' ? { backgroundColor: colors.primary } : null
                        ]}
                        onPress={() => handleIntensityUpdate(index, 'medium')}
                      >
                        <Text style={[styles.intensityButtonText, { color: colors.text }]}>Medium</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.intensityButton,
                          { backgroundColor: colors.neutral },
                          set.intensity === 'high' ? { backgroundColor: colors.primary } : null
                        ]}
                        onPress={() => handleIntensityUpdate(index, 'high')}
                      >
                        <Text style={[styles.intensityButtonText, { color: colors.text }]}>High</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
          
          <TouchableOpacity 
            style={[styles.addSetButton, { backgroundColor: colors.neutral }]}
            onPress={handleAddSet}
          >
            <Plus size={16} color={colors.text} />
            <Text style={[styles.addSetText, { color: colors.text }]}>Add Set</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  setCount: {
    fontSize: 14,
    marginTop: 4,
  },
  expandText: {
    fontSize: 14,
    fontWeight: '600',
  },
  setsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  setHeaderText: {
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setNumber: {
    fontSize: 16,
    width: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flex: 1,
    marginBottom: 0,
    marginHorizontal: 4,
  },
  input: {
    padding: 8,
    textAlign: 'center',
  },
  completeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intensityContainer: {
    marginBottom: 16,
    marginLeft: 30,
  },
  intensityLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  intensityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  intensityButtonText: {
    fontSize: 14,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  addSetText: {
    marginLeft: 8,
    fontWeight: '500',
  },
});
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
    const updatedSets = exerciseLog.exerciseType === 'strength' 
      ? [...exerciseLog.sets] as Set[]
      : [...exerciseLog.sets] as CardioSet[];
      
    updatedSets[index] = {
      ...updatedSets[index],
      isCompleted: !updatedSets[index].isCompleted,
    };
    
    onUpdate({
      ...exerciseLog,
      sets: updatedSets,
    });
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
    } else {
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
    } else {
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
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View>
          <Text style={styles.exerciseName}>{exerciseLog.exerciseName}</Text>
          <Text style={styles.setCount}>
            {completedSets}/{exerciseLog.sets.length} sets completed
          </Text>
        </View>
        <Text style={styles.expandText}>{expanded ? 'Hide' : 'Show'}</Text>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.setsContainer}>
          {exerciseLog.exerciseType === 'strength' ? (
            <>
              <View style={styles.setHeader}>
                <Text style={styles.setHeaderText}>Set</Text>
                <Text style={styles.setHeaderText}>Weight</Text>
                <Text style={styles.setHeaderText}>Reps</Text>
                <Text style={styles.setHeaderText}>Done</Text>
                <Text style={styles.setHeaderText}></Text>
              </View>
              
              {(exerciseLog.sets as Set[]).map((set, index) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={styles.setNumber}>{index + 1}</Text>
                  
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
                      set.isCompleted ? styles.completeButtonActive : null
                    ]}
                    onPress={() => handleSetComplete(index)}
                  >
                    <Text style={styles.completeButtonText}>
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
                      color={exerciseLog.sets.length <= 1 ? Colors.dark.border : Colors.dark.error} 
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          ) : (
            <>
              <View style={styles.setHeader}>
                <Text style={styles.setHeaderText}>Set</Text>
                <Text style={styles.setHeaderText}>Duration (min)</Text>
                <Text style={styles.setHeaderText}>Distance (km)</Text>
                <Text style={styles.setHeaderText}>Done</Text>
                <Text style={styles.setHeaderText}></Text>
              </View>
              
              {(exerciseLog.sets as CardioSet[]).map((set, index) => (
                <View key={set.id}>
                  <View style={styles.setRow}>
                    <Text style={styles.setNumber}>{index + 1}</Text>
                    
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
                        set.isCompleted ? styles.completeButtonActive : null
                      ]}
                      onPress={() => handleSetComplete(index)}
                    >
                      <Text style={styles.completeButtonText}>
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
                        color={exerciseLog.sets.length <= 1 ? Colors.dark.border : Colors.dark.error} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.intensityContainer}>
                    <Text style={styles.intensityLabel}>Intensity:</Text>
                    <View style={styles.intensityButtons}>
                      <TouchableOpacity 
                        style={[
                          styles.intensityButton,
                          set.intensity === 'low' ? styles.intensityButtonActive : null
                        ]}
                        onPress={() => handleIntensityUpdate(index, 'low')}
                      >
                        <Text style={styles.intensityButtonText}>Low</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.intensityButton,
                          set.intensity === 'medium' ? styles.intensityButtonActive : null
                        ]}
                        onPress={() => handleIntensityUpdate(index, 'medium')}
                      >
                        <Text style={styles.intensityButtonText}>Medium</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.intensityButton,
                          set.intensity === 'high' ? styles.intensityButtonActive : null
                        ]}
                        onPress={() => handleIntensityUpdate(index, 'high')}
                      >
                        <Text style={styles.intensityButtonText}>High</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
          
          <TouchableOpacity 
            style={styles.addSetButton}
            onPress={handleAddSet}
          >
            <Plus size={16} color={Colors.dark.text} />
            <Text style={styles.addSetText}>Add Set</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
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
    color: Colors.dark.text,
  },
  setCount: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginTop: 4,
  },
  expandText: {
    fontSize: 14,
    color: Colors.dark.primary,
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
    borderBottomColor: Colors.dark.border,
    marginBottom: 8,
  },
  setHeaderText: {
    fontSize: 14,
    color: Colors.dark.subtext,
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
    color: Colors.dark.text,
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
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  completeButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  completeButtonText: {
    color: Colors.dark.text,
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
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  intensityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  intensityButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  intensityButtonText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  addSetText: {
    color: Colors.dark.text,
    marginLeft: 8,
    fontWeight: '500',
  },
});
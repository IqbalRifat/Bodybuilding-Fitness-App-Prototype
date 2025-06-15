import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal
} from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { useWorkoutStore } from '@/store/workout-store';
import { Exercise, WorkoutTemplate } from '@/types/workout';
import { AddExerciseModal } from './AddExerciseModal';

interface CreateWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreateWorkoutModal: React.FC<CreateWorkoutModalProps> = ({
  visible,
  onClose,
}) => {
  const getAllExercises = useWorkoutStore(state => state.getAllExercises);
  const addWorkoutTemplate = useWorkoutStore(state => state.addWorkoutTemplate);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<{
    exerciseId: string;
    exerciseName: string;
    exerciseType: 'strength' | 'cardio';
    targetSets: number;
    targetReps?: number;
    targetDuration?: number;
  }[]>([]);
  
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciseType, setExerciseType] = useState<'strength' | 'cardio'>('strength');
  
  const exercises = getAllExercises();
  
  const filteredExercises = exercises.filter(exercise => 
    exercise.type === exerciseType && 
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddExercise = (exercise: Exercise) => {
    if (exercise.type === 'strength') {
      setSelectedExercises([...selectedExercises, {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        exerciseType: 'strength',
        targetSets: 3,
        targetReps: 10,
      }]);
    } else {
      setSelectedExercises([...selectedExercises, {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        exerciseType: 'cardio',
        targetSets: 1,
        targetDuration: 30,
      }]);
    }
    setShowExerciseSelector(false);
    setSearchQuery('');
  };
  
  const handleRemoveExercise = (index: number) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises.splice(index, 1);
    setSelectedExercises(updatedExercises);
  };
  
  const handleUpdateExerciseParams = (index: number, field: string, value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    
    const updatedExercises = [...selectedExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: numValue,
    };
    
    setSelectedExercises(updatedExercises);
  };
  
  const handleSaveWorkout = () => {
    if (!name || selectedExercises.length === 0) return;
    
    const newTemplate: WorkoutTemplate = {
      id: Date.now().toString(),
      name,
      description,
      isCustom: true,
      exercises: selectedExercises,
    };
    
    addWorkoutTemplate(newTemplate);
    
    // Reset form
    setName('');
    setDescription('');
    setSelectedExercises([]);
    
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Workout</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <Input
            label="Workout Name"
            placeholder="e.g., Push Day, Leg Day"
            value={name}
            onChangeText={setName}
          />
          
          <Input
            label="Description (optional)"
            placeholder="Describe your workout"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
          
          <Text style={styles.sectionTitle}>Exercises</Text>
          
          {selectedExercises.length > 0 ? (
            <View style={styles.exercisesList}>
              {selectedExercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                    <TouchableOpacity onPress={() => handleRemoveExercise(index)}>
                      <X size={20} color={Colors.dark.error} />
                    </TouchableOpacity>
                  </View>
                  
                  {exercise.exerciseType === 'strength' ? (
                    <View style={styles.exerciseParams}>
                      <View style={styles.paramItem}>
                        <Text style={styles.paramLabel}>Sets</Text>
                        <Input
                          value={exercise.targetSets.toString()}
                          onChangeText={(value) => handleUpdateExerciseParams(index, 'targetSets', value)}
                          keyboardType="numeric"
                          containerStyle={styles.paramInput}
                          inputStyle={styles.paramInputText}
                        />
                      </View>
                      <View style={styles.paramItem}>
                        <Text style={styles.paramLabel}>Reps</Text>
                        <Input
                          value={exercise.targetReps?.toString() || ''}
                          onChangeText={(value) => handleUpdateExerciseParams(index, 'targetReps', value)}
                          keyboardType="numeric"
                          containerStyle={styles.paramInput}
                          inputStyle={styles.paramInputText}
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.exerciseParams}>
                      <View style={styles.paramItem}>
                        <Text style={styles.paramLabel}>Duration (min)</Text>
                        <Input
                          value={exercise.targetDuration?.toString() || ''}
                          onChangeText={(value) => handleUpdateExerciseParams(index, 'targetDuration', value)}
                          keyboardType="numeric"
                          containerStyle={styles.paramInput}
                          inputStyle={styles.paramInputText}
                        />
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No exercises added yet</Text>
          )}
          
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowExerciseSelector(true)}
          >
            <Plus size={20} color={Colors.dark.text} />
            <Text style={styles.addButtonText}>Add Exercise</Text>
          </TouchableOpacity>
          
          <Button
            title="Save Workout"
            onPress={handleSaveWorkout}
            style={styles.saveButton}
            disabled={!name || selectedExercises.length === 0}
          />
        </ScrollView>
        
        <Modal
          visible={showExerciseSelector}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowExerciseSelector(false)}
        >
          <View style={styles.selectorContainer}>
            <View style={styles.selectorContent}>
              <View style={styles.selectorHeader}>
                <Text style={styles.selectorTitle}>Select Exercise</Text>
                <TouchableOpacity onPress={() => setShowExerciseSelector(false)}>
                  <X size={24} color={Colors.dark.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    exerciseType === 'strength' ? styles.typeButtonActive : null
                  ]}
                  onPress={() => setExerciseType('strength')}
                >
                  <Text style={styles.typeButtonText}>Strength</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    exerciseType === 'cardio' ? styles.typeButtonActive : null
                  ]}
                  onPress={() => setExerciseType('cardio')}
                >
                  <Text style={styles.typeButtonText}>Cardio</Text>
                </TouchableOpacity>
              </View>
              
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                containerStyle={styles.searchInput}
              />
              
              <ScrollView style={styles.exercisesList}>
                {filteredExercises.map(exercise => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.exerciseOption}
                    onPress={() => handleAddExercise(exercise)}
                  >
                    <Text style={styles.exerciseOptionName}>{exercise.name}</Text>
                    <Text style={styles.exerciseOptionCategory}>{exercise.category}</Text>
                  </TouchableOpacity>
                ))}
                
                {filteredExercises.length === 0 && (
                  <Text style={styles.emptyText}>No exercises found</Text>
                )}
                
                <TouchableOpacity 
                  style={styles.createExerciseButton}
                  onPress={() => {
                    setShowExerciseSelector(false);
                    setShowAddExerciseModal(true);
                  }}
                >
                  <Plus size={16} color={Colors.dark.primary} />
                  <Text style={styles.createExerciseText}>Create Custom Exercise</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
        
        <AddExerciseModal 
          visible={showAddExerciseModal}
          onClose={() => setShowAddExerciseModal(false)}
          onExerciseAdded={(exercise) => {
            setShowAddExerciseModal(false);
            handleAddExercise(exercise);
          }}
          initialType={exerciseType}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 12,
  },
  exercisesList: {
    marginBottom: 16,
  },
  exerciseItem: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  exerciseParams: {
    flexDirection: 'row',
    gap: 12,
  },
  paramItem: {
    flex: 1,
  },
  paramLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 4,
  },
  paramInput: {
    marginBottom: 0,
  },
  paramInputText: {
    textAlign: 'center',
  },
  emptyText: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginVertical: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.card,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  addButtonText: {
    color: Colors.dark.text,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    marginBottom: 24,
  },
  selectorContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  selectorContent: {
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    height: '80%',
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  typeButtonText: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
  searchInput: {
    marginBottom: 16,
  },
  exerciseOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  exerciseOptionName: {
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 4,
  },
  exerciseOptionCategory: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  createExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  createExerciseText: {
    color: Colors.dark.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
});
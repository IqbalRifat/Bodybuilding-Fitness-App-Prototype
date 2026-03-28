import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal
} from 'react-native';
import { X } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { useWorkoutStore } from '@/store/workout-store';
import { Exercise } from '@/types/workout';

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onExerciseAdded: (exercise: Exercise) => void;
  initialType?: 'strength' | 'cardio';
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  visible,
  onClose,
  onExerciseAdded,
  initialType = 'strength'
}) => {
  const addCustomExercise = useWorkoutStore(state => state.addCustomExercise);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [type, setType] = useState<'strength' | 'cardio'>(initialType);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [caloriesBurnedPerMinute, setCaloriesBurnedPerMinute] = useState('');
  
  const availableMuscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
    'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Lower Back',
    'Traps', 'Neck'
  ];
  
  const handleToggleMuscleGroup = (group: string) => {
    if (muscleGroups.includes(group)) {
      setMuscleGroups(muscleGroups.filter(g => g !== group));
    } else {
      setMuscleGroups([...muscleGroups, group]);
    }
  };
  
  const handleSaveExercise = () => {
    if (!name || !category || muscleGroups.length === 0) return;
    
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name,
      category,
      muscleGroup: muscleGroups,
      description,
      instructions,
      type,
      isCustom: true,
    };
    
    if (type === 'cardio' && caloriesBurnedPerMinute) {
      newExercise.caloriesBurnedPerMinute = parseFloat(caloriesBurnedPerMinute);
    }
    
    addCustomExercise(newExercise);
    onExerciseAdded(newExercise);
    
    // Reset form
    setName('');
    setCategory('');
    setDescription('');
    setInstructions('');
    setMuscleGroups([]);
    setCaloriesBurnedPerMinute('');
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
          <Text style={styles.title}>Create Exercise</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <Input
            label="Exercise Name"
            placeholder="e.g., Dumbbell Curl, Treadmill Run"
            value={name}
            onChangeText={setName}
          />
          
          <View style={styles.typeSelector}>
            <Text style={styles.label}>Exercise Type</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'strength' ? styles.typeButtonActive : null
                ]}
                onPress={() => setType('strength')}
              >
                <Text style={styles.typeButtonText}>Strength</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'cardio' ? styles.typeButtonActive : null
                ]}
                onPress={() => setType('cardio')}
              >
                <Text style={styles.typeButtonText}>Cardio</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Input
            label="Category"
            placeholder="e.g., Compound, Isolation, HIIT"
            value={category}
            onChangeText={setCategory}
          />
          
          <Text style={styles.label}>Muscle Groups</Text>
          <View style={styles.muscleGroupsContainer}>
            {availableMuscleGroups.map(group => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.muscleGroupButton,
                  muscleGroups.includes(group) ? styles.muscleGroupButtonActive : null
                ]}
                onPress={() => handleToggleMuscleGroup(group)}
              >
                <Text 
                  style={[
                    styles.muscleGroupText,
                    muscleGroups.includes(group) ? styles.muscleGroupTextActive : null
                  ]}
                >
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Input
            label="Description"
            placeholder="Brief description of the exercise"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
          
          <Input
            label="Instructions"
            placeholder="Step-by-step instructions for performing the exercise"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={4}
          />
          
          {type === 'cardio' && (
            <Input
              label="Calories Burned Per Minute (estimate)"
              placeholder="e.g., 10"
              value={caloriesBurnedPerMinute}
              onChangeText={setCaloriesBurnedPerMinute}
              keyboardType="numeric"
            />
          )}
          
          <Button
            title="Save Exercise"
            onPress={handleSaveExercise}
            style={styles.saveButton}
            disabled={!name || !category || muscleGroups.length === 0}
          />
        </ScrollView>
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeButtons: {
    flexDirection: 'row',
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
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  muscleGroupButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  muscleGroupButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  muscleGroupText: {
    color: Colors.dark.text,
  },
  muscleGroupTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 24,
  },
});
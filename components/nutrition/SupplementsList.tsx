import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, useColorScheme } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Supplement } from '@/types/nutrition';
import Colors from '@/constants/colors';
import { useNutritionStore } from '@/store/nutrition-store';
import { Plus, X, Edit2, Trash2 } from 'lucide-react-native';

interface SupplementsListProps {
  date: string;
}

export const SupplementsList: React.FC<SupplementsListProps> = ({ date }) => {
  const getSupplementsByDate = useNutritionStore(state => state.getSupplementsByDate);
  const toggleSupplement = useNutritionStore(state => state.toggleSupplement);
  const addSupplement = useNutritionStore(state => state.addSupplement);
  const removeSupplement = useNutritionStore(state => state.removeSupplement);
  const updateSupplement = useNutritionStore(state => state.updateSupplement);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null);
  
  const colorScheme = useColorScheme() || 'dark';
  const colors = Colors[colorScheme];
  
  const supplements = getSupplementsByDate(date);
  
  const handleAddSupplement = () => {
    setEditingSupplement(null);
    setShowAddModal(true);
  };
  
  const handleEditSupplement = (supplement: Supplement) => {
    setEditingSupplement(supplement);
    setShowAddModal(true);
  };
  
  const handleDeleteSupplement = (id: string) => {
    removeSupplement(id);
  };
  
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Supplements</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddSupplement}
        >
          <Plus size={20} color={colors.primary} />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>Add</Text>
        </TouchableOpacity>
      </View>
      
      {supplements.length > 0 ? (
        <View style={styles.supplementsList}>
          {supplements.map(supplement => (
            <SupplementItem 
              key={supplement.id} 
              supplement={supplement} 
              onToggle={() => toggleSupplement(supplement.id)}
              onEdit={() => handleEditSupplement(supplement)}
              onDelete={() => handleDeleteSupplement(supplement.id)}
            />
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: colors.subtext }]}>
          No supplements added for today. Tap "Add" to track your supplements.
        </Text>
      )}
      
      <SupplementModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(supplementData) => {
          if (editingSupplement) {
            updateSupplement({
              ...supplementData,
              id: editingSupplement.id,
              date: editingSupplement.date,
              taken: editingSupplement.taken
            });
          } else {
            addSupplement({
              ...supplementData,
              id: Date.now().toString(),
              date,
              taken: false
            });
          }
          setShowAddModal(false);
        }}
        initialData={editingSupplement}
      />
    </Card>
  );
};

interface SupplementItemProps {
  supplement: Supplement;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const SupplementItem: React.FC<SupplementItemProps> = ({ 
  supplement, 
  onToggle,
  onEdit,
  onDelete
}) => {
  const colorScheme = useColorScheme() || 'dark';
  const colors = Colors[colorScheme];
  
  return (
    <View style={[styles.supplementItem, { borderBottomColor: colors.border }]}>
      <View style={styles.supplementInfo}>
        <Text style={[styles.supplementName, { color: colors.text }]}>{supplement.name}</Text>
        <Text style={[styles.supplementDosage, { color: colors.subtext }]}>
          {supplement.dosage} • {supplement.timeOfDay}
        </Text>
      </View>
      <View style={styles.supplementActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onEdit}
        >
          <Edit2 size={16} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onDelete}
        >
          <Trash2 size={16} color={colors.error} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.checkButton,
            { backgroundColor: colors.neutral },
            supplement.taken ? { backgroundColor: colors.secondary } : null
          ]}
          onPress={onToggle}
        >
          <Text style={[
            styles.checkButtonText, 
            { 
              color: supplement.taken && colorScheme === 'dark' 
                ? '#111111' 
                : colors.text 
            }
          ]}>
            {supplement.taken ? 'Taken' : 'Take'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface SupplementModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (supplement: Omit<Supplement, 'id' | 'date' | 'taken'>) => void;
  initialData: Supplement | null;
}

const SupplementModal: React.FC<SupplementModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [dosage, setDosage] = useState(initialData?.dosage || '');
  const [timeOfDay, setTimeOfDay] = useState(initialData?.timeOfDay || 'Morning');
  
  const colorScheme = useColorScheme() || 'dark';
  const colors = Colors[colorScheme];
  
  // Reset form when modal opens
  React.useEffect(() => {
    if (visible) {
      setName(initialData?.name || '');
      setDosage(initialData?.dosage || '');
      setTimeOfDay(initialData?.timeOfDay || 'Morning');
    }
  }, [visible, initialData]);
  
  const handleSave = () => {
    if (!name || !dosage) return;
    
    onSave({
      name,
      dosage,
      timeOfDay,
      micronutrients: initialData?.micronutrients || {},
      isCustom: true,
    });
  };
  
  const timeOptions = ['Morning', 'Afternoon', 'Evening', 'Before Workout', 'After Workout'];
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {initialData ? 'Edit Supplement' : 'Add Supplement'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Input
              label="Supplement Name"
              placeholder="e.g., Vitamin D, Protein, Creatine"
              value={name}
              onChangeText={setName}
            />
            
            <Input
              label="Dosage"
              placeholder="e.g., 5g, 1000mg, 1 tablet"
              value={dosage}
              onChangeText={setDosage}
            />
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Time of Day</Text>
            <View style={styles.timeOptions}>
              {timeOptions.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    { backgroundColor: colors.neutral },
                    timeOfDay === time ? { backgroundColor: colors.primary } : null
                  ]}
                  onPress={() => setTimeOfDay(time)}
                >
                  <Text 
                    style={[
                      styles.timeOptionText,
                      { color: colors.text },
                      timeOfDay === time && colorScheme === 'dark' 
                        ? { color: '#111111', fontWeight: '600' } 
                        : timeOfDay === time 
                          ? { fontWeight: '600' } 
                          : null
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Button
              title="Save Supplement"
              variant="secondary"
              onPress={handleSave}
              style={styles.saveButton}
              disabled={!name || !dosage}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontWeight: '600',
    marginLeft: 4,
  },
  supplementsList: {
    gap: 12,
  },
  supplementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  supplementInfo: {
    flex: 1,
  },
  supplementName: {
    fontSize: 16,
  },
  supplementDosage: {
    fontSize: 14,
    marginTop: 2,
  },
  supplementActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  checkButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  checkButtonText: {
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    maxHeight: '100%',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeOptionText: {
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 24,
  },
});
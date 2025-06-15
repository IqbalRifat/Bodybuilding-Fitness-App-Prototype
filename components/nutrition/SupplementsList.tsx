import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
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
        <Text style={styles.title}>Supplements</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddSupplement}
        >
          <Plus size={20} color={Colors.dark.primary} />
          <Text style={styles.addButtonText}>Add</Text>
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
        <Text style={styles.emptyText}>
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
  return (
    <View style={styles.supplementItem}>
      <View style={styles.supplementInfo}>
        <Text style={styles.supplementName}>{supplement.name}</Text>
        <Text style={styles.supplementDosage}>{supplement.dosage} • {supplement.timeOfDay}</Text>
      </View>
      <View style={styles.supplementActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onEdit}
        >
          <Edit2 size={16} color={Colors.dark.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onDelete}
        >
          <Trash2 size={16} color={Colors.dark.error} />
        </TouchableOpacity>
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
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {initialData ? 'Edit Supplement' : 'Add Supplement'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors.dark.text} />
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
            
            <Text style={styles.inputLabel}>Time of Day</Text>
            <View style={styles.timeOptions}>
              {timeOptions.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    timeOfDay === time ? styles.timeOptionActive : null
                  ]}
                  onPress={() => setTimeOfDay(time)}
                >
                  <Text 
                    style={[
                      styles.timeOptionText,
                      timeOfDay === time ? styles.timeOptionTextActive : null
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Button
              title="Save Supplement"
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
    color: Colors.dark.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.dark.primary,
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
    borderBottomColor: Colors.dark.border,
  },
  supplementInfo: {
    flex: 1,
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
  supplementActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
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
  emptyText: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    paddingVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.dark.background,
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
    color: Colors.dark.text,
  },
  modalBody: {
    maxHeight: '100%',
  },
  inputLabel: {
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  timeOption: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeOptionActive: {
    backgroundColor: Colors.dark.primary,
  },
  timeOptionText: {
    color: Colors.dark.text,
  },
  timeOptionTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 24,
  },
});
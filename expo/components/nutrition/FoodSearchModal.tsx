import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useNutritionStore } from '@/store/nutrition-store';
import Colors from '@/constants/colors';

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
}

export function FoodSearchModal({ visible, onClose, onSelectFood }: FoodSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { searchFoodItems } = useNutritionStore();

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchFoodItems(query);
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Error', 'Failed to search for foods');
    } finally {
      setLoading(false);
    }
  };


  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity
      style={styles.foodItem}
      onPress={() => onSelectFood(item)}
    >
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        {item.brand && <Text style={styles.foodBrand}>{item.brand}</Text>}
        <View style={styles.macros}>
          <Text style={styles.macroText}>{item.calories} cal</Text>
          <Text style={styles.macroText}>{item.protein}g protein</Text>
          <Text style={styles.macroText}>{item.carbs}g carbs</Text>
          <Text style={styles.macroText}>{item.fat}g fat</Text>
        </View>
      </View>
    </TouchableOpacity>
  );


  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.dark.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Search Food</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.dark.subtext} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food..."
            placeholderTextColor={Colors.dark.subtext}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
            autoFocus
          />
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.dark.primary} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        <FlatList
          data={searchResults}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading && searchQuery ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No foods found</Text>
                <Text style={styles.emptySubtext}>Try a different search term</Text>
              </View>
            ) : null
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
    paddingVertical: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: Colors.dark.subtext,
    marginTop: 12,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  foodItem: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  foodBrand: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroText: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textAlign: 'center',
  },
});
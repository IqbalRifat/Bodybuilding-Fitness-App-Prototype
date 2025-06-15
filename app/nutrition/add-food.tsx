import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Camera, Barcode, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useNutritionStore } from '@/store/nutrition-store';
import { FoodItem, MealEntry, Micronutrients } from '@/types/nutrition';

export default function AddFoodScreen() {
  const { mealType, date } = useLocalSearchParams<{ mealType: string; date: string }>();
  const router = useRouter();
  
  const getAllFoodItems = useNutritionStore(state => state.getAllFoodItems);
  const addMealEntry = useNutritionStore(state => state.addMealEntry);
  const addFoodItem = useNutritionStore(state => state.addFoodItem);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [servingAmount, setServingAmount] = useState('1');
  const [selectedServingOption, setSelectedServingOption] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddCustomFood, setShowAddCustomFood] = useState(false);
  
  // Custom food form state
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customServingSize, setCustomServingSize] = useState('');
  
  // Calculated nutrition values based on serving
  const [calculatedNutrition, setCalculatedNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  
  useEffect(() => {
    const items = getAllFoodItems();
    setFoodItems(items);
    setFilteredItems(items);
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(foodItems);
    } else {
      const filtered = foodItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, foodItems]);
  
  useEffect(() => {
    if (selectedItem && servingAmount) {
      const amount = parseFloat(servingAmount);
      if (!isNaN(amount)) {
        const servingMultiplier = selectedItem.servingOptions[selectedServingOption].multiplier;
        
        setCalculatedNutrition({
          calories: selectedItem.calories * amount * servingMultiplier,
          protein: selectedItem.protein * amount * servingMultiplier,
          carbs: selectedItem.carbs * amount * servingMultiplier,
          fat: selectedItem.fat * amount * servingMultiplier
        });
      }
    }
  }, [selectedItem, servingAmount, selectedServingOption]);
  
  const handleSelectItem = (item: FoodItem) => {
    setSelectedItem(item);
    setSelectedServingOption(0);
    setServingAmount('1');
  };
  
  const handleAddFood = () => {
    if (!selectedItem || !mealType || !date) return;
    
    const amount = parseFloat(servingAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    const servingMultiplier = selectedItem.servingOptions[selectedServingOption].multiplier;
    
    const newEntry: MealEntry = {
      id: Date.now().toString(),
      foodItemId: selectedItem.id,
      name: selectedItem.name,
      calories: selectedItem.calories,
      protein: selectedItem.protein,
      carbs: selectedItem.carbs,
      fat: selectedItem.fat,
      servingSize: selectedItem.servingOptions[selectedServingOption].name,
      servingAmount: amount,
      date: date,
      mealType: mealType as any,
      micronutrients: selectedItem.micronutrients,
    };
    
    addMealEntry(newEntry);
    router.back();
  };
  
  const handleScanBarcode = () => {
    Alert.alert(
      "Barcode Scanner",
      "This feature would open the camera to scan a food barcode. The app would then look up the nutritional information in a database.",
      [{ text: "OK" }]
    );
  };
  
  const handleAddCustomFood = () => {
    if (!customName || !customCalories || !customServingSize) {
      Alert.alert("Missing Information", "Please provide at least the name, calories, and serving size.");
      return;
    }
    
    const newFoodItem: FoodItem = {
      id: Date.now().toString(),
      name: customName,
      calories: parseFloat(customCalories) || 0,
      protein: parseFloat(customProtein) || 0,
      carbs: parseFloat(customCarbs) || 0,
      fat: parseFloat(customFat) || 0,
      servingSize: customServingSize,
      servingOptions: [
        { name: customServingSize, multiplier: 1 },
        { name: "gram", multiplier: 0.01 }
      ],
      isCustom: true
    };
    
    addFoodItem(newFoodItem);
    
    // Reset form and show success message
    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    setCustomServingSize('');
    setShowAddCustomFood(false);
    
    // Update food items list
    const updatedItems = getAllFoodItems();
    setFoodItems(updatedItems);
    setFilteredItems(updatedItems);
    
    Alert.alert(
      "Success",
      "Custom food added successfully!",
      [{ text: "OK" }]
    );
  };
  
  return (
    <View style={styles.container}>
      {!selectedItem && !showAddCustomFood ? (
        <>
          <Text style={styles.title}>Add Food to {mealType}</Text>
          
          <View style={styles.searchContainer}>
            <Input
              placeholder="Search for food..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={styles.searchInput}
            />
            <TouchableOpacity 
              style={styles.barcodeButton}
              onPress={handleScanBarcode}
            >
              <Barcode size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.dark.primary} />
          ) : (
            <>
              <FlatList
                data={filteredItems}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.foodItem}
                    onPress={() => handleSelectItem(item)}
                  >
                    <View>
                      <Text style={styles.foodName}>{item.name}</Text>
                      <Text style={styles.foodServing}>{item.servingSize}</Text>
                    </View>
                    <View style={styles.macros}>
                      <Text style={styles.calories}>{item.calories} cal</Text>
                      <Text style={styles.macroText}>
                        {item.protein}g P • {item.carbs}g C • {item.fat}g F
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No food items found</Text>
                }
                contentContainerStyle={styles.listContent}
              />
              
              <TouchableOpacity 
                style={styles.addCustomButton}
                onPress={() => setShowAddCustomFood(true)}
              >
                <Plus size={20} color={Colors.dark.text} />
                <Text style={styles.addCustomText}>Add Custom Food</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      ) : showAddCustomFood ? (
        <ScrollView style={styles.customFoodContainer}>
          <View style={styles.customFoodHeader}>
            <Text style={styles.customFoodTitle}>Add Custom Food</Text>
            <TouchableOpacity onPress={() => setShowAddCustomFood(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <Input
            label="Food Name"
            placeholder="e.g., Homemade Protein Shake"
            value={customName}
            onChangeText={setCustomName}
          />
          
          <Input
            label="Calories (per serving)"
            placeholder="e.g., 250"
            value={customCalories}
            onChangeText={setCustomCalories}
            keyboardType="numeric"
          />
          
          <View style={styles.macroInputRow}>
            <Input
              label="Protein (g)"
              placeholder="e.g., 20"
              value={customProtein}
              onChangeText={setCustomProtein}
              keyboardType="numeric"
              containerStyle={styles.macroInput}
            />
            
            <Input
              label="Carbs (g)"
              placeholder="e.g., 30"
              value={customCarbs}
              onChangeText={setCustomCarbs}
              keyboardType="numeric"
              containerStyle={styles.macroInput}
            />
            
            <Input
              label="Fat (g)"
              placeholder="e.g., 5"
              value={customFat}
              onChangeText={setCustomFat}
              keyboardType="numeric"
              containerStyle={styles.macroInput}
            />
          </View>
          
          <Input
            label="Serving Size"
            placeholder="e.g., 1 cup, 100g"
            value={customServingSize}
            onChangeText={setCustomServingSize}
          />
          
          <Button
            title="Add Custom Food"
            onPress={handleAddCustomFood}
            style={styles.addCustomFoodButton}
          />
        </ScrollView>
      ) : (
        <View style={styles.detailsContainer}>
          <Card style={styles.foodDetails}>
            <Text style={styles.detailsTitle}>{selectedItem?.name}</Text>
            
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {Math.round(calculatedNutrition.calories)}
                </Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {Math.round(calculatedNutrition.protein)}g
                </Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {Math.round(calculatedNutrition.carbs)}g
                </Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {Math.round(calculatedNutrition.fat)}g
                </Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
            </View>
            
            <Text style={styles.servingTitle}>Serving Size</Text>
            <View style={styles.servingOptions}>
              {selectedItem?.servingOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.servingOption,
                    selectedServingOption === index && styles.selectedServingOption
                  ]}
                  onPress={() => setSelectedServingOption(index)}
                >
                  <Text 
                    style={[
                      styles.servingOptionText,
                      selectedServingOption === index && styles.selectedServingOptionText
                    ]}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.servingTitle}>Amount</Text>
            <Input
              value={servingAmount}
              onChangeText={setServingAmount}
              keyboardType="numeric"
              placeholder="1"
            />
            
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                {Math.round(calculatedNutrition.calories)} calories
              </Text>
            </View>
            
            <View style={styles.buttonRow}>
              <Button 
                title="Cancel" 
                variant="outline" 
                style={styles.cancelButton}
                onPress={() => setSelectedItem(null)}
              />
              <Button 
                title="Add to Log" 
                style={styles.addButton}
                onPress={handleAddFood}
              />
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  barcodeButton: {
    backgroundColor: Colors.dark.card,
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  foodServing: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  macros: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  macroText: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.dark.subtext,
    marginTop: 24,
  },
  detailsContainer: {
    flex: 1,
  },
  foodDetails: {
    padding: 16,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  nutritionLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginTop: 4,
  },
  servingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  servingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  servingOption: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectedServingOption: {
    backgroundColor: Colors.dark.primary,
  },
  servingOptionText: {
    color: Colors.dark.text,
  },
  selectedServingOptionText: {
    color: '#000',
    fontWeight: '600',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.card,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  addCustomText: {
    color: Colors.dark.text,
    fontWeight: '600',
    marginLeft: 8,
  },
  customFoodContainer: {
    flex: 1,
  },
  customFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customFoodTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  cancelText: {
    color: Colors.dark.primary,
    fontSize: 16,
  },
  macroInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  macroInput: {
    flex: 1,
  },
  addCustomFoodButton: {
    marginTop: 16,
    marginBottom: 24,
  },
});
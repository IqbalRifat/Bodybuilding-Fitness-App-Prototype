import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WeightProgressGraph } from '@/components/nutrition/WeightProgressGraph';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { useNutritionStore } from '@/store/nutrition-store';
import { UserProfile } from '@/types/user';
import { useAuth } from '@/components/auth/AuthProvider';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const profile = useUserStore(state => state.profile);
  const supabaseProfile = useUserStore(state => state.supabaseProfile);
  const weightEntries = useUserStore(state => state.weightEntries);
  const setProfile = useUserStore(state => state.setProfile);
  const toggleUnit = useUserStore(state => state.toggleUnit);
  const logout = useUserStore(state => state.logout);
  const loadSupabaseProfile = useUserStore(state => state.loadSupabaseProfile);
  const updateSupabaseProfile = useUserStore(state => state.updateSupabaseProfile);
  const loadWeightEntries = useUserStore(state => state.loadWeightEntries);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    height: 0,
    heightUnit: 'cm',
    currentWeight: 0,
    weightUnit: 'kg',
    goalWeight: 0,
    fitnessGoal: 'muscle_gain',
    experienceLevel: 'intermediate',
    trainingDaysPerWeek: 4,
  });
  
  useEffect(() => {
    if (user) {
      loadSupabaseProfile();
      loadWeightEntries();
    }
  }, [user]);

  useEffect(() => {
    if (supabaseProfile) {
      setFormData({
        name: supabaseProfile.full_name || '',
        height: supabaseProfile.height_cm || 175,
        heightUnit: 'cm',
        currentWeight: weightEntries[0]?.weight_kg || 75,
        weightUnit: 'kg',
        goalWeight: 80, // This could be stored in profile
        fitnessGoal: supabaseProfile.goal || 'muscle_gain',
        experienceLevel: 'intermediate', // This could be stored in profile
        trainingDaysPerWeek: 4, // This could be stored in profile
      });
    }
  }, [supabaseProfile, weightEntries]);
  
  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      await updateSupabaseProfile({
        full_name: formData.name,
        height_cm: formData.height,
        goal: formData.fitnessGoal,
        age: formData.age, // Add age to form if needed
        gender: formData.gender, // Add gender to form if needed
        activity_level: formData.activityLevel, // Add activity level to form if needed
      });
      
      setIsEditing(false);
      
      Alert.alert(
        "Profile Updated",
        "Your profile has been successfully updated.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to update profile. Please try again.",
        [{ text: "OK" }]
      );
    }
  };
  
  const handleToggleUnit = (type: 'height' | 'weight') => {
    toggleUnit(type);
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: async () => {
          await signOut();
          logout();
        }}
      ]
    );
  };
  
  const renderGoalName = (goal: string) => {
    switch (goal) {
      case 'muscle_gain': return 'Muscle Gain';
      case 'fat_loss': return 'Fat Loss';
      case 'maintenance': return 'Maintenance';
      case 'competition_prep': return 'Competition Prep';
      default: return goal;
    }
  };
  
  const renderExperienceName = (level: string) => {
    switch (level) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      default: return level;
    }
  };
  
  return (
    <AuthGuard>
      <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Profile</Text>
        
        {isEditing ? (
          <Card style={styles.editCard}>
            <Text style={styles.editTitle}>Edit Profile</Text>
            
            <Input
              label="Name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
            
            <View style={styles.unitRow}>
              <Input
                label={`Height (${formData.heightUnit})`}
                value={formData.height?.toString()}
                onChangeText={(value) => handleInputChange('height', parseFloat(value) || 0)}
                keyboardType="numeric"
                containerStyle={styles.unitInput}
              />
              <TouchableOpacity 
                style={styles.unitToggle}
                onPress={() => handleInputChange('heightUnit', formData.heightUnit === 'cm' ? 'in' : 'cm')}
              >
                <Text style={styles.unitToggleText}>
                  Switch to {formData.heightUnit === 'cm' ? 'inches' : 'cm'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.unitRow}>
              <Input
                label={`Current Weight (${formData.weightUnit})`}
                value={formData.currentWeight?.toString()}
                onChangeText={(value) => handleInputChange('currentWeight', parseFloat(value) || 0)}
                keyboardType="numeric"
                containerStyle={styles.unitInput}
              />
              <TouchableOpacity 
                style={styles.unitToggle}
                onPress={() => handleInputChange('weightUnit', formData.weightUnit === 'kg' ? 'lb' : 'kg')}
              >
                <Text style={styles.unitToggleText}>
                  Switch to {formData.weightUnit === 'kg' ? 'lb' : 'kg'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.unitRow}>
              <Input
                label={`Goal Weight (${formData.weightUnit})`}
                value={formData.goalWeight?.toString()}
                onChangeText={(value) => handleInputChange('goalWeight', parseFloat(value) || 0)}
                keyboardType="numeric"
                containerStyle={styles.unitInput}
              />
            </View>
            
            <Text style={styles.label}>Fitness Goal</Text>
            <View style={styles.optionsContainer}>
              {['muscle_gain', 'fat_loss', 'maintenance', 'competition_prep'].map(goal => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.optionButton,
                    formData.fitnessGoal === goal && styles.selectedOption
                  ]}
                  onPress={() => handleInputChange('fitnessGoal', goal as any)}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      formData.fitnessGoal === goal && styles.selectedOptionText
                    ]}
                  >
                    {renderGoalName(goal)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Experience Level</Text>
            <View style={styles.optionsContainer}>
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.optionButton,
                    formData.experienceLevel === level && styles.selectedOption
                  ]}
                  onPress={() => handleInputChange('experienceLevel', level as any)}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      formData.experienceLevel === level && styles.selectedOptionText
                    ]}
                  >
                    {renderExperienceName(level)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Input
              label="Training Days Per Week"
              value={formData.trainingDaysPerWeek?.toString()}
              onChangeText={(value) => handleInputChange('trainingDaysPerWeek', parseInt(value) || 0)}
              keyboardType="numeric"
            />
            
            <View style={styles.buttonRow}>
              <Button 
                title="Cancel" 
                variant="outline" 
                style={styles.cancelButton}
                onPress={() => setIsEditing(false)}
              />
              <Button 
                title="Save" 
                style={styles.saveButton}
                onPress={handleSaveProfile}
              />
            </View>
          </Card>
        ) : (
          <>
            <Card style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View>
                  <Text style={styles.profileName}>{supabaseProfile?.full_name || user?.email}</Text>
                  <Text style={styles.profileEmail}>{user?.email}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {supabaseProfile?.height_cm || 175} cm
                  </Text>
                  <Text style={styles.statLabel}>Height</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {weightEntries[0]?.weight_kg || 75} kg
                  </Text>
                  <Text style={styles.statLabel}>Weight</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {supabaseProfile?.goal ? renderGoalName(supabaseProfile.goal) : 'Not set'}
                  </Text>
                  <Text style={styles.statLabel}>Goal</Text>
                </View>
              </View>
              
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fitness Goal</Text>
                  <Text style={styles.detailValue}>
                    {profile?.fitnessGoal ? renderGoalName(profile.fitnessGoal) : ''}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Experience Level</Text>
                  <Text style={styles.detailValue}>
                    {profile?.experienceLevel ? renderExperienceName(profile.experienceLevel) : ''}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Training Days</Text>
                  <Text style={styles.detailValue}>{profile?.trainingDaysPerWeek} days/week</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Daily Calorie Goal</Text>
                  <Text style={styles.detailValue}>{profile?.calorieGoal} kcal</Text>
                </View>
              </View>
            </Card>
            
            {weightEntries.length > 1 && (
              <WeightProgressGraph />
            )}

            
            <Button 
              title="Logout" 
              variant="outline"
              style={styles.logoutButton}
              onPress={handleLogout}
            />
          </>
        )}
        </ScrollView>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 24,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginTop: 4,
  },
  editButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginTop: 4,
  },
  unitButton: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
  },
  unitButtonText: {
    fontSize: 12,
    color: Colors.dark.primary,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.dark.subtext,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  logoutButton: {
    marginBottom: 24,
  },
  editCard: {
    marginBottom: 24,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 16,
  },
  unitInput: {
    flex: 1,
    marginBottom: 0,
  },
  unitToggle: {
    backgroundColor: Colors.dark.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
  },
  unitToggleText: {
    color: Colors.dark.primary,
    fontSize: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 8,
    marginTop: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: Colors.dark.primary,
  },
  optionText: {
    color: Colors.dark.text,
  },
  selectedOptionText: {
    color: '#000',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
import { supabase } from './supabase';

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height_cm?: number;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  goal?: 'lose_weight' | 'maintain' | 'gain_weight' | 'build_muscle';
  created_at?: string;
  updated_at?: string;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  weight_kg: number;
  date: string;
  created_at: string;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number;
  sugar_per_100g?: number;
  sodium_per_100g?: number;
  fatsecret_id?: string;
}

export interface NutritionEntry {
  id: string;
  user_id: string;
  food_item_id: string;
  food_item?: FoodItem;
  quantity_grams: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment?: string;
  instructions?: string;
  image_url?: string;
}

export interface WorkoutTemplate {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  duration_minutes?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  is_public: boolean;
  exercises?: WorkoutTemplateExercise[];
}

export interface WorkoutTemplateExercise {
  id: string;
  template_id: string;
  exercise_id: string;
  exercise?: Exercise;
  sets?: number;
  reps?: string;
  weight_kg?: number;
  rest_seconds?: number;
  order_index?: number;
}

export interface Workout {
  id: string;
  user_id: string;
  template_id?: string;
  name: string;
  date: string;
  duration_minutes?: number;
  notes?: string;
  exercises?: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise?: Exercise;
  sets?: number;
  reps?: number[];
  weight_kg?: number[];
  rest_seconds?: number;
  order_index?: number;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  category?: string;
  tags?: string[];
  image_url?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CoachConversation {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  messages?: CoachMessage[];
}

export interface CoachMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Profile APIs
export const profileAPI = {
  async get(): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(profile: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Weight APIs
export const weightAPI = {
  async getAll(): Promise<WeightEntry[]> {
    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async add(weight: Omit<WeightEntry, 'id' | 'user_id' | 'created_at'>): Promise<WeightEntry> {
    const { data, error } = await supabase
      .from('weight_entries')
      .insert(weight)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('weight_entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Food APIs
export const foodAPI = {
  async search(query: string): Promise<FoodItem[]> {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
      .limit(20);
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<FoodItem | null> {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(foodItem: Omit<FoodItem, 'id'>): Promise<FoodItem> {
    const { data, error } = await supabase
      .from('food_items')
      .insert(foodItem)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Nutrition APIs
export const nutritionAPI = {
  async getByDate(date: string): Promise<NutritionEntry[]> {
    const { data, error } = await supabase
      .from('nutrition_entries')
      .select(`
        *,
        food_item:food_items(*)
      `)
      .eq('date', date)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async add(entry: Omit<NutritionEntry, 'id' | 'user_id' | 'created_at'>): Promise<NutritionEntry> {
    const { data, error } = await supabase
      .from('nutrition_entries')
      .insert(entry)
      .select(`
        *,
        food_item:food_items(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('nutrition_entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Exercise APIs
export const exerciseAPI = {
  async getAll(): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('muscle_group', muscleGroup)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },
};

// Workout Template APIs
export const workoutTemplateAPI = {
  async getAll(): Promise<WorkoutTemplate[]> {
    const { data, error } = await supabase
      .from('workout_templates')
      .select(`
        *,
        workout_template_exercises(
          *,
          exercise:exercises(*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(template: Omit<WorkoutTemplate, 'id' | 'created_at'>): Promise<WorkoutTemplate> {
    const { data, error } = await supabase
      .from('workout_templates')
      .insert(template)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Workout APIs
export const workoutAPI = {
  async getAll(): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises(
          *,
          exercise:exercises(*)
        )
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(workout: Omit<Workout, 'id' | 'user_id' | 'created_at'>): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .insert(workout)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Article APIs
export const articleAPI = {
  async getPublished(): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Coach APIs
export const coachAPI = {
  async getConversations(): Promise<CoachConversation[]> {
    const { data, error } = await supabase
      .from('coach_conversations')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createConversation(title?: string): Promise<CoachConversation> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Check if profile exists, create if not
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          });
        
        if (createError) {
          console.error('Error creating profile:', createError);
        }
      }

      // Now create the conversation
      const { data, error } = await supabase
        .from('coach_conversations')
        .insert({ 
          user_id: user.id,
          title: title || 'New Chat'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in createConversation:', error);
      throw error;
    }
  },

  async getMessages(conversationId: string): Promise<CoachMessage[]> {
    const { data, error } = await supabase
      .from('coach_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<CoachMessage> {
    const { data, error } = await supabase
      .from('coach_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};
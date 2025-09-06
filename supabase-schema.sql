-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_cm REAL,
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')),
  goal TEXT CHECK (goal IN ('lose_weight', 'maintain', 'gain_weight', 'build_muscle')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weight tracking
CREATE TABLE public.weight_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  weight_kg REAL NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food items
CREATE TABLE public.food_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  calories_per_100g REAL NOT NULL,
  protein_per_100g REAL DEFAULT 0,
  carbs_per_100g REAL DEFAULT 0,
  fat_per_100g REAL DEFAULT 0,
  fiber_per_100g REAL DEFAULT 0,
  sugar_per_100g REAL DEFAULT 0,
  sodium_per_100g REAL DEFAULT 0,
  fatsecret_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nutrition entries (daily food logs)
CREATE TABLE public.nutrition_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
  quantity_grams REAL NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplements
CREATE TABLE public.supplements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  type TEXT,
  dosage TEXT,
  frequency TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User supplements (tracking which supplements user takes)
CREATE TABLE public.user_supplements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  supplement_id UUID REFERENCES public.supplements(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, supplement_id)
);

-- Exercises
CREATE TABLE public.exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT,
  instructions TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout templates
CREATE TABLE public.workout_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout template exercises (junction table)
CREATE TABLE public.workout_template_exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  sets INTEGER,
  reps TEXT,
  weight_kg REAL,
  rest_seconds INTEGER,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Completed workouts
CREATE TABLE public.workouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.workout_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout exercises (actual performed exercises)
CREATE TABLE public.workout_exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  sets INTEGER,
  reps INTEGER[],
  weight_kg REAL[],
  rest_seconds INTEGER,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog articles
CREATE TABLE public.articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT,
  category TEXT,
  tags TEXT[],
  image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CoachGPT conversations
CREATE TABLE public.coach_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CoachGPT messages
CREATE TABLE public.coach_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.coach_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Weight entries policies
CREATE POLICY "Users can view own weight entries" ON public.weight_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight entries" ON public.weight_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight entries" ON public.weight_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight entries" ON public.weight_entries FOR DELETE USING (auth.uid() = user_id);

-- Nutrition entries policies
CREATE POLICY "Users can view own nutrition entries" ON public.nutrition_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition entries" ON public.nutrition_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nutrition entries" ON public.nutrition_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nutrition entries" ON public.nutrition_entries FOR DELETE USING (auth.uid() = user_id);

-- User supplements policies
CREATE POLICY "Users can view own supplements" ON public.user_supplements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own supplements" ON public.user_supplements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own supplements" ON public.user_supplements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own supplements" ON public.user_supplements FOR DELETE USING (auth.uid() = user_id);

-- Workout templates policies (users can see public templates or their own)
CREATE POLICY "Users can view public templates or own templates" ON public.workout_templates FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON public.workout_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.workout_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.workout_templates FOR DELETE USING (auth.uid() = user_id);

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON public.workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON public.workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON public.workouts FOR DELETE USING (auth.uid() = user_id);

-- Workout exercises policies (inherit from workout)
CREATE POLICY "Users can view own workout exercises" ON public.workout_exercises FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid())
);
CREATE POLICY "Users can insert own workout exercises" ON public.workout_exercises FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid())
);
CREATE POLICY "Users can update own workout exercises" ON public.workout_exercises FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid())
);
CREATE POLICY "Users can delete own workout exercises" ON public.workout_exercises FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid())
);

-- Coach conversations policies
CREATE POLICY "Users can view own conversations" ON public.coach_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.coach_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.coach_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.coach_conversations FOR DELETE USING (auth.uid() = user_id);

-- Coach messages policies (inherit from conversation)
CREATE POLICY "Users can view own conversation messages" ON public.coach_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.coach_conversations WHERE coach_conversations.id = coach_messages.conversation_id AND coach_conversations.user_id = auth.uid())
);
CREATE POLICY "Users can insert own conversation messages" ON public.coach_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.coach_conversations WHERE coach_conversations.id = coach_messages.conversation_id AND coach_conversations.user_id = auth.uid())
);

-- Public tables (no RLS needed)
-- food_items, exercises, supplements (global), articles are public

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coach_conversations_updated_at BEFORE UPDATE ON public.coach_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
# RORK Bodybuilding & Fitness App - Setup Guide

This guide will help you set up the complete backend infrastructure and configure all the necessary APIs for the RORK Bodybuilding & Fitness app.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- A Supabase account
- An OpenAI account (for CoachGPT)
- A FatSecret Platform API account (for nutrition tracking)

## 1. Install Dependencies

First, install the required dependencies:

```bash
npm install @supabase/supabase-js openai expo-secure-store --legacy-peer-deps
```

If you encounter permission issues with npm, you can try:
```bash
sudo chown -R $(whoami) ~/.npm
```

## 2. Supabase Setup

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in and create a new project
3. Wait for the project to be fully set up

### 2.2 Run Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql` from this project
3. Paste and run the SQL to create all necessary tables and policies

### 2.3 Configure Environment Variables

1. Copy `.env.example` to `.env`
2. In your Supabase dashboard, go to Settings > API
3. Copy your project URL and anon key
4. Update your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2.4 Enable Authentication

1. In Supabase dashboard, go to Authentication > Settings
2. Enable email authentication
3. Optionally configure OAuth providers (Google, Apple, etc.)

## 3. OpenAI API Setup (For CoachGPT)

### 3.1 Get API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in to your account
3. Navigate to API keys section
4. Create a new secret key
5. Copy the key (starts with `sk-`)

### 3.2 Configure in App

1. Run the app and navigate to Profile > API Settings
2. Enter your OpenAI API key
3. The key will be securely stored in your device

## 4. FatSecret API Setup (For Enhanced Nutrition)

### 4.1 Get API Credentials

1. Go to [platform.fatsecret.com](https://platform.fatsecret.com)
2. Create a developer account
3. Create a new application
4. Copy your Client ID and Client Secret

### 4.2 Configure in App

1. In the app, go to Profile > API Settings
2. Enter your FatSecret Client ID and Client Secret
3. The credentials will be securely stored

## 5. Running the App

### 5.1 Start Development Server

```bash
npm start
```

### 5.2 Test the App

1. Open Expo Go on your device or use simulator
2. Create an account or sign in
3. Test all features:
   - User authentication
   - Profile management
   - Nutrition tracking
   - Workout logging
   - CoachGPT chat
   - Weight tracking

## 6. Populating Initial Data

### 6.1 Add Sample Food Items

You can add food items directly in Supabase or through the app's nutrition section.

### 6.2 Add Exercises

```sql
-- Insert some sample exercises
INSERT INTO public.exercises (name, muscle_group, equipment, instructions) VALUES
('Bench Press', 'Chest', 'Barbell', 'Lie on bench, grip bar wider than shoulders, lower to chest, press up'),
('Squat', 'Legs', 'Barbell', 'Stand with feet shoulder-width apart, lower hips back and down, return to standing'),
('Deadlift', 'Back', 'Barbell', 'Stand with feet hip-width apart, hinge at hips, grip bar, stand up'),
('Pull-ups', 'Back', 'Pull-up Bar', 'Hang from bar, pull body up until chin clears bar, lower with control');
```

### 6.3 Add Sample Articles

```sql
-- Insert sample blog articles
INSERT INTO public.articles (title, content, excerpt, author, category, is_published, published_at) VALUES
('The Science of Progressive Overload', 'Progressive overload is the foundation of muscle growth...', 'Learn how to progressively increase training stimulus', 'RORK Team', 'Training', true, NOW()),
('Nutrition for Muscle Gain', 'Building muscle requires proper nutrition...', 'Complete guide to eating for muscle growth', 'RORK Team', 'Nutrition', true, NOW());
```

## 7. Testing Features

### 7.1 Authentication
- Sign up with email
- Sign in/out
- Profile creation

### 7.2 Nutrition Tracking
- Search for foods (local database + FatSecret API)
- Log meals
- Track macronutrients
- Add custom foods

### 7.3 Workout Tracking
- Browse exercises
- Create workout templates
- Log workouts
- Track progress

### 7.4 CoachGPT
- Start conversations
- Ask fitness questions
- Get personalized advice

### 7.5 Weight Tracking
- Log weight entries
- View progress graphs
- Set goals

## 8. Troubleshooting

### Common Issues

1. **Supabase connection errors**
   - Check your environment variables
   - Verify project URL and API key
   - Ensure Row Level Security policies are correct

2. **OpenAI API errors**
   - Verify API key is correct
   - Check API usage limits
   - Ensure you have credits in your OpenAI account

3. **FatSecret API errors**
   - Verify Client ID and Secret
   - Check API rate limits
   - Ensure app is approved for production

4. **Authentication issues**
   - Check Supabase Auth settings
   - Verify email confirmation if required
   - Check network connectivity

### Getting Help

- Check Supabase documentation: [docs.supabase.com](https://docs.supabase.com)
- OpenAI API docs: [platform.openai.com/docs](https://platform.openai.com/docs)
- FatSecret API docs: [platform.fatsecret.com/api](https://platform.fatsecret.com/api)

## 9. Production Deployment

### 9.1 Environment Configuration

For production, you'll need to:

1. Set up production Supabase project
2. Configure proper authentication redirects
3. Set up proper error handling and logging
4. Implement API key management through secure backend
5. Set up monitoring and analytics

### 9.2 Security Considerations

- Never expose API keys in client code for production
- Implement proper rate limiting
- Use environment-specific configurations
- Enable proper CORS settings
- Implement proper error handling

## Features Implemented

✅ **Backend Infrastructure**
- Supabase database with complete schema
- User authentication and profiles
- Row Level Security (RLS) policies
- Real-time data synchronization

✅ **User Management**
- Email authentication
- Profile creation and management
- Secure session handling

✅ **Nutrition Tracking**
- Food database integration
- FatSecret API integration
- Meal logging and macro tracking
- Custom food creation

✅ **Workout Management**
- Exercise database
- Workout templates
- Progress tracking
- Custom workout creation

✅ **CoachGPT AI Assistant**
- OpenAI GPT-4 integration
- Fitness-focused conversation
- Personalized advice
- Chat history storage

✅ **Weight Tracking**
- Progress logging
- Historical data
- Visual progress graphs

✅ **Blog/Education System**
- Article management
- Content categorization
- Dynamic content loading

✅ **API Integration**
- Secure API key storage
- Error handling
- Fallback mechanisms

The app is now fully dynamic with no hardcoded data, using Supabase for all backend operations and external APIs for enhanced functionality.
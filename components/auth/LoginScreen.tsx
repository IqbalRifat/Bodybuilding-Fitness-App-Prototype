import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, Mail, Lock, User } from 'lucide-react-native';
import { useAuth } from './AuthProvider';
import Colors from '@/constants/colors';

interface LoginScreenProps {
  onToggleMode: () => void;
  isSignUp: boolean;
}

export function LoginScreen({ onToggleMode, isSignUp }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password || (isSignUp && !fullName)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = isSignUp 
      ? await signUp(email, password, fullName)
      : await signIn(email, password);

    if (error) {
      Alert.alert('Error', error.message);
    } else if (isSignUp) {
      Alert.alert('Success', 'Please check your email to confirm your account');
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={[Colors.dark.background, '#1a1a1a', Colors.dark.background]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Dumbbell size={48} color={Colors.dark.primary} />
          </View>
          <Text style={styles.title}>WIRA</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Start Your Fitness Journey' : 'Welcome Back, Champion'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {isSignUp && (
            <View style={styles.inputContainer}>
              <User size={20} color={Colors.dark.subtext} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={Colors.dark.subtext}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.dark.subtext} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.dark.subtext}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.dark.subtext} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.dark.subtext}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient
              colors={[Colors.dark.primary, '#e6ff00']}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onToggleMode} style={styles.toggleButton}>
            <Text style={styles.toggleText}>
              {isSignUp 
                ? 'Already have an account? ' 
                : "Don't have an account? "
              }
              <Text style={styles.toggleLink}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Transform your body, elevate your mind
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
    paddingVertical: 16,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  toggleText: {
    fontSize: 16,
    color: Colors.dark.subtext,
  },
  toggleLink: {
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    fontStyle: 'italic',
  },
});
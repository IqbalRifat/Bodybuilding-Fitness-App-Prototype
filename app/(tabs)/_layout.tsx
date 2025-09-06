import React from "react";
import { Tabs } from "expo-router";
import { Home, Dumbbell, BookOpen, User, MessageSquare } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/components/auth/AuthProvider";
import Colors from "@/constants/colors";

export default function TabLayout() {
  const { user } = useAuth();

  const CoachButton = () => (
    <TouchableOpacity
      onPress={() => router.push('/coach')}
      className="mr-4"
    >
      <MessageSquare size={24} color={Colors.dark.primary} />
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.primary,
        tabBarInactiveTintColor: Colors.dark.subtext,
        tabBarStyle: {
          backgroundColor: Colors.dark.background,
          borderTopColor: Colors.dark.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.dark.background,
        },
        headerTintColor: Colors.dark.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: user ? () => <CoachButton /> : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Nutrition",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout",
          tabBarIcon: ({ color }) => <Dumbbell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: "Learn",
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
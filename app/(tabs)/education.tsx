import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArticleCard } from '@/components/education/ArticleCard';
import Colors from '@/constants/colors';
import { articles } from '@/mocks/articles';

export default function EducationScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const handleArticlePress = (articleId: string) => {
    router.push({
      pathname: '/education/article',
      params: { id: articleId }
    });
  };
  
  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category.toLowerCase() === selectedCategory.toLowerCase());
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Learn</Text>
        <Text style={styles.subtitle}>Latest research and bodybuilding knowledge</Text>
        
        <View style={styles.categoriesContainer}>
          <TouchableOpacity 
            style={[
              styles.categoryButton,
              selectedCategory === 'all' ? styles.activeCategoryButton : styles.inactiveCategory
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === 'all' ? styles.activeCategoryText : styles.inactiveCategoryText
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.categoryButton,
              selectedCategory === 'science' ? styles.activeCategoryButton : styles.inactiveCategory
            ]}
            onPress={() => setSelectedCategory('science')}
          >
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === 'science' ? styles.activeCategoryText : styles.inactiveCategoryText
              ]}
            >
              Science
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.categoryButton,
              selectedCategory === 'nutrition' ? styles.activeCategoryButton : styles.inactiveCategory
            ]}
            onPress={() => setSelectedCategory('nutrition')}
          >
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === 'nutrition' ? styles.activeCategoryText : styles.inactiveCategoryText
              ]}
            >
              Nutrition
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.categoryButton,
              selectedCategory === 'training' ? styles.activeCategoryButton : styles.inactiveCategory
            ]}
            onPress={() => setSelectedCategory('training')}
          >
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === 'training' ? styles.activeCategoryText : styles.inactiveCategoryText
              ]}
            >
              Training
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'all' ? 'Featured Articles' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Articles`}
        </Text>
        
        {filteredArticles.length > 0 ? (
          filteredArticles.map(article => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              onPress={() => handleArticlePress(article.id)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No articles found in this category</Text>
        )}
      </ScrollView>
    </SafeAreaView>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
    marginBottom: 24,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeCategoryButton: {
    backgroundColor: Colors.dark.primary,
  },
  inactiveCategory: {
    backgroundColor: '#2A2A2A',
  },
  categoryText: {
    fontWeight: '600',
  },
  activeCategoryText: {
    color: '#000',
  },
  inactiveCategoryText: {
    color: Colors.dark.text,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  emptyText: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginTop: 24,
  },
});
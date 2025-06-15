import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { articles } from '@/mocks/articles';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const article = articles.find(a => a.id === id);
  
  if (!article) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Article not found</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image 
        source={{ uri: article.imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.articleContent}>
        <View style={styles.metaRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
          <Text style={styles.readTime}>{article.readTime}</Text>
        </View>
        
        <Text style={styles.title}>{article.title}</Text>
        
        <View style={styles.authorRow}>
          <Text style={styles.author}>By {article.author}</Text>
          <Text style={styles.date}>{article.date}</Text>
        </View>
        
        <Text style={styles.paragraph}>
          The science of muscle hypertrophy is a fascinating field that continues to evolve as researchers uncover new insights into how our bodies adapt to resistance training. At its core, muscle growth occurs when muscle protein synthesis exceeds muscle protein breakdown over time, resulting in a net increase in muscle protein content.
        </Text>
        
        <Text style={styles.subheading}>Mechanical Tension</Text>
        <Text style={styles.paragraph}>
          Research has consistently shown that mechanical tension is the primary driver of muscle growth. When you lift weights, you create tension in your muscles, which triggers a cascade of signaling events that ultimately lead to muscle protein synthesis. This is why progressive overload—gradually increasing the weight, reps, or sets over time—is crucial for continued muscle growth.
        </Text>
        
        <Text style={styles.subheading}>Metabolic Stress</Text>
        <Text style={styles.paragraph}>
          Metabolic stress refers to the accumulation of metabolites like lactate, hydrogen ions, and creatine during resistance training. This "pump" effect contributes to muscle growth through various mechanisms, including increased cell swelling, elevated hormone production, and enhanced intracellular signaling.
        </Text>
        
        <Text style={styles.subheading}>Muscle Damage</Text>
        <Text style={styles.paragraph}>
          Exercise-induced muscle damage, particularly from eccentric contractions (lowering the weight), can stimulate muscle growth by activating satellite cells—muscle stem cells that fuse with existing muscle fibers to contribute their nuclei, enhancing the muscle's capacity for protein synthesis.
        </Text>
        
        <Text style={styles.subheading}>Practical Applications</Text>
        <Text style={styles.paragraph}>
          To optimize muscle growth, your training program should incorporate strategies that maximize these three mechanisms. This includes using a variety of rep ranges (from low to high), incorporating both compound and isolation exercises, and ensuring adequate recovery between training sessions.
        </Text>
        
        <Text style={styles.paragraph}>
          Remember that individual responses to training can vary significantly based on genetics, training history, nutrition, and recovery capacity. What works best for one person may not be optimal for another, so it's important to experiment and find what works best for your body.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    paddingBottom: 24,
  },
  image: {
    width: '100%',
    height: 250,
  },
  articleContent: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  categoryText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 12,
  },
  readTime: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
    lineHeight: 32,
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  author: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  date: {
    fontSize: 16,
    color: Colors.dark.subtext,
  },
  subheading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: Colors.dark.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: Colors.dark.text,
    textAlign: 'center',
    marginTop: 24,
  },
});
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Colors from '@/constants/colors';

interface Article {
  id: string;
  title: string;
  summary: string;
  author: string;
  date: string;
  imageUrl: string;
  category: string;
  readTime: string;
}

interface ArticleCardProps {
  article: Article;
  onPress: () => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: article.imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
          <Text style={styles.readTime}>{article.readTime}</Text>
        </View>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.summary} numberOfLines={2}>
          {article.summary}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.author}>{article.author}</Text>
          <Text style={styles.date}>{article.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  author: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
});
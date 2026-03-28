import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, MessageSquare } from 'lucide-react-native';
import { useAuth } from '@/components/auth/AuthProvider';
import { coachAPI, CoachConversation, CoachMessage } from '@/lib/api';
import { coachGPTService } from '@/lib/openai';
import Colors from '@/constants/colors';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function CoachScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<CoachConversation | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (user) {
      initializeCoach();
    }
  }, [user]);

  const initializeCoach = async () => {
    try {
      await coachGPTService.initialize();
      
      if (!coachGPTService.isConfigured()) {
        Alert.alert(
          'Service Unavailable',
          'CoachGPT is currently unavailable. Please try again later.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Show welcome message immediately
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: 'Hi! I\'m CoachGPT, your AI fitness coach. I\'m here to help you with workout programming, nutrition advice, and achieving your fitness goals. What would you like to know?',
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);

      // Try to create conversation in background
      createNewConversation();
    } catch (error) {
      console.error('Error initializing coach:', error);
      // If there's an error, still show the welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: 'Hi! I\'m CoachGPT, your AI fitness coach. I\'m here to help you with workout programming, nutrition advice, and achieving your fitness goals. What would you like to know?',
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const createNewConversation = async () => {
    try {
      const newConversation = await coachAPI.createConversation('New Chat');
      setConversation(newConversation);
      console.log('Conversation created successfully:', newConversation.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Don't show alert since chat still works without conversation storage
      // The conversation will be created when user sends first message if needed
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const coachMessages = await coachAPI.getMessages(conversationId);
      const formattedMessages: Message[] = coachMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
      }));
      
      if (formattedMessages.length === 0) {
        // Add welcome message if no messages exist
        const welcomeMessage: Message = {
          id: 'welcome',
          role: 'assistant',
          content: 'Hi! I\'m CoachGPT, your AI fitness coach. I\'m here to help you with workout programming, nutrition advice, and achieving your fitness goals. What would you like to know?',
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Try to save user message if conversation exists
      if (conversation) {
        try {
          await coachAPI.addMessage(conversation.id, 'user', userMessage.content);
        } catch (error) {
          console.warn('Failed to save user message:', error);
        }
      }

      // Get AI response
      const chatHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const aiResponse = await coachGPTService.generateResponse(chatHistory);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Try to save assistant message if conversation exists
      if (conversation) {
        try {
          await coachAPI.addMessage(conversation.id, 'assistant', aiResponse);
        } catch (error) {
          console.warn('Failed to save assistant message:', error);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to get response from CoachGPT. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.assistantMessage
      ]}>
        <View style={[
          styles.messageBubble,
          { backgroundColor: isUser ? Colors.dark.primary : Colors.dark.card }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isUser ? 'white' : Colors.dark.text }
          ]}>
            {item.content}
          </Text>
        </View>
        <Text style={[styles.timestamp, { color: Colors.dark.subtext }]}>
          {new Date(item.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <MessageSquare size={48} color={Colors.dark.subtext} />
        <Text style={[styles.emptyText, { color: Colors.dark.subtext }]}>
          Please sign in to use CoachGPT
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything about fitness..."
            placeholderTextColor={Colors.dark.subtext}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? Colors.dark.primary : Colors.dark.neutral }
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: Colors.dark.subtext }]}>
              CoachGPT is thinking...
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.dark.card,
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.dark.text,
    backgroundColor: Colors.dark.background,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View,
  useColorScheme
} from 'react-native';
import Colors from '@/constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'neutral' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  style,
  textStyle,
  icon,
  ...props
}) => {
  const colorScheme = useColorScheme() || 'dark';
  const colors = Colors[colorScheme];

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary };
      case 'secondary':
        return { backgroundColor: colors.secondary };
      case 'neutral':
        return { backgroundColor: colors.neutral };
      case 'outline':
        return { 
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary
        };
      case 'text':
        return { backgroundColor: 'transparent' };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return { color: '#FFFFFF' };
      case 'secondary':
        return { color: colorScheme === 'dark' ? '#111111' : '#FFFFFF' };
      case 'neutral':
        return { color: colors.neutralText };
      case 'outline':
        return { color: colors.primary };
      case 'text':
        return { color: colors.primary };
      default:
        return { color: '#FFFFFF' };
    }
  };

  const buttonStyles = [
    styles.button,
    styles[`${size}Button`],
    getButtonStyle(),
    props.disabled && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    getTextStyle(),
    props.disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'text' ? colors.primary : '#FFFFFF'} 
          size="small" 
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.8,
  },
  
  // Sizes
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  smallText: {
    fontSize: 14,
  },
  
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  mediumText: {
    fontSize: 16,
  },
  
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  largeText: {
    fontSize: 18,
  },
});
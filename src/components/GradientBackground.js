import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const GradientBackground = ({ children, style, variant = 'primary' }) => {
  const { theme, isDarkMode } = useTheme();

  const getGradientColors = () => {
    if (variant === 'primary') {
      return isDarkMode
        ? [theme.colors.background, theme.colors.surface]
        : [theme.colors.background, theme.colors.surfaceVariant];
    }

    if (variant === 'accent') {
      return isDarkMode
        ? [theme.colors.primary, theme.colors.primaryDark]
        : [theme.colors.primary, theme.colors.primaryVariant];
    }

    if (variant === 'subtle') {
      return isDarkMode
        ? [theme.colors.surface, theme.colors.surfaceVariant]
        : [theme.colors.surface, theme.colors.background];
    }

    return [theme.colors.background, theme.colors.surface];
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={[styles.gradient, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default GradientBackground;
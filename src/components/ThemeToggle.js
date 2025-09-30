import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ size = 60 }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const animatedValue = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isDarkMode ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [isDarkMode]);

  const backgroundColorInterpolation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.surfaceVariant, theme.colors.primary],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, size - 24],
  });

  const sunOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const moonOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[
        styles.container,
        {
          width: size,
          height: size / 2,
          backgroundColor: backgroundColorInterpolation,
        },
      ]}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX }],
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        {/* Sun Icon */}
        <Animated.View style={[styles.icon, { opacity: sunOpacity }]}>
          <View style={[styles.sun, { backgroundColor: '#FED065' }]} />
          {[...Array(8)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.sunRay,
                {
                  backgroundColor: '#FED065',
                  transform: [{ rotate: `${i * 45}deg` }],
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Moon Icon */}
        <Animated.View style={[styles.icon, { opacity: moonOpacity }]}>
          <View style={[styles.moon, { backgroundColor: '#E5E7EB' }]} />
          <View style={[styles.moonCrater, { backgroundColor: '#D1D5DB' }]} />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  icon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sun: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sunRay: {
    position: 'absolute',
    width: 1,
    height: 3,
    borderRadius: 0.5,
  },
  moon: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  moonCrater: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    top: 2,
    right: 2,
  },
});

export default ThemeToggle;
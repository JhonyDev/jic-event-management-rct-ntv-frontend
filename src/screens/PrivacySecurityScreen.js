import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import appContentService from '../services/appContentService';
import { useTheme } from '../context/ThemeContext';

const PrivacySecurityScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const data = await appContentService.getPrivacyPolicy();
      setContent(data);
    } catch (error) {
      console.error('Error loading privacy policy:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContent();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />
        <View style={styles.centered}>
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {content ? (
          <View style={[styles.contentContainer, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>{content.title}</Text>
            <Text style={[styles.version, { color: theme.colors.primary }]}>Version {content.version}</Text>
            <Text style={[styles.lastUpdated, { color: theme.colors.onSurfaceVariant }]}>
              Last updated: {new Date(content.last_updated).toLocaleDateString()}
            </Text>
            <Text style={[styles.contentText, { color: theme.colors.onSurfaceVariant }]}>{content.content}</Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="shield-lock-outline" size={64} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyTitle, { color: theme.colors.onSurfaceVariant }]}>No Content Available</Text>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              Privacy policy content is not available at the moment.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
    marginBottom: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PrivacySecurityScreen;
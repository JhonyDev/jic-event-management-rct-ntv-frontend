import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';

import {
  CalendarAccountIcon,
  EarthIcon,
  EmailIcon,
  UpdateIcon,
  CalendarCheckIcon,
  BellIcon,
  AccountCircleIcon,
  RefreshIcon,
  CameraIcon,
  CopyrightIcon,
  HeartIcon,
} from '../components/SvgIcons';
import appContentService from '../services/appContentService';
import { useTheme } from '../context/ThemeContext';

const AboutScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const data = await appContentService.getAbout();
      setContent(data);
    } catch (error) {
      console.error('Error loading about content:', error);
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
        <View style={[styles.logoSection, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <CalendarAccountIcon size={80} color={theme.colors.onBackground} />
          </View>
          <Text style={[styles.appName, { color: theme.colors.onSurface }]}>JIC Event Management</Text>
          <Text style={[styles.appVersion, { color: theme.colors.onSurfaceVariant }]}>Version 1.0.0</Text>
        </View>

        {content ? (
          <View style={[styles.contentContainer, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>{content.title}</Text>
            <Text style={[styles.contentText, { color: theme.colors.onSurfaceVariant }]}>{content.content}</Text>
          </View>
        ) : (
          <View style={[styles.contentContainer, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>About JIC Events</Text>
            <Text style={[styles.contentText, { color: theme.colors.onSurfaceVariant }]}>
              JIC Event Management is your comprehensive solution for discovering, registering, and managing events.
              Stay connected with the latest events, get real-time announcements, and manage your profile seamlessly.
            </Text>
          </View>
        )}

        <View style={[styles.infoSection, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
          <View style={styles.infoItem}>
            <EarthIcon size={24} color={theme.colors.onBackground} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Website</Text>
              <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>www.jic-events.com</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <EmailIcon size={24} color={theme.colors.onBackground} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Support</Text>
              <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>support@jic-events.com</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <UpdateIcon size={24} color={theme.colors.onBackground} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Last Updated</Text>
              <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {content ? new Date(content.last_updated).toLocaleDateString() : 'Recently'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.featuresSection, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
          <Text style={[styles.featuresTitle, { color: theme.colors.onSurface }]}>Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <CalendarCheckIcon size={20} color="#10B981" />
              <Text style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>Event Discovery & Registration</Text>
            </View>
            <View style={styles.featureItem}>
              <BellIcon size={20} color="#10B981" />
              <Text style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>Real-time Announcements</Text>
            </View>
            <View style={styles.featureItem}>
              <AccountCircleIcon size={20} color="#10B981" />
              <Text style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>Profile Management</Text>
            </View>
            <View style={styles.featureItem}>
              <RefreshIcon size={20} color="#10B981" />
              <Text style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>Pull-to-Refresh Updates</Text>
            </View>
            <View style={styles.featureItem}>
              <CameraIcon size={20} color="#10B981" />
              <Text style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>Profile Photo Upload</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerSection}>
          <View style={styles.copyrightContainer}>
            <CopyrightIcon size={14} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>2025 JIC Event Management. All rights reserved.</Text>
          </View>
          <View style={styles.footerIconContainer}>
            <Text style={[styles.footerSubtext, { color: theme.colors.onSurfaceVariant }]}>Built with </Text>
            <HeartIcon size={14} color="#EF4444" filled={true} />
            <Text style={[styles.footerSubtext, { color: theme.colors.onSurfaceVariant }]}> for seamless event management</Text>
          </View>
        </View>
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
  logoSection: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
  },
  contentContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoSection: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  featuresSection: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
  },
  footerSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    marginLeft: 6,
  },
  copyrightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  footerIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default AboutScreen;
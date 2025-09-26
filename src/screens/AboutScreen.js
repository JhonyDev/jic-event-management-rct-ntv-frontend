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
  Image,
} from 'react-native';

import {
  ArrowLeftIcon,
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

const AboutScreen = ({ navigation }) => {
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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeftIcon size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A6CF7']}
            tintColor="#4A6CF7"
          />
        }
      >
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <CalendarAccountIcon size={80} color="#4A6CF7" />
          </View>
          <Text style={styles.appName}>JIC Event Management</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        {content ? (
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.contentText}>{content.content}</Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <Text style={styles.title}>About JIC Events</Text>
            <Text style={styles.contentText}>
              JIC Event Management is your comprehensive solution for discovering, registering, and managing events.
              Stay connected with the latest events, get real-time announcements, and manage your profile seamlessly.
            </Text>
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <EarthIcon size={24} color="#4A6CF7" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Website</Text>
              <Text style={styles.infoValue}>www.jic-events.com</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <EmailIcon size={24} color="#4A6CF7" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Support</Text>
              <Text style={styles.infoValue}>support@jic-events.com</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <UpdateIcon size={24} color="#4A6CF7" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>
                {content ? new Date(content.last_updated).toLocaleDateString() : 'Recently'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <CalendarCheckIcon size={20} color="#10B981" />
              <Text style={styles.featureText}>Event Discovery & Registration</Text>
            </View>
            <View style={styles.featureItem}>
              <BellIcon size={20} color="#10B981" />
              <Text style={styles.featureText}>Real-time Announcements</Text>
            </View>
            <View style={styles.featureItem}>
              <AccountCircleIcon size={20} color="#10B981" />
              <Text style={styles.featureText}>Profile Management</Text>
            </View>
            <View style={styles.featureItem}>
              <RefreshIcon size={20} color="#10B981" />
              <Text style={styles.featureText}>Pull-to-Refresh Updates</Text>
            </View>
            <View style={styles.featureItem}>
              <CameraIcon size={20} color="#10B981" />
              <Text style={styles.featureText}>Profile Photo Upload</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerSection}>
          <View style={styles.copyrightContainer}>
            <CopyrightIcon size={14} color="#6B7280" />
            <Text style={styles.footerText}>2025 JIC Event Management. All rights reserved.</Text>
          </View>
          <View style={styles.footerIconContainer}>
            <Text style={styles.footerSubtext}>Built with </Text>
            <HeartIcon size={14} color="#EF4444" filled={true} />
            <Text style={styles.footerSubtext}> for seamless event management</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    color: '#6B7280',
  },
  contentContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  featuresSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
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
    color: '#374151',
    marginLeft: 12,
  },
  footerSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
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
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default AboutScreen;
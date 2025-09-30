import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import announcementService from '../services/announcementService';
import { useTheme } from '../context/ThemeContext';

const AnnouncementsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await announcementService.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      urgent: { name: 'alert', color: '#EF4444' },
      high: { name: 'alert-circle', color: '#F59E0B' },
      medium: { name: 'information', color: '#3B82F6' },
      low: { name: 'information-outline', color: '#6B7280' },
    };
    return icons[priority] || icons.medium;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      urgent: 'URGENT',
      high: 'HIGH',
      medium: 'MEDIUM',
      low: 'LOW',
    };
    return labels[priority] || 'MEDIUM';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderAnnouncement = ({ item }) => {
    const priorityConfig = getPriorityIcon(item.priority);

    return (
      <TouchableOpacity style={[styles.announcementCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]} activeOpacity={0.8}>
        <View style={styles.announcementHeader}>
          <View style={styles.prioritySection}>
            <Icon
              name={priorityConfig.name}
              size={20}
              color={priorityConfig.color}
            />
            <Text style={[styles.priorityLabel, { color: priorityConfig.color }]}>
              {getPriorityLabel(item.priority)}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>{formatDate(item.created_at)}</Text>
        </View>

        <Text style={[styles.announcementTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>
        <Text style={[styles.announcementContent, { color: theme.colors.onSurfaceVariant }]}>{item.content}</Text>

        {item.event_title && (
          <View style={styles.eventSection}>
            <Icon name="calendar" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.eventTitle, { color: theme.colors.onSurfaceVariant }]}>{item.event_title}</Text>
          </View>
        )}

        {item.author_name && (
          <Text style={[styles.authorText, { color: theme.colors.onSurfaceVariant }]}>By {item.author_name}</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />
        <View style={styles.centered}>
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>Loading announcements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />

      <FlatList
        data={announcements}
        renderItem={renderAnnouncement}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bullhorn-outline" size={64} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyTitle, { color: theme.colors.onSurfaceVariant }]}>No Announcements</Text>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              You'll see announcements for your registered events here
            </Text>
          </View>
        }
      />
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
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  announcementCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prioritySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  dateText: {
    fontSize: 12,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  announcementContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  eventSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 14,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  authorText: {
    fontSize: 12,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
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

export default AnnouncementsScreen;
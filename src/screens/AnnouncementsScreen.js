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

const AnnouncementsScreen = ({ navigation }) => {
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
      <TouchableOpacity style={styles.announcementCard} activeOpacity={0.8}>
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
          <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        </View>

        <Text style={styles.announcementTitle}>{item.title}</Text>
        <Text style={styles.announcementContent}>{item.content}</Text>

        {item.event_title && (
          <View style={styles.eventSection}>
            <Icon name="calendar" size={16} color="#6B7280" />
            <Text style={styles.eventTitle}>{item.event_title}</Text>
          </View>
        )}

        {item.author_name && (
          <Text style={styles.authorText}>By {item.author_name}</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading announcements...</Text>
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
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Announcements</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={announcements}
        renderItem={renderAnnouncement}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A6CF7']}
            tintColor="#4A6CF7"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bullhorn-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Announcements</Text>
            <Text style={styles.emptyText}>
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
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  announcementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    color: '#6B7280',
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  announcementContent: {
    fontSize: 16,
    color: '#374151',
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
    color: '#6B7280',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  authorText: {
    fontSize: 12,
    color: '#9CA3AF',
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
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AnnouncementsScreen;
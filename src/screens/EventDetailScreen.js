import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { QuickActionCard } from '../components/Cards';
import {
  CalendarIcon,
  LocationIcon,
  ClockIcon,
  UsersIcon,
  InfoCircleIcon,
  AgendaIcon,
  SpeakersIcon,
  MapIcon,
} from '../components/SvgIcons';
import eventService from '../services/eventService';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const data = await eventService.getEvent(eventId);
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEventDetails();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleEventInfoPress = () => {
    navigation.navigate('EventInfo', { event });
  };

  const handleAgendaPress = () => {
    navigation.navigate('Agenda', { event });
  };

  const handleSpeakersPress = () => {
    navigation.navigate('Speakers', { event });
  };

  const handleMapsPress = () => {
    navigation.navigate('Maps', { event });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A6CF7']}
            tintColor="#4A6CF7"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDescription}>{event.description}</Text>

          {/* Event Basic Info */}
          <View style={styles.basicInfo}>
            <View style={styles.infoRow}>
              <CalendarIcon size={20} color="#4A6CF7" />
              <Text style={styles.infoText}>{formatDate(event.date)}</Text>
            </View>

            <View style={styles.infoRow}>
              <ClockIcon size={20} color="#4A6CF7" />
              <Text style={styles.infoText}>{formatTime(event.date)}</Text>
            </View>

            <View style={styles.infoRow}>
              <LocationIcon size={20} color="#4A6CF7" />
              <Text style={styles.infoText}>{event.location}</Text>
            </View>

            <View style={styles.infoRow}>
              <UsersIcon size={20} color="#4A6CF7" />
              <Text style={styles.infoText}>
                {event.registrations_count} / {event.max_attendees} attendees
              </Text>
            </View>
          </View>
        </View>

        {/* Action Cards Grid */}
        <View style={styles.actionCardsContainer}>
          <Text style={styles.sectionTitle}>Explore Event</Text>

          <View style={styles.cardsGrid}>
            {/* First Row */}
            <View style={styles.gridRow}>
              <QuickActionCard
                icon={<InfoCircleIcon size={32} color="#4A6CF7" />}
                title="Event Info"
                subtitle="Details & Information"
                onPress={handleEventInfoPress}
              />

              <QuickActionCard
                icon={<AgendaIcon size={32} color="#10B981" />}
                title="Agenda"
                subtitle="Schedule & Timeline"
                onPress={handleAgendaPress}
              />
            </View>

            {/* Second Row */}
            <View style={styles.gridRow}>
              <QuickActionCard
                icon={<SpeakersIcon size={32} color="#F59E0B" />}
                title="Speakers"
                subtitle="Meet the Presenters"
                onPress={handleSpeakersPress}
              />

              <QuickActionCard
                icon={<MapIcon size={32} color="#EF4444" />}
                title="Maps"
                subtitle="Location & Directions"
                onPress={handleMapsPress}
              />
            </View>
          </View>
        </View>

        {/* Registration Status */}
        {event.is_registered && (
          <View style={styles.registrationStatus}>
            <View style={styles.registeredBadge}>
              <Text style={styles.registeredText}>✓ You are registered for this event</Text>
            </View>
          </View>
        )}

        {/* Organizer Info */}
        <View style={styles.organizerSection}>
          <Text style={styles.sectionTitle}>Organizer</Text>
          <View style={styles.organizerCard}>
            <Text style={styles.organizerName}>
              {event.organizer.first_name} {event.organizer.last_name}
            </Text>
            <Text style={styles.organizerEmail}>{event.organizer.email}</Text>
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


  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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

  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },

  eventHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 32,
  },

  eventDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 20,
  },

  basicInfo: {
    gap: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },

  actionCardsContainer: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },

  cardsGrid: {
    gap: 15,
  },

  gridRow: {
    flexDirection: 'row',
    gap: 15,
  },

  registrationStatus: {
    marginBottom: 24,
  },

  registeredBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  registeredText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  organizerSection: {
    marginBottom: 24,
  },

  organizerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  organizerEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default EventDetailScreen;
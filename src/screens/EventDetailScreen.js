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
import { useTheme } from '../context/ThemeContext';

const EventDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
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
      timeZone: 'UTC'
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

  const handleUnregister = () => {
    Alert.alert(
      "Leave Event",
      "Are you sure you want to unregister from this event? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Leave Event",
          style: "destructive",
          onPress: confirmUnregister
        }
      ]
    );
  };

  const confirmUnregister = async () => {
    try {
      await eventService.unregisterFromEvent(eventId);
      Alert.alert("Success", "You have successfully unregistered from this event.");
      // Refresh event details to update registration status
      await fetchEventDetails();
    } catch (error) {
      console.error("Error unregistering from event:", error);
      Alert.alert("Error", "Failed to unregister from event. Please try again.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />
        <View style={styles.centered}>
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Event Header */}
        <View style={[styles.eventHeader, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
          <Text style={[styles.eventTitle, { color: theme.colors.onSurface }]}>{event.title}</Text>
          <Text style={[styles.eventDescription, { color: theme.colors.onSurfaceVariant }]}>{event.description}</Text>

          {/* Event Basic Info */}
          <View style={styles.basicInfo}>
            <View style={styles.infoRow}>
              <CalendarIcon size={20} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>{formatDate(event.date)}</Text>
            </View>

            <View style={styles.infoRow}>
              <ClockIcon size={20} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>{formatTime(event.date)}</Text>
            </View>

            <View style={styles.infoRow}>
              <LocationIcon size={20} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>{event.location}</Text>
            </View>

            <View style={styles.infoRow}>
              <UsersIcon size={20} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
                {event.registrations_count} / {event.max_attendees} attendees
              </Text>
            </View>
          </View>
        </View>

        {/* Action Cards Grid */}
        <View style={styles.actionCardsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Explore Event</Text>

          <View style={styles.cardsGrid}>
            {/* First Row */}
            <View style={styles.gridRow}>
              <QuickActionCard
                icon={<InfoCircleIcon size={32} color={theme.colors.primary} />}
                title="Event Info"
                subtitle="Details & Information"
                onPress={handleEventInfoPress}
              />

              <QuickActionCard
                icon={<AgendaIcon size={32} color={theme.colors.secondary} />}
                title="Agenda"
                subtitle="Schedule & Timeline"
                onPress={handleAgendaPress}
              />
            </View>

            {/* Second Row */}
            <View style={styles.gridRow}>
              <QuickActionCard
                icon={<SpeakersIcon size={32} color={theme.colors.accent} />}
                title="Speakers"
                subtitle="Meet the Presenters"
                onPress={handleSpeakersPress}
              />

              <QuickActionCard
                icon={<MapIcon size={32} color={theme.colors.error} />}
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
            <TouchableOpacity
              style={styles.unregisterButton}
              onPress={handleUnregister}
              activeOpacity={0.7}
            >
              <Text style={styles.unregisterButtonText}>Leave Event</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Organizer Info */}
        <View style={styles.organizerSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Organizer</Text>
          <View style={[styles.organizerCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
            <Text style={[styles.organizerName, { color: theme.colors.onSurface }]}>
              {event.organizer.first_name} {event.organizer.last_name}
            </Text>
            <Text style={[styles.organizerEmail, { color: theme.colors.onSurfaceVariant }]}>{event.organizer.email}</Text>
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
  },

  errorText: {
    fontSize: 16,
  },

  eventHeader: {
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 32,
  },

  eventDescription: {
    fontSize: 16,
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
    marginLeft: 12,
    flex: 1,
  },

  actionCardsContainer: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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

  unregisterButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },

  unregisterButtonText: {
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
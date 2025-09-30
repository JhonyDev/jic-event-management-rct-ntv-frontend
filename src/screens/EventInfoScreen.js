import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  CalendarIcon,
  LocationIcon,
  ClockIcon,
  UsersIcon,
  ArrowLeftIcon,
  InfoCircleIcon,
} from '../components/SvgIcons';
import { useTheme } from '../context/ThemeContext';

const EventInfoScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { event } = route.params;

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
    // Use UTC time to avoid timezone conversion issues
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <InfoCircleIcon size={48} color={theme.colors.primary} />
          </View>
          <Text style={[styles.eventTitle, { color: theme.colors.onBackground }]}>{event.title}</Text>
        </View>

        {/* Event Image */}
        {event.image && (
          <View style={[styles.imageCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
            <Image
              source={{ uri: event.image }}
              style={styles.eventImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Event Details Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Event Details</Text>

          <View style={styles.infoRow}>
            <CalendarIcon size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Date</Text>
              <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>{formatDate(event.date)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <ClockIcon size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Time</Text>
              <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>{formatTime(event.date)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <LocationIcon size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Location</Text>
              <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>{event.location}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <UsersIcon size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Attendees</Text>
              <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
                {event.registrations_count} / {event.max_attendees} registered
              </Text>
            </View>
          </View>
        </View>

        {/* Description Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Description</Text>
          <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>{event.description}</Text>
        </View>

        {/* Organizer Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Organizer</Text>
          <View style={styles.organizerInfo}>
            <View style={[styles.organizerAvatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.organizerInitials, { color: theme.colors.onPrimary }]}>
                {event.organizer.first_name?.[0]}{event.organizer.last_name?.[0]}
              </Text>
            </View>
            <View style={styles.organizerDetails}>
              <Text style={[styles.organizerName, { color: theme.colors.onSurface }]}>
                {event.organizer.first_name} {event.organizer.last_name}
              </Text>
              <Text style={[styles.organizerEmail, { color: theme.colors.onSurfaceVariant }]}>{event.organizer.email}</Text>
            </View>
          </View>
        </View>

        {/* Registration Status */}
        {event.is_registered && (
          <View style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
            <View style={styles.registeredBadge}>
              <Text style={styles.registeredText}>✓ You are registered for this event</Text>
            </View>
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


  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  eventHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
  },

  imageCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },

  eventImage: {
    width: '100%',
    minHeight: 150,
    maxHeight: 300,
  },

  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  infoContent: {
    marginLeft: 12,
    flex: 1,
  },

  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },

  infoText: {
    fontSize: 16,
    fontWeight: '500',
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
  },

  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  organizerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  organizerInitials: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  organizerDetails: {
    flex: 1,
  },

  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },

  organizerEmail: {
    fontSize: 14,
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
});

export default EventInfoScreen;
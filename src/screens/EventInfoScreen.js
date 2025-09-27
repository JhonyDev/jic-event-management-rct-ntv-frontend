import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {
  CalendarIcon,
  LocationIcon,
  ClockIcon,
  UsersIcon,
  ArrowLeftIcon,
  InfoCircleIcon,
} from '../components/SvgIcons';

const EventInfoScreen = ({ route, navigation }) => {
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
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon size={24} color="#4A6CF7" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Information</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={styles.iconContainer}>
            <InfoCircleIcon size={48} color="#4A6CF7" />
          </View>
          <Text style={styles.eventTitle}>{event.title}</Text>
        </View>

        {/* Event Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Event Details</Text>

          <View style={styles.infoRow}>
            <CalendarIcon size={20} color="#4A6CF7" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoText}>{formatDate(event.date)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <ClockIcon size={20} color="#4A6CF7" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoText}>{formatTime(event.date)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <LocationIcon size={20} color="#4A6CF7" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoText}>{event.location}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <UsersIcon size={20} color="#4A6CF7" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Attendees</Text>
              <Text style={styles.infoText}>
                {event.registrations_count} / {event.max_attendees} registered
              </Text>
            </View>
          </View>
        </View>

        {/* Description Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Organizer Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Organizer</Text>
          <View style={styles.organizerInfo}>
            <View style={styles.organizerAvatar}>
              <Text style={styles.organizerInitials}>
                {event.organizer.first_name?.[0]}{event.organizer.last_name?.[0]}
              </Text>
            </View>
            <View style={styles.organizerDetails}>
              <Text style={styles.organizerName}>
                {event.organizer.first_name} {event.organizer.last_name}
              </Text>
              <Text style={styles.organizerEmail}>{event.organizer.email}</Text>
            </View>
          </View>
        </View>

        {/* Registration Status */}
        {event.is_registered && (
          <View style={styles.card}>
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
    backgroundColor: '#F9FAFB',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },

  placeholder: {
    width: 40,
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
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 32,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
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
    color: '#6B7280',
    marginBottom: 4,
  },

  infoText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },

  description: {
    fontSize: 16,
    color: '#374151',
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
    backgroundColor: '#4A6CF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  organizerInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  organizerDetails: {
    flex: 1,
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
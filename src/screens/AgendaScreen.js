import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  ArrowLeftIcon,
  AgendaIcon,
  ClockIcon,
  LocationIcon,
} from '../components/SvgIcons';
import eventService from '../services/eventService';

const AgendaScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [agendaData, setAgendaData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgendaData();
  }, []);

  const fetchAgendaData = async () => {
    try {
      setLoading(true);
      // Try to fetch from API first
      const data = await eventService.getEventAgenda(event.id);
      setAgendaData(data);
    } catch (error) {
      console.log('Using mock agenda data:', error.message);
      // Fall back to mock data if API not available
      setAgendaData(getMockAgendaData());
    } finally {
      setLoading(false);
    }
  };

  // Mock agenda data - fallback when API not available
  const getMockAgendaData = () => [
    {
      id: 1,
      title: 'Day 1 - Orientation & Workshops',
      description: 'Welcome day with orientation and hands-on workshops',
      date: '2023-09-26',
      day_number: 1,
      order: 1,
      sessions: [
        {
          id: 1,
          time: '09:00 AM',
          duration: '30 min',
          title: 'Registration & Coffee',
          description: 'Welcome coffee and registration check-in',
          location: 'Main Lobby',
          type: 'registration',
        },
        {
          id: 2,
          time: '09:30 AM',
          duration: '45 min',
          title: 'Opening Keynote',
          description: 'Welcome address and event overview',
          location: 'Main Auditorium',
          type: 'keynote',
          speaker: 'Dr. Jane Smith',
        },
        {
          id: 3,
          time: '10:15 AM',
          duration: '15 min',
          title: 'Coffee Break',
          description: 'Networking opportunity',
          location: 'Lobby',
          type: 'break',
        },
        {
          id: 4,
          time: '10:30 AM',
          duration: '60 min',
          title: 'Technical Session 1',
          description: 'Deep dive into modern development practices',
          location: 'Room A',
          type: 'session',
          speaker: 'John Doe',
        },
        {
          id: 5,
          time: '11:30 AM',
          duration: '60 min',
          title: 'Panel Discussion',
          description: 'Industry experts discuss future trends',
          location: 'Main Auditorium',
          type: 'panel',
          speaker: 'Multiple Speakers',
        },
        {
          id: 6,
          time: '12:30 PM',
          duration: '60 min',
          title: 'Lunch Break',
          description: 'Networking lunch with refreshments',
          location: 'Dining Hall',
          type: 'break',
        },
      ]
    },
    {
      id: 2,
      title: 'Day 2 - Advanced Sessions',
      description: 'Deep dive technical sessions and closing ceremony',
      date: '2023-09-27',
      day_number: 2,
      order: 2,
      sessions: [
        {
          id: 7,
          time: '01:30 PM',
          duration: '45 min',
          title: 'Workshop Session',
          description: 'Hands-on coding workshop',
          location: 'Lab 1',
          type: 'workshop',
          speaker: 'Sarah Wilson',
        },
        {
          id: 8,
          time: '02:15 PM',
          duration: '45 min',
          title: 'Closing Remarks',
          description: 'Summary and next steps',
          location: 'Main Auditorium',
          type: 'keynote',
          speaker: 'Event Organizer',
        },
      ]
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'keynote':
        return '#4A6CF7';
      case 'session':
        return '#10B981';
      case 'workshop':
        return '#F59E0B';
      case 'panel':
        return '#EF4444';
      case 'break':
        return '#8B5CF6';
      case 'registration':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'keynote':
        return 'Keynote';
      case 'session':
        return 'Session';
      case 'workshop':
        return 'Workshop';
      case 'panel':
        return 'Panel';
      case 'break':
        return 'Break';
      case 'registration':
        return 'Registration';
      default:
        return 'Event';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Event Header */}
        <View style={styles.eventnow }>
          <View style={styles.iconContainer}>
            <AgendaIcon size={48} color="#10B981" />
          </View>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventSubtitle}>
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A6CF7" />
            <Text style={styles.loadingText}>Loading agenda...</Text>
          </View>
        ) : agendaData && agendaData.length > 0 ? (
          /* Agenda Content */
          <View style={styles.agendaContainer}>
            {agendaData.map((dayAgenda, dayIndex) => (
              <View key={dayAgenda.id} style={styles.dayContainer}>
                {/* Simple Day Header */}
                <View style={styles.dayHeader}>
                  <Text style={styles.dayText}>Day {dayAgenda.day_number || dayIndex + 1}</Text>
                </View>

                {/* Agenda Details (no card) */}
                <View style={styles.agendaDetails}>
                  <Text style={styles.agendaTitle}>{dayAgenda.title}</Text>
                  {dayAgenda.description && (
                    <Text style={styles.agendaDescription}>{dayAgenda.description}</Text>
                  )}
                  {dayAgenda.date && (
                    <Text style={styles.agendaDate}>
                      {new Date(dayAgenda.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  )}
                </View>

                {/* Timeline with Sessions */}
                {dayAgenda.sessions && dayAgenda.sessions.length > 0 && (
                  <View style={styles.timelineContainer}>
                    {dayAgenda.sessions.map((session, sessionIndex) => (
                      <View key={session.id} style={styles.timelineItem}>
                        {/* Timeline Column with Line and Dot */}
                        <View style={styles.timelineColumn}>
                          <View style={[styles.timelineDot, { backgroundColor: getTypeColor(session.type) }]} />
                          {sessionIndex < dayAgenda.sessions.length - 1 && (
                            <View style={styles.timelineLine} />
                          )}
                        </View>

                        {/* Session Card */}
                        <View style={styles.sessionCard}>
                          {/* Session Header */}
                          <View style={styles.sessionHeader}>
                            <View style={styles.sessionTimeContainer}>
                              <ClockIcon size={16} color="#4A6CF7" />
                              <Text style={styles.sessionTime}>{session.time}</Text>
                              <Text style={styles.sessionDuration}>• {session.duration}</Text>
                            </View>
                            <View style={[styles.sessionTypeBadge, { backgroundColor: getTypeColor(session.type) }]}>
                              <Text style={styles.sessionTypeText}>{getTypeLabel(session.type)}</Text>
                            </View>
                          </View>

                          {/* Session Content */}
                          <View style={styles.sessionContent}>
                            <Text style={styles.sessionTitle}>{session.title}</Text>
                            {session.description && (
                              <Text style={styles.sessionDescription}>{session.description}</Text>
                            )}

                            {/* Session Footer */}
                            <View style={styles.sessionFooter}>
                              <View style={styles.sessionLocation}>
                                <LocationIcon size={14} color="#6B7280" />
                                <Text style={styles.sessionLocationText}>{session.location}</Text>
                              </View>
                            </View>

                            {/* Session Speakers */}
                            {session.speakers && session.speakers.length > 0 ? (
                              <View style={styles.speakersContainer}>
                                {session.speakers.map((speaker, speakerIndex) => (
                                  <View key={speakerIndex} style={styles.speakerBadge}>
                                    <Text style={styles.speakerBadgeText}>{speaker.name || speaker}</Text>
                                  </View>
                                ))}
                              </View>
                            ) : session.speaker ? (
                              <View style={styles.speakersContainer}>
                                <View style={styles.speakerBadge}>
                                  <Text style={styles.speakerBadgeText}>{session.speaker}</Text>
                                </View>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

              </View>
            ))}
          </View>
        ) : (
          /* No Agenda Data */
          <View style={styles.emptyContainer}>
            <AgendaIcon size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Agenda Available</Text>
            <Text style={styles.emptyDescription}>
              The event agenda will be available soon. Please check back later.
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
    backgroundColor: '#F9FAFB',
  },


  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  eventHeader: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },

  eventSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },

  agendaContainer: {
    flex: 1,
  },

  dayContainer: {
    marginBottom: 32,
  },

  dayHeader: {
    marginBottom: 12,
  },

  dayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  agendaDetails: {
    marginBottom: 20,
    paddingLeft: 4,
  },

  agendaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },

  agendaDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 6,
  },

  agendaDate: {
    fontSize: 13,
    color: '#4A6CF7',
    fontWeight: '500',
  },

  timelineContainer: {
    paddingLeft: 16,
  },

  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  timelineColumn: {
    alignItems: 'center',
    marginRight: 16,
    width: 20,
  },

  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 8,
  },

  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
    minHeight: 40,
  },

  sessionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sessionTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  sessionTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },

  sessionDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },

  sessionTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  sessionTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },

  sessionContent: {
    marginBottom: 12,
  },

  sessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 24,
  },

  sessionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },

  sessionFooter: {
    marginBottom: 12,
  },

  sessionLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sessionLocationText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },

  speakersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },

  speakerBadge: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  speakerBadgeText: {
    fontSize: 12,
    color: '#4A6CF7',
    fontWeight: '500',
  },

  daySeparator: {
    height: 2,
    backgroundColor: '#F3F4F6',
    marginVertical: 24,
    borderRadius: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },

  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },


  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default AgendaScreen;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {
  ArrowLeftIcon,
  SpeakersIcon,
  EmailIcon,
  InfoIcon,
} from '../components/SvgIcons';
import eventService from '../services/eventService';
import { useTheme } from '../context/ThemeContext';

const SpeakersScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { event } = route.params;
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpeakersData();
  }, []);

  const fetchSpeakersData = async () => {
    try {
      setLoading(true);
      // Try to fetch from API first
      const data = await eventService.getEventSpeakers(event.id);
      setSpeakers(data);
    } catch (error) {
      console.log('Using mock speakers data:', error.message);
      // Fall back to mock data if API not available
      setSpeakers(getMockSpeakersData());
    } finally {
      setLoading(false);
    }
  };

  // Mock speakers data - fallback when API not available
  const getMockSpeakersData = () => [
    {
      id: 1,
      name: 'Dr. Jane Smith',
      title: 'Chief Technology Officer',
      company: 'TechCorp Inc.',
      bio: 'Dr. Jane Smith is a renowned technology leader with over 15 years of experience in software development and system architecture. She has led multiple successful digital transformations and is passionate about emerging technologies.',
      email: 'jane.smith@techcorp.com',
      sessions: ['Opening Keynote'],
      expertise: ['Cloud Computing', 'AI/ML', 'System Architecture'],
      avatar: 'JS',
    },
    {
      id: 2,
      name: 'John Doe',
      title: 'Senior Software Engineer',
      company: 'DevSolutions Ltd.',
      bio: 'John is a full-stack developer with expertise in modern web technologies. He specializes in React, Node.js, and cloud-native applications. He enjoys sharing knowledge through workshops and technical talks.',
      email: 'john.doe@devsolutions.com',
      sessions: ['Technical Session 1'],
      expertise: ['React', 'Node.js', 'DevOps'],
      avatar: 'JD',
    },
    {
      id: 3,
      name: 'Sarah Wilson',
      title: 'UX Design Director',
      company: 'Design Studio Pro',
      bio: 'Sarah is a user experience expert who has worked with Fortune 500 companies to create intuitive and engaging digital experiences. She advocates for user-centered design and accessibility.',
      email: 'sarah.wilson@designstudio.com',
      sessions: ['Workshop Session'],
      expertise: ['UX Design', 'Accessibility', 'Design Systems'],
      avatar: 'SW',
    },
    {
      id: 4,
      name: 'Michael Chen',
      title: 'Product Manager',
      company: 'Innovation Labs',
      bio: 'Michael is a product strategist with a track record of launching successful digital products. He combines technical knowledge with business acumen to drive product innovation.',
      email: 'michael.chen@innovationlabs.com',
      sessions: ['Panel Discussion'],
      expertise: ['Product Strategy', 'Agile', 'Market Research'],
      avatar: 'MC',
    },
  ];

  const handleContactSpeaker = (speaker) => {
    Alert.alert(
      'Contact Speaker',
      `Send an email to ${speaker.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: async () => {
            try {
              const subject = encodeURIComponent(`Inquiry about ${event.title}`);
              const body = encodeURIComponent(`Hello ${speaker.name},\n\nI hope this email finds you well. I attended your session at ${event.title} and would like to connect with you.\n\nBest regards`);
              const emailUrl = `mailto:${speaker.email}?subject=${subject}&body=${body}`;

              // Try to open the email URL directly without checking canOpenURL
              // canOpenURL can be unreliable for mailto on some Android devices
              await Linking.openURL(emailUrl);
            } catch (error) {
              console.error('Error opening email:', error);
              // If opening fails, show fallback with email address
              Alert.alert(
                'Open Email App',
                `Please copy the email address and compose your email manually:\n\n${speaker.email}`,
                [
                  { text: 'Copy Email', onPress: () => {
                    // Note: In a real app, you might want to use Clipboard API
                    console.log('Email to copy:', speaker.email);
                  }},
                  { text: 'OK' }
                ]
              );
            }
          }
        },
      ]
    );
  };

  const handleViewSpeakerDetail = (speaker) => {
    Alert.alert(
      speaker.name,
      `${speaker.title} at ${speaker.company}\n\n${speaker.bio}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.accentContainer }]}>
            <SpeakersIcon size={48} color={theme.colors.accent} />
          </View>
          <Text style={[styles.eventTitle, { color: theme.colors.onBackground }]}>Meet Our Speakers</Text>
          <Text style={[styles.eventSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Expert presenters sharing their knowledge at {event.title}
          </Text>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Loading speakers...</Text>
          </View>
        ) : (
          /* Speakers List */
          <View style={styles.speakersList}>
            {speakers.map((speaker) => (
            <View key={speaker.id} style={[styles.speakerCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
              {/* Speaker Header */}
              <View style={styles.speakerHeader}>
                <View style={[styles.speakerAvatar, { backgroundColor: theme.colors.primary }]}>
                  <Text style={[styles.speakerInitials, { color: theme.colors.onPrimary }]}>{speaker.avatar}</Text>
                </View>
                <View style={styles.speakerInfo}>
                  <Text style={[styles.speakerName, { color: theme.colors.onSurface }]}>{speaker.name}</Text>
                  <Text style={[styles.speakerTitle, { color: theme.colors.primary }]}>{speaker.title}</Text>
                  <Text style={[styles.speakerCompany, { color: theme.colors.onSurfaceVariant }]}>{speaker.company}</Text>
                </View>
              </View>

              {/* Speaker Bio */}
              <Text style={[styles.speakerBio, { color: theme.colors.onSurfaceVariant }]}>{speaker.bio}</Text>

              {/* Sessions */}
              <View style={styles.sessionsSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Sessions</Text>
                <View style={styles.sessionsList}>
                  {speaker.sessions.map((session, index) => (
                    <View key={index} style={[styles.sessionBadge, { backgroundColor: theme.colors.secondary }]}>
                      <Text style={[styles.sessionText, { color: theme.colors.onSecondary }]}>{session}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Expertise */}
              <View style={styles.expertiseSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Expertise</Text>
                <View style={styles.expertiseList}>
                  {speaker.expertise.map((skill, index) => (
                    <View key={index} style={[styles.expertiseBadge, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                      <Text style={[styles.expertiseText, { color: theme.colors.onSurfaceVariant }]}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.speakerActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                  onPress={() => handleViewSpeakerDetail(speaker)}
                >
                  <InfoIcon size={16} color={theme.colors.primary} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.onSurface }]}>View Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                  onPress={() => handleContactSpeaker(speaker)}
                >
                  <EmailIcon size={16} color={theme.colors.onPrimary} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
            ))}
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
    marginBottom: 32,
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
    marginBottom: 8,
  },

  eventSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },

  speakersList: {
    gap: 20,
  },

  speakerCard: {
    borderRadius: 12,
    padding: 20,
  },

  speakerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  speakerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  speakerInitials: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  speakerInfo: {
    flex: 1,
  },

  speakerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },

  speakerTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },

  speakerCompany: {
    fontSize: 14,
  },

  speakerBio: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },

  sessionsSection: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  sessionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  sessionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  sessionText: {
    fontSize: 12,
    fontWeight: '500',
  },

  expertiseSection: {
    marginBottom: 20,
  },

  expertiseList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  expertiseBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  expertiseText: {
    fontSize: 12,
    fontWeight: '500',
  },

  speakerActions: {
    flexDirection: 'row',
    gap: 12,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
});

export default SpeakersScreen;
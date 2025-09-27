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
} from 'react-native';
import {
  ArrowLeftIcon,
  SpeakersIcon,
  EmailIcon,
  InfoIcon,
} from '../components/SvgIcons';
import eventService from '../services/eventService';

const SpeakersScreen = ({ route, navigation }) => {
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
        { text: 'Send Email', onPress: () => {
          // In a real app, this would open the email client
          Alert.alert('Email', `Opening email to ${speaker.email}`);
        }},
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
        <Text style={styles.headerTitle}>Event Speakers</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={styles.iconContainer}>
            <SpeakersIcon size={48} color="#F59E0B" />
          </View>
          <Text style={styles.eventTitle}>Meet Our Speakers</Text>
          <Text style={styles.eventSubtitle}>
            Expert presenters sharing their knowledge at {event.title}
          </Text>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A6CF7" />
            <Text style={styles.loadingText}>Loading speakers...</Text>
          </View>
        ) : (
          /* Speakers List */
          <View style={styles.speakersList}>
            {speakers.map((speaker) => (
            <View key={speaker.id} style={styles.speakerCard}>
              {/* Speaker Header */}
              <View style={styles.speakerHeader}>
                <View style={styles.speakerAvatar}>
                  <Text style={styles.speakerInitials}>{speaker.avatar}</Text>
                </View>
                <View style={styles.speakerInfo}>
                  <Text style={styles.speakerName}>{speaker.name}</Text>
                  <Text style={styles.speakerTitle}>{speaker.title}</Text>
                  <Text style={styles.speakerCompany}>{speaker.company}</Text>
                </View>
              </View>

              {/* Speaker Bio */}
              <Text style={styles.speakerBio}>{speaker.bio}</Text>

              {/* Sessions */}
              <View style={styles.sessionsSection}>
                <Text style={styles.sectionTitle}>Sessions</Text>
                <View style={styles.sessionsList}>
                  {speaker.sessions.map((session, index) => (
                    <View key={index} style={styles.sessionBadge}>
                      <Text style={styles.sessionText}>{session}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Expertise */}
              <View style={styles.expertiseSection}>
                <Text style={styles.sectionTitle}>Expertise</Text>
                <View style={styles.expertiseList}>
                  {speaker.expertise.map((skill, index) => (
                    <View key={index} style={styles.expertiseBadge}>
                      <Text style={styles.expertiseText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.speakerActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleViewSpeakerDetail(speaker)}
                >
                  <InfoIcon size={16} color="#4A6CF7" />
                  <Text style={styles.actionButtonText}>View Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryActionButton]}
                  onPress={() => handleContactSpeaker(speaker)}
                >
                  <EmailIcon size={16} color="#FFFFFF" />
                  <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>Contact</Text>
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
    marginBottom: 32,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
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
    lineHeight: 24,
  },

  speakersList: {
    gap: 20,
  },

  speakerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: '#4A6CF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  speakerInitials: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  speakerInfo: {
    flex: 1,
  },

  speakerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  speakerTitle: {
    fontSize: 14,
    color: '#4A6CF7',
    fontWeight: '500',
    marginBottom: 2,
  },

  speakerCompany: {
    fontSize: 14,
    color: '#6B7280',
  },

  speakerBio: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },

  sessionsSection: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },

  sessionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  sessionBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  sessionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
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
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  expertiseText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
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
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },

  primaryActionButton: {
    backgroundColor: '#4A6CF7',
    borderColor: '#4A6CF7',
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },

  primaryActionButtonText: {
    color: '#FFFFFF',
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

export default SpeakersScreen;
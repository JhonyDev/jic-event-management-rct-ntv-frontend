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
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import appContentService from '../services/appContentService';
import { useTheme } from '../context/ThemeContext';

const HelpSupportScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [content, setContent] = useState(null);
  const [faqs, setFaqs] = useState({});
  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [helpContent, faqData, contactData] = await Promise.all([
        appContentService.getHelpSupport(),
        appContentService.getFAQs(),
        appContentService.getContactInfo(),
      ]);

      console.log('Help content loaded:', helpContent);
      console.log('FAQ data loaded:', faqData);
      console.log('Contact data loaded:', contactData);

      setContent(helpContent);
      setFaqs(faqData);
      setContactInfo(contactData);
    } catch (error) {
      console.error('Error loading help content:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContent();
  };

  const handleContact = (contactItem) => {
    if (contactItem.contact_type === 'email') {
      Linking.openURL(`mailto:${contactItem.value}`);
    } else if (contactItem.contact_type === 'phone') {
      Linking.openURL(`tel:${contactItem.value}`);
    } else if (contactItem.contact_type === 'social_media') {
      Linking.openURL(contactItem.value);
    }
  };

  const getContactIcon = (type) => {
    const icons = {
      email: 'email',
      phone: 'phone',
      address: 'map-marker',
      social_media: 'web',
    };
    return icons[type] || 'information';
  };

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />
        <View style={styles.centered}>
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Help Content */}
        {content && (
          <View style={styles.section}>
            <View style={[styles.contentCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
              <Text style={[styles.contentText, { color: theme.colors.onSurfaceVariant }]}>{content.content}</Text>
            </View>
          </View>
        )}

        {/* Contact Information */}
        {contactInfo.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Contact Us</Text>
            {contactInfo.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[styles.contactCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}
                onPress={() => handleContact(contact)}
                activeOpacity={0.7}
              >
                <View style={styles.contactLeft}>
                  <Icon
                    name={getContactIcon(contact.contact_type)}
                    size={24}
                    color={theme.colors.onBackground}
                  />
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactLabel, { color: theme.colors.onSurface }]}>{contact.label}</Text>
                    <Text style={[styles.contactValue, { color: theme.colors.onSurfaceVariant }]}>{contact.value}</Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* FAQs */}
        {Object.keys(faqs).length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Frequently Asked Questions</Text>
            {Object.entries(faqs).map(([category, questions]) => (
              <View key={category} style={styles.faqCategory}>
                <Text style={[styles.categoryTitle, { color: theme.colors.onBackground }]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                {questions.map((faq) => (
                  <TouchableOpacity
                    key={faq.id}
                    style={[styles.faqCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}
                    onPress={() => toggleFAQ(faq.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.faqHeader}>
                      <Text style={[styles.faqQuestion, { color: theme.colors.onSurface }]}>{faq.question}</Text>
                      <Icon
                        name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={theme.colors.onSurfaceVariant}
                      />
                    </View>
                    {expandedFAQ === faq.id && (
                      <Text style={[styles.faqAnswer, { color: theme.colors.onSurfaceVariant, borderTopColor: theme.colors.border }]}>{faq.answer}</Text>
                    )}
                  </TouchableOpacity>
                ))}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contentCard: {
    padding: 16,
    borderRadius: 12,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  contactCard: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactValue: {
    fontSize: 14,
    marginTop: 2,
  },
  faqCategory: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  faqCard: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});

export default HelpSupportScreen;
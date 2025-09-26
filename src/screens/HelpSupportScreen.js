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

const HelpSupportScreen = ({ navigation }) => {
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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading...</Text>
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A6CF7']}
            tintColor="#4A6CF7"
          />
        }
      >
        {/* Help Content */}
        {content && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{content.title}</Text>
            <View style={styles.contentCard}>
              <Text style={styles.contentText}>{content.content}</Text>
            </View>
          </View>
        )}

        {/* Contact Information */}
        {contactInfo.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            {contactInfo.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactCard}
                onPress={() => handleContact(contact)}
                activeOpacity={0.7}
              >
                <View style={styles.contactLeft}>
                  <Icon
                    name={getContactIcon(contact.contact_type)}
                    size={24}
                    color="#4A6CF7"
                  />
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>{contact.label}</Text>
                    <Text style={styles.contactValue}>{contact.value}</Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* FAQs */}
        {Object.keys(faqs).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {Object.entries(faqs).map(([category, questions]) => (
              <View key={category} style={styles.faqCategory}>
                <Text style={styles.categoryTitle}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                {questions.map((faq) => (
                  <TouchableOpacity
                    key={faq.id}
                    style={styles.faqCard}
                    onPress={() => toggleFAQ(faq.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.faqHeader}>
                      <Text style={styles.faqQuestion}>{faq.question}</Text>
                      <Icon
                        name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#6B7280"
                      />
                    </View>
                    {expandedFAQ === faq.id && (
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
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
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  contentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  contactCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
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
    color: '#1F2937',
  },
  contactValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  faqCategory: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6CF7',
    marginBottom: 8,
  },
  faqCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});

export default HelpSupportScreen;
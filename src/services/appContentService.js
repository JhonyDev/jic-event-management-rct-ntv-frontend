import api from '../config/api';

const appContentService = {
  // Get app content by type
  getContent: async (contentType) => {
    try {
      const response = await api.get(`/app-content/${contentType}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get privacy policy
  getPrivacyPolicy: async () => {
    return appContentService.getContent('privacy_policy');
  },

  // Get help & support
  getHelpSupport: async () => {
    return appContentService.getContent('help_support');
  },

  // Get about page
  getAbout: async () => {
    return appContentService.getContent('about');
  },

  // Get FAQs
  getFAQs: async () => {
    try {
      const response = await api.get('/faqs/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get contact information
  getContactInfo: async () => {
    try {
      const response = await api.get('/contact-info/');
      return response.data.results || response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default appContentService;
import api from '../config/api';

const announcementService = {
  // Get announcements for user's registered events
  getAnnouncements: async () => {
    try {
      const response = await api.get('/auth/announcements/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default announcementService;
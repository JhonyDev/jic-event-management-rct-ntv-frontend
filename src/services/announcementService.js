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

  // Get count of unread announcements
  getUnreadCount: async () => {
    try {
      const announcements = await announcementService.getAnnouncements();
      // For now, assume all announcements are "unread" since we don't have read status tracking
      // You can implement read status tracking later if needed
      return announcements?.length || 0;
    } catch (error) {
      console.error('Error getting unread announcements count:', error);
      return 0;
    }
  },
};

export default announcementService;
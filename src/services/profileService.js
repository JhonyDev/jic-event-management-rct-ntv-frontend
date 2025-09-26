import api from '../config/api';

const profileService = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update profile information
  updateProfile: async (profileData) => {
    try {
      const response = await api.patch('/auth/profile/', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload profile image
  uploadProfileImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profile_image', {
        uri: imageFile.uri,
        type: imageFile.type,
        name: imageFile.fileName || 'profile.jpg',
      });

      const response = await api.patch('/auth/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default profileService;
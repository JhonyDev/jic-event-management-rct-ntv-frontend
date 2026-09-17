import api from '../config/api';

const eventService = {
  // Get all events
  getEvents: async () => {
    try {
      const response = await api.get('/events/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single event
  getEvent: async (id) => {
    try {
      const response = await api.get(`/events/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create event
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events/', eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update event
  updateEvent: async (id, eventData) => {
    try {
      const response = await api.patch(`/events/${id}/`, eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete event
  deleteEvent: async (id) => {
    try {
      await api.delete(`/events/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Register for event
  registerForEvent: async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/register/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Unregister from event
  unregisterFromEvent: async (eventId) => {
    try {
      await api.delete(`/events/${eventId}/unregister/`);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Get my organized events
  getMyEvents: async () => {
    try {
      const response = await api.get('/events/my_events/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get events I'm registered for
  getRegisteredEvents: async () => {
    try {
      const response = await api.get('/events/registered_events/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get upcoming events for browsing (events that allow signup without QR)
  getBrowseableEvents: async () => {
    try {
      const response = await api.get('/events/upcoming/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get upcoming events the user is registered for
  getUpcomingRegisteredEvents: async () => {
    try {
      const response = await api.get('/events/upcoming_registered/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event agenda and sessions
  getEventAgenda: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/agenda/`);
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, return mock data for now
      console.log('Agenda endpoint not available, using mock data');
      throw error;
    }
  },

  // Get event sessions
  getEventSessions: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/sessions/`);
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, return mock data for now
      console.log('Sessions endpoint not available, using mock data');
      throw error;
    }
  },

  // Get event speakers
  getEventSpeakers: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/speakers/`);
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, return mock data for now
      console.log('Speakers endpoint not available, using mock data');
      throw error;
    }
  },

  // Get event location details
  getEventLocation: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/location/`);
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, return mock data for now
      console.log('Location endpoint not available, using mock data');
      throw error;
    }
  },

  // Register for a session
  registerForSession: async (sessionId) => {
    try {
      const response = await api.post(`/sessions/${sessionId}/register/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Unregister from a session
  unregisterFromSession: async (sessionId) => {
    try {
      const response = await api.post(`/sessions/${sessionId}/unregister/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's registered sessions for an event
  getUserSessionsForEvent: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/my-sessions/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get session attachments (supporting materials)
  getSessionAttachments: async (sessionId) => {
    try {
      const response = await api.get(`/sessions/${sessionId}/attachments/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get base URL for file access
  getBaseURL: () => {
    return api.defaults.baseURL || 'https://event.jic.agency';
  },

  // Get quick actions for an event
  getQuickActions: async (eventId) => {
    try {
      const response = await api.get(`/quick-actions/by_event/?event_id=${eventId}`);
      // The API returns {quick_actions: [...]} but we need just the array
      return response.data.quick_actions || [];
    } catch (error) {
      throw error;
    }
  },

  // Get quick action attachments (supporting materials)
  getQuickActionAttachments: async (quickActionId) => {
    try {
      const response = await api.get(`/quick-actions/${quickActionId}/attachments/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get gallery files for a supporting material
  getGalleryFiles: async (eventId, materialId) => {
    try {
      // Using the portal API endpoint for gallery files
      const response = await api.get(`/portal/api/events/${eventId}/materials/?action=get_gallery&material_id=${materialId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get supporting material with gallery files (uses token authentication)
  getSupportingMaterialGallery: async (materialId) => {
    try {
      const response = await api.get(`/supporting-materials/${materialId}/gallery/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event by ID (alias for getEvent for consistency)
  getEventById: async (id) => {
    try {
      const response = await api.get(`/events/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get registration types for an event
  getRegistrationTypes: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/registration-types/`);
      return response.data;
    } catch (error) {
      console.log('Registration types endpoint not available:', error);
      return [];
    }
  },

  // Get workshops/sessions for an event
  getWorkshops: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/workshops/`);
      return response.data;
    } catch (error) {
      console.log('Workshops endpoint not available:', error);
      return [];
    }
  },

  // Submit event registration with full form data
  submitEventRegistration: async (registrationData) => {
    try {
      // Backend automatically sets status based on event type:
      // - Paid events: 'hold' status (expires in 5 minutes if not paid)
      // - Free events: 'confirmed' status
      const response = await api.post('/event-registration/', registrationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit event registration with bank transfer payment (atomic operation)
  submitEventRegistrationWithBankTransfer: async ({ registrationData, paymentDate, receiptFile, amount, notes }) => {
    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // Add registration data
      formData.append('event', registrationData.event_id || registrationData.event);
      formData.append('registration_type', registrationData.registration_type_id || registrationData.registration_type);
      formData.append('first_name', registrationData.first_name);
      formData.append('last_name', registrationData.last_name);
      formData.append('email', registrationData.email);
      formData.append('phone', registrationData.phone_number || registrationData.phone);

      // Add optional registration fields
      if (registrationData.company) formData.append('company', registrationData.company);
      if (registrationData.affiliations) formData.append('company', registrationData.affiliations); // Map affiliations to company
      if (registrationData.designation) formData.append('designation', registrationData.designation);
      if (registrationData.address) formData.append('address', registrationData.address);
      if (registrationData.country) formData.append('country', registrationData.country);
      if (registrationData.dietary_preferences) formData.append('dietary_preferences', registrationData.dietary_preferences);
      if (registrationData.special_requirements) formData.append('special_requirements', registrationData.special_requirements);

      // Add selected workshop (single selection)
      if (registrationData.selected_workshop) {
        formData.append('workshops[0]', registrationData.selected_workshop);
      } else if (registrationData.workshops && registrationData.workshops.length > 0) {
        // Fallback for array format
        registrationData.workshops.forEach((workshopId, index) => {
          formData.append(`workshops[${index}]`, workshopId);
        });
      }

      // Add payment data
      formData.append('payment_method', 'bank_transfer');
      formData.append('payment_date', paymentDate);
      formData.append('amount', amount);
      if (notes) formData.append('notes', notes);

      // Add receipt file
      if (receiptFile) {
        formData.append('receipt', {
          uri: receiptFile.uri,
          type: receiptFile.type || 'image/jpeg',
          name: receiptFile.name || 'receipt.jpg',
        });
      }

      const response = await api.post('/event-registration/with-bank-transfer/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Return success: true along with the response data for consistency with other payment methods
      return { success: true, ...response.data };
    } catch (error) {
      throw error;
    }
  },

  // Get live streams for a session
  getSessionLiveStreams: async (sessionId) => {
    try {
      const response = await api.get(`/sessions/${sessionId}/livestreams/`);
      return response.data;
    } catch (error) {
      console.log('Live streams endpoint not available:', error);
      return [];
    }
  },
};

export default eventService;
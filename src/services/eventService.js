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
};

export default eventService;
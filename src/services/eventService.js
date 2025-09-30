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
};

export default eventService;
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  EventCard,
  LoadingCard,
} from "../components/Cards";
import eventService from "../services/eventService";
import { useTheme } from "../context/ThemeContext";

const MyEventsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const data = await eventService.getRegisteredEvents();
      // Ensure data is an array, default to empty array if not
      const eventsArray = Array.isArray(data) ? data : data?.results || [];

      // Sort events by date (upcoming first, then past events)
      const sortedEvents = eventsArray.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });

      setEvents(sortedEvents);
    } catch (error) {
      console.error("Error fetching registered events:", error);
      setEvents([]); // Set empty array on error
      Alert.alert("Error", "Failed to load your registered events. Pull down to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyEvents();
  };

  const handleEventPress = (eventId) => {
    navigation.navigate("EventDetail", {
      eventId: eventId,
    });
  };

  const getEventStatusBadge = (event) => {
    const eventDate = new Date(event.date);
    const now = new Date();

    if (event.status === 'cancelled') {
      return { label: 'CANCELLED', color: '#DC2626', textColor: '#FFFFFF' };
    } else if (event.status === 'completed') {
      return { label: 'COMPLETED', color: '#6B7280', textColor: '#FFFFFF' };
    } else if (event.status === 'draft') {
      return { label: 'UNCONFIRMED', color: '#F59E0B', textColor: '#FFFFFF' };
    } else if (eventDate < now) {
      return { label: 'PAST EVENT', color: '#7C3AED', textColor: '#FFFFFF' };
    } else {
      return { label: 'UPCOMING', color: '#10B981', textColor: '#FFFFFF' };
    }
  };

  const groupEventsByStatus = (events) => {
    const upcoming = [];
    const past = [];
    const cancelled = [];
    const completed = [];
    const unconfirmed = [];

    events.forEach(event => {
      if (event.status === 'cancelled') {
        cancelled.push(event);
      } else if (event.status === 'completed') {
        completed.push(event);
      } else if (event.status === 'draft') {
        unconfirmed.push(event);
      } else {
        const eventDate = new Date(event.date);
        const now = new Date();
        if (eventDate >= now) {
          upcoming.push(event);
        } else {
          past.push(event);
        }
      }
    });

    return { upcoming, past, cancelled, completed, unconfirmed };
  };

  const renderEventSection = (title, events, statusColor) => {
    if (events.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>{title}</Text>
          <View style={[styles.countBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.countText}>{events.length}</Text>
          </View>
        </View>
        {events.map((event) => {
          const statusBadge = getEventStatusBadge(event);
          return (
            <View key={event.id} style={styles.eventWrapper}>
              <EventCard
                event={event}
                onLearnMore={() => handleEventPress(event.id)}
                isRegistered={true}
                theme={theme}
              />
              <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
                <Text style={[styles.statusText, { color: statusBadge.textColor }]}>{statusBadge.label}</Text>
              </View>
              <View style={[styles.statusStripe, { backgroundColor: statusBadge.color }]} />
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />
        <ScrollView style={styles.content}>
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const { upcoming, past, cancelled, completed, unconfirmed } = groupEventsByStatus(events);

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
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>No Registered Events</Text>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              You haven't registered for any events yet. Explore events on the Home screen to get started!
            </Text>
          </View>
        ) : (
          <>
            {renderEventSection("Upcoming Events", upcoming, "#10B981")}
            {renderEventSection("Unconfirmed Events", unconfirmed, "#F59E0B")}
            {renderEventSection("Past Events", past, "#7C3AED")}
            {renderEventSection("Completed Events", completed, "#6B7280")}
            {renderEventSection("Cancelled Events", cancelled, "#DC2626")}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingTop: 16,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statusStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default MyEventsScreen;
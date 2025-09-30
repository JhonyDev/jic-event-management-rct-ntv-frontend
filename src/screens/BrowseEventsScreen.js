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

const BrowseEventsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBrowseableEvents();
  }, []);

  const fetchBrowseableEvents = async () => {
    try {
      const data = await eventService.getBrowseableEvents();
      // Ensure data is an array, default to empty array if not
      const eventsArray = Array.isArray(data) ? data : data?.results || [];

      // The API already filters for published events that allow signup without QR
      // and are upcoming, so we just need to set the events
      setEvents(eventsArray);
    } catch (error) {
      console.error("Error fetching browseable events:", error);
      setEvents([]); // Set empty array on error
      Alert.alert("Error", "Failed to load events. Pull down to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBrowseableEvents();
  };

  const handleEventPress = (eventId) => {
    navigation.navigate("EventDetail", {
      eventId: eventId,
    });
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await eventService.registerForEvent(eventId);
      Alert.alert("Success", "You have successfully registered for this event!");
      // Refresh the events list to update registration status
      await fetchBrowseableEvents();
    } catch (error) {
      console.error("Error registering for event:", error);
      Alert.alert("Error", "Failed to register for event. Please try again.");
    }
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
            <Text style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>No Events Available</Text>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              There are currently no events available for browsing. Check back later for new events!
            </Text>
          </View>
        ) : (
          <View style={styles.eventsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Available Events ({events.length})
            </Text>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onJoin={() => handleJoinEvent(event.id)}
                onLearnMore={() => handleEventPress(event.id)}
                isRegistered={event.is_registered}
                theme={theme}
                showJoinButton={!event.is_registered}
              />
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    paddingTop: 8,
  },
  eventsContainer: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});

export default BrowseEventsScreen;
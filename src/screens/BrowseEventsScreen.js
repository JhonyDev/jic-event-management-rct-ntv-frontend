import React, { useState, useEffect, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
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

  // Refresh data when screen comes back into focus (e.g., after payment)
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        fetchBrowseableEvents();
      }
    }, [loading])
  );

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

  const handleJoinEvent = (eventId) => {
    // Navigate to event registration screen
    navigation.navigate("EventRegistration", {
      eventId: eventId,
    });
  };

  const handleCompletePayment = (event) => {
    // Navigate to payment screen for held registrations
    // Pass eventId and a flag to indicate this is for a held registration
    // Calculate total amount from registration data
    let totalAmount = parseFloat(event.registration_fee || 0);

    // Add registration type fee if present
    if (event.registration_type_amount) {
      totalAmount += parseFloat(event.registration_type_amount);
    }

    // Add workshop fee if present
    if (event.workshop_fee) {
      totalAmount += parseFloat(event.workshop_fee);
    }

    // Use the total_amount from backend if available (most accurate)
    if (event.total_amount) {
      totalAmount = parseFloat(event.total_amount);
    }

    navigation.navigate("Payment", {
      type: "event_registration",
      eventId: event.id,  // For existing held registrations
      title: event.title,
      amount: totalAmount,
      paymentMethods: event.payment_methods || [],
      isHeldRegistration: true,  // Flag to indicate registration already exists
    });
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
                onCompletePayment={handleCompletePayment}
                isRegistered={event.is_registered}
                registrationStatus={event.registration_status}
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
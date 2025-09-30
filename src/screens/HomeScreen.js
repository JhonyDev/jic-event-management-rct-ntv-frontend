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
  WelcomeCard,
  QuickActionCard,
  EventCard,
  LoadingCard,
} from "../components/Cards";
import {
  QRScanIcon,
  EventsIcon,
  ProfileIcon,
  CalendarIcon,
} from "../components/SvgIcons";
import eventService from "../services/eventService";
import QRScannerService from "../utils/qrScanner";
import profileService from "../services/profileService";
import { useTheme } from "../context/ThemeContext";

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchEvents();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await profileService.getProfile();
      setUser(userData);
    } catch (error) {
      console.log("No user logged in or error fetching profile");
      setUser(null);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await eventService.getUpcomingRegisteredEvents();
      // Ensure data is an array, default to empty array if not
      const eventsArray = Array.isArray(data) ? data : data?.results || [];

      // The API already filters for upcoming registered events
      setEvents(eventsArray);
    } catch (error) {
      console.error("Error fetching registered upcoming events:", error);
      setEvents([]); // Set empty array on error
      Alert.alert(
        "Error",
        "Failed to load your registered events. Pull down to retry."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchEvents(), loadUserProfile()]);
  };

  const handleQRScan = async () => {
    try {
      // Navigate to QR Scanner screen
      navigation.navigate("QRScanner");
    } catch (error) {
      console.error("QR scan error:", error);
      Alert.alert("Error", "Failed to open QR scanner");
    }
  };

  const handleQRResult = (data) => {
    const qrData = QRScannerService.parseEventQR(data);

    if (!qrData) {
      QRScannerService.showQRError("This QR code is not for an event.");
      return;
    }

    // Navigate to event detail with QR flag
    navigation.navigate("EventDetail", {
      eventId: qrData.eventId,
      fromQR: true,
    });
  };

  const handleJoinEvent = (eventId) => {
    navigation.navigate("EventDetail", {
      eventId: eventId,
      autoJoin: true,
    });
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
        Quick Actions
      </Text>

      <View style={styles.actionsGrid}>
        {/* Top Row */}
        <View style={styles.gridRow}>
          <QuickActionCard
            icon={<EventsIcon size={32} color="#FFFFFF" />}
            title="Browse Events"
            subtitle="Find events near you"
            onPress={() => navigation.navigate("BrowseEvents")}
          />

          <QuickActionCard
            icon={<CalendarIcon size={32} color="#FFFFFF" />}
            title="My Events"
            subtitle="See registrations"
            onPress={() => navigation.navigate("MyEvents")}
          />
        </View>

        {/* Bottom Row */}
        <View style={styles.gridRow}>
          <QuickActionCard
            icon={<QRScanIcon size={32} color="#FFFFFF" />}
            title="Scan QR Code"
            subtitle="Join event instantly"
            onPress={handleQRScan}
            isPrimary={false}
            backgroundColor={theme.colors.surfaceVariant}
          />

          <QuickActionCard
            icon={<ProfileIcon size={32} color="#FFFFFF" />}
            title="My Profile"
            subtitle="Update info"
            onPress={() => navigation.navigate("Profile")}
          />
        </View>
      </View>
    </View>
  );

  const renderEventsList = () => {
    if (loading) {
      return (
        <View>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Upcoming Events
          </Text>
          <LoadingCard />
          <LoadingCard />
        </View>
      );
    }

    if (!events || events.length === 0) {
      return (
        <View>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Upcoming Events
          </Text>
          <View style={styles.emptyState}>
            <QRScanIcon size={64} color="#9CA3AF" />
            <Text style={[styles.emptyTitle, { color: "#9CA3AF" }]}>
              No Upcoming Events
            </Text>
            <Text style={[styles.emptySubtitle, { color: "#9CA3AF" }]}>
              Scan a QR code or browse events to register for upcoming events!
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View>
        <Text
          style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
        >
          My Upcoming Events
        </Text>
        {events &&
          Array.isArray(events) &&
          events
            .slice(0, 3)
            .map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onJoin={() => handleJoinEvent(event.id)}
                onLearnMore={() =>
                  navigation.navigate("EventDetail", { eventId: event.id })
                }
                isRegistered={true}
              />
            ))}

        {events && Array.isArray(events) && events.length > 3 && (
          <QuickActionCard
            icon={<EventsIcon size={24} color="#FFFFFF" />}
            title="View All My Events"
            subtitle={`${events.length - 3} more registered events`}
            onPress={() => navigation.navigate("MyEvents")}
            backgroundColor="#F0F9FF"
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={theme.colors.statusBar}
        backgroundColor={theme.colors.background}
        translucent={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Card */}
        <WelcomeCard
          userName={
            user?.first_name ? `${user.first_name} ${user.last_name}` : "Guest"
          }
          onPress={() => navigation.navigate("Profile")}
          nextEvent={events && events.length > 0 ? events[0] : null}
        />

        {/* Quick Actions Grid */}
        {renderQuickActions()}

        {/* Events List */}
        {renderEventsList()}
      </ScrollView>

      {/* Floating Action Button for QR Scanner */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleQRScan}
        activeOpacity={0.8}
      >
        <QRScanIcon size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 8,
  },

  quickActionsContainer: {
    marginBottom: 24,
    width: "100%",
  },

  actionsGrid: {
    gap: 15,
    width: "100%",
  },

  gridRow: {
    display: "flex",
    flexDirection: "row",
    gap: 15,
    width: "100%",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
  },
});

export default HomeScreen;

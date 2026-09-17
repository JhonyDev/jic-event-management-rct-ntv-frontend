import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../context/ThemeContext";
import eventService from "../services/eventService";

const LiveStreamsScreen = ({ route, navigation }) => {
  const { sessionId, sessionTitle } = route.params;
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [liveStreams, setLiveStreams] = useState([]);

  useEffect(() => {
    loadLiveStreams();
  }, [sessionId]);

  const loadLiveStreams = async () => {
    try {
      setLoading(true);
      const streams = await eventService.getSessionLiveStreams(sessionId);
      setLiveStreams(streams || []);
    } catch (error) {
      console.error("Error loading live streams:", error);
      Alert.alert("Error", "Failed to load live streams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform) => {
    const platformLower = platform?.toLowerCase() || "";

    if (platformLower.includes("youtube")) {
      return { name: "youtube", color: "#FF0000" };
    } else if (platformLower.includes("facebook")) {
      return { name: "facebook", color: "#1877F2" };
    } else if (platformLower.includes("instagram")) {
      return { name: "instagram", color: "#E4405F" };
    } else if (platformLower.includes("twitter") || platformLower.includes("x")) {
      return { name: "twitter", color: "#1DA1F2" };
    } else if (platformLower.includes("twitch")) {
      return { name: "twitch", color: "#9146FF" };
    } else if (platformLower.includes("linkedin")) {
      return { name: "linkedin", color: "#0A66C2" };
    } else if (platformLower.includes("vimeo")) {
      return { name: "vimeo", color: "#1AB7EA" };
    } else if (platformLower.includes("zoom")) {
      return { name: "video", color: "#2D8CFF" };
    } else {
      return { name: "play-circle", color: theme.colors.primary };
    }
  };

  const handleOpenStream = async (stream) => {
    try {
      const supported = await Linking.canOpenURL(stream.stream_url);

      if (supported) {
        await Linking.openURL(stream.stream_url);
      } else {
        Alert.alert("Error", "Cannot open this link");
      }
    } catch (error) {
      console.error("Error opening stream:", error);
      Alert.alert("Error", "Failed to open stream. Please try again.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            Loading live streams...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Live Streams
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Session Title */}
        <View style={[styles.sessionCard, { backgroundColor: theme.colors.surface }]}>
          <Icon name="presentation-play" size={32} color={theme.colors.primary} />
          <Text style={[styles.sessionTitle, { color: theme.colors.onSurface }]}>
            {sessionTitle}
          </Text>
        </View>

        {/* Live Streams List */}
        {liveStreams.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="video-off" size={64} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
              No Live Streams Available
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              There are currently no live streams for this session.
            </Text>
          </View>
        ) : (
          <View style={styles.streamsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Available Streams ({liveStreams.length})
            </Text>

            {liveStreams.map((stream, index) => {
              const platformIcon = getPlatformIcon(stream.platform);

              return (
                <TouchableOpacity
                  key={stream.id || index}
                  style={[styles.streamCard, { backgroundColor: theme.colors.surface }]}
                  onPress={() => handleOpenStream(stream)}
                  activeOpacity={0.7}
                >
                  <View style={styles.streamContent}>
                    {/* Platform Icon */}
                    <View
                      style={[
                        styles.platformIconContainer,
                        { backgroundColor: platformIcon.color + "20" },
                      ]}
                    >
                      <Icon
                        name={platformIcon.name}
                        size={32}
                        color={platformIcon.color}
                      />
                    </View>

                    {/* Stream Info */}
                    <View style={styles.streamInfo}>
                      <Text style={[styles.platformName, { color: theme.colors.onSurface }]}>
                        {stream.platform || "Live Stream"}
                      </Text>
                      <Text
                        style={[styles.streamUrl, { color: theme.colors.onSurfaceVariant }]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {stream.stream_url}
                      </Text>
                      <View style={styles.liveBadge}>
                        <View style={styles.liveIndicator} />
                        <Text style={[styles.liveText, { color: theme.colors.error }]}>
                          LIVE
                        </Text>
                      </View>
                    </View>

                    {/* Arrow Icon */}
                    <Icon
                      name="chevron-right"
                      size={24}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  sessionCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
    flex: 1,
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
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  streamsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  streamCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streamContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  platformIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  streamInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  streamUrl: {
    fontSize: 12,
    marginBottom: 6,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default LiveStreamsScreen;

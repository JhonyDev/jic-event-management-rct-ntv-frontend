import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import {
  ArrowLeftIcon,
  MapIcon,
  LocationIcon,
  ClockIcon,
  InfoCircleIcon,
} from "../components/SvgIcons";
import eventService from "../services/eventService";
import { useTheme } from "../context/ThemeContext";

const MapsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { event } = route.params;
  const [locationDetails, setLocationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchLocationData();
  }, []);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEventLocation(event.id);
      setLocationDetails(data);
    } catch (error) {
      console.log("Error loading location data:", error.message);
      setLocationDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMaps = () => {
    if (!locationDetails) return;

    // Search by venue name and address instead of coordinates
    const searchQuery = encodeURIComponent(
      `${locationDetails.venue} ${locationDetails.address}`
    );
    const url = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;

    Alert.alert(
      "Open Maps",
      `Open "${locationDetails.venue}" in Google Maps?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open", onPress: () => Linking.openURL(url) },
      ]
    );
  };

  const handleGetDirections = () => {
    if (!locationDetails) return;

    // Search by venue name and address for directions
    const searchQuery = encodeURIComponent(
      `${locationDetails.venue} ${locationDetails.address}`
    );
    const url = `https://www.google.com/maps/dir/?api=1&destination=${searchQuery}`;

    Alert.alert(
      "Get Directions",
      `Get directions to "${locationDetails.venue}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Get Directions", onPress: () => Linking.openURL(url) },
      ]
    );
  };

  const handleViewVenueMap = (imageIndex) => {
    console.log("Opening image modal for index:", imageIndex);
    console.log("Venue maps data:", locationDetails?.venue_maps);
    console.log(
      "Selected image data:",
      locationDetails?.venue_maps?.[imageIndex]
    );
    setSelectedImageIndex(imageIndex);
    setImageModalVisible(true);
  };

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.colors.statusBar}
        backgroundColor={theme.colors.background}
        translucent={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.errorContainer }]}>
            <MapIcon size={48} color={theme.colors.error} />
          </View>
          <Text style={[styles.eventTitle, { color: theme.colors.onBackground }]}>Event Location</Text>
          <Text style={[styles.eventSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Find your way to {event.title}
          </Text>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Loading location details...</Text>
          </View>
        ) : locationDetails ? (
          <>
            {/* Venue Information */}
            <View style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Venue Details</Text>

              <View style={styles.venueInfo}>
                <Text style={[styles.venueName, { color: theme.colors.onSurface }]}>{locationDetails.venue}</Text>
                <View style={styles.addressRow}>
                  <LocationIcon size={16} color={theme.colors.onSurfaceVariant} />
                  <Text style={[styles.venueAddress, { color: theme.colors.onSurfaceVariant }]}>
                    {locationDetails.address}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleGetDirections}
                >
                  <Text style={[styles.primaryButtonText, { color: theme.colors.onPrimary }]}>Get Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
                  onPress={handleOpenMaps}
                >
                  <Text style={[styles.secondaryButtonText, { color: theme.colors.onSurfaceVariant }]}>Open in Maps</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Venue Maps */}
            {locationDetails.venue_maps &&
            locationDetails.venue_maps.length > 0 ? (
              <View style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Venue Maps</Text>

                {locationDetails.venue_maps.map((venueMap, index) => (
                  <View key={venueMap.id} style={styles.venueMapContainer}>
                    <Text style={[styles.venueMapTitle, { color: theme.colors.onSurface }]}>{venueMap.title}</Text>
                    {venueMap.description && (
                      <Text style={[styles.venueMapDescription, { color: theme.colors.onSurfaceVariant }]}>
                        {venueMap.description}
                      </Text>
                    )}
                    {venueMap.image && (
                      <TouchableOpacity
                        onPress={() => handleViewVenueMap(index)}
                      >
                        <Image
                          source={{ uri: venueMap.image }}
                          style={styles.venueMapImage}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    )}
                    {index < locationDetails.venue_maps.length - 1 && (
                      <View style={[styles.mapSeparator, { backgroundColor: theme.colors.border }]} />
                    )}
                  </View>
                ))}
              </View>
            ) : (
              /* Interactive Map Placeholder */
              <View style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Map View</Text>

                <View style={styles.mapPlaceholder}>
                  <MapIcon size={64} color={theme.colors.onSurfaceVariant} />
                  <Text style={[styles.mapPlaceholderTitle, { color: theme.colors.onSurface }]}>
                    Interactive Map
                  </Text>
                  <Text style={[styles.mapPlaceholderSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                    Tap "Open in Maps" to view the interactive map and get
                    real-time directions
                  </Text>
                  <TouchableOpacity
                    style={[styles.mapButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleOpenMaps}
                  >
                    <Text style={[styles.mapButtonText, { color: theme.colors.onPrimary }]}>View Map</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        ) : null}
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          onPress={() => setImageModalVisible(false)}
        >
          <ScrollView
            style={styles.fullScreenImageContainer}
            contentContainerStyle={styles.fullScreenImageContent}
            maximumZoomScale={3}
            minimumZoomScale={1}
            bouncesZoom={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            {locationDetails?.venue_maps && locationDetails.venue_maps[selectedImageIndex] && (
              <Image
                source={{
                  uri: locationDetails.venue_maps[selectedImageIndex].image,
                }}
                style={{
                  width: screenWidth,
                  height: screenHeight,
                }}
                resizeMode="contain"
                onError={(error) => {
                  console.log("Image load error:", error);
                  console.log(
                    "Image URI:",
                    locationDetails.venue_maps[selectedImageIndex].image
                  );
                }}
                onLoad={() => console.log("Image loaded successfully")}
                onLoadStart={() => console.log("Image loading started")}
              />
            )}
          </ScrollView>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 20,
  },

  eventHeader: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },

  eventSubtitle: {
    fontSize: 16,
    textAlign: "center",
  },

  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },

  venueInfo: {
    marginBottom: 20,
  },

  venueName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  venueAddress: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },

  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },

  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },

  mapPlaceholder: {
    alignItems: "center",
    paddingVertical: 40,
  },

  mapPlaceholderTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },

  mapPlaceholderSubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },

  mapButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  mapButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },

  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },

  venueMapContainer: {
    marginBottom: 16,
  },

  venueMapTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  venueMapDescription: {
    fontSize: 14,
    marginBottom: 12,
  },

  venueMapImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },

  mapSeparator: {
    height: 1,
    marginVertical: 16,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },

  fullScreenImageContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  fullScreenImageContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MapsScreen;

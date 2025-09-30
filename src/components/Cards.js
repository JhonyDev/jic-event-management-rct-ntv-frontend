import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import {
  QRScanIcon,
  EventsIcon,
  ProfileIcon,
  CalendarIcon,
  LocationIcon,
  UsersIcon,
  ClockIcon,
} from "./SvgIcons";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const cardPadding = 16;
const cardSpacing = 12;

// Base Card Component with interaction states
export const BaseCard = ({
  children,
  onPress,
  style,
  disabled = false,
  testID,
}) => {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleValue, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }).start();
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.baseCard,
          { transform: [{ scale: scaleValue }] },
          disabled && styles.disabledCard,
          style,
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Welcome Card Component
export const WelcomeCard = ({ userName, onPress, nextEvent }) => {
  const { theme } = useTheme();
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    return "Evening";
  };

  const getWelcomeMessage = () => {
    const timeOfDay = getTimeOfDay();
    const firstName = userName ? userName.split(" ")[0] : "there";
    return `Good ${timeOfDay}, ${firstName}!`;
  };

  const getNextEventText = () => {
    if (!nextEvent) {
      return "Your next event: N/A";
    }

    const eventDate = new Date(nextEvent.date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let dateText;
    if (eventDate.toDateString() === today.toDateString()) {
      dateText = "Today";
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      dateText = "Tomorrow";
    } else {
      dateText = eventDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    return `Your next event: ${dateText}`;
  };

  return (
    <BaseCard
      style={[
        styles.welcomeCard,
        { backgroundColor: theme.colors.surfaceVariant, ...theme.shadows.md },
      ]}
      onPress={onPress}
    >
      <View style={styles.welcomeContent}>
        <Text
          style={[styles.welcomeGreeting, { color: theme.colors.onSurface }]}
        >
          {getWelcomeMessage()}
        </Text>
        <Text
          style={[
            styles.welcomeSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Ready to discover amazing events?
        </Text>
        <View style={styles.welcomeFooter}>
          <CalendarIcon size={16} color={theme.colors.primary} />
          <Text
            style={[
              styles.welcomeFooterText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {getNextEventText()}
          </Text>
        </View>
      </View>
    </BaseCard>
  );
};

// Quick Action Card Component
export const QuickActionCard = ({
  icon,
  title,
  subtitle,
  onPress,
  backgroundColor,
  textColor,
  isPrimary = false,
}) => {
  const { theme } = useTheme();

  const defaultBgColor =
    backgroundColor ||
    (isPrimary ? theme.colors.primary : theme.colors.surfaceVariant);
  const defaultTextColor =
    textColor || (isPrimary ? theme.colors.onPrimary : theme.colors.onSurface);
  const cardStyle = isPrimary
    ? [
        styles.primaryActionCard,
        { backgroundColor: defaultBgColor, ...theme.shadows.sm },
      ]
    : [
        styles.secondaryActionCard,
        {
          backgroundColor: defaultBgColor,
          borderColor: theme.colors.border,
          ...theme.shadows.sm,
        },
      ];
  const titleColor = isPrimary ? theme.colors.onPrimary : defaultTextColor;
  const subtitleColor = isPrimary
    ? theme.colors.onPrimary
    : theme.colors.onSurfaceVariant;

  return (
    <View style={{ flex: 1 }}>
      <BaseCard style={cardStyle} onPress={onPress}>
        <View style={styles.actionCardContent}>
          <View style={styles.actionIconContainer}>{icon}</View>
          <Text style={[styles.actionTitle, { color: titleColor }]}>
            {title}
          </Text>
          <Text style={[styles.actionSubtitle, { color: subtitleColor }]}>
            {subtitle}
          </Text>
        </View>
      </BaseCard>
    </View>
  );
};

// QR Scanner Hero Card
export const QRScannerCard = ({ onPress }) => {
  return (
    <BaseCard style={styles.qrHeroCard} onPress={onPress}>
      <View style={styles.qrHeroContent}>
        <View style={styles.qrIconContainer}>
          <QRScanIcon size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.qrHeroTitle}>Scan QR Code</Text>
        <Text style={styles.qrHeroSubtitle}>
          Point camera at event QR code to join instantly
        </Text>
        <View style={styles.qrHeroButton}>
          <QRScanIcon size={20} color="#FFFFFF" />
          <Text style={styles.qrHeroButtonText}>Open Scanner</Text>
        </View>
      </View>
    </BaseCard>
  );
};

// Enhanced Event Card
export const EventCard = ({
  event,
  onJoin,
  onLearnMore,
  loading = false,
  isRegistered = false,
}) => {
  const { theme } = useTheme();

  const formatFriendlyDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: 'UTC'
      })}`;
    }

    if (isTomorrow) {
      return `Tomorrow, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: 'UTC'
      })}`;
    }

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: 'UTC'
    });
  };

  const getAvailabilityInfo = () => {
    const spotsLeft = event.max_attendees - event.registrations_count;
    const percentageFull =
      (event.registrations_count / event.max_attendees) * 100;

    if (spotsLeft === 0) {
      return { text: "Event Full", color: "#EF4444", urgent: true };
    }

    if (spotsLeft <= 5) {
      return {
        text: `Only ${spotsLeft} spots left!`,
        color: "#F59E0B",
        urgent: true,
      };
    }

    if (percentageFull >= 80) {
      return {
        text: `${spotsLeft} spots available`,
        color: "#F59E0B",
        urgent: false,
      };
    }

    return {
      text: `${spotsLeft} spots available`,
      color: "#10B981",
      urgent: false,
    };
  };

  const availabilityInfo = getAvailabilityInfo();

  return (
    <BaseCard
      style={[
        styles.eventCard,
        { backgroundColor: theme.colors.card, ...theme.shadows.sm },
      ]}
    >
      {/* Event Image */}
      {event.image && (
        <View style={styles.eventImageContainer}>
          <Image
            source={{ uri: event.image }}
            style={styles.eventImage}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Event Header */}
      <View style={styles.eventHeader}>
        <View
          style={[
            styles.eventCategory,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
            {event.category || "Event"}
          </Text>
        </View>
        <Text
          style={[styles.eventTitle, { color: theme.colors.onSurface }]}
          numberOfLines={2}
        >
          {event.title}
        </Text>
      </View>

      {/* Event Info */}
      <View style={styles.eventInfo}>
        <View style={styles.infoRow}>
          <CalendarIcon size={16} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
            {formatFriendlyDate(event.date)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <LocationIcon size={16} color={theme.colors.onSurfaceVariant} />
          <Text
            style={[styles.infoText, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {event.location}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <UsersIcon size={16} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.infoText, { color: availabilityInfo.color }]}>
            {availabilityInfo.text}
          </Text>
        </View>
      </View>

      {/* Event Actions */}
      <View style={styles.eventActions}>
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.border,
            },
            isRegistered && { flex: 1 }, // Take full width when registered
          ]}
          onPress={onLearnMore}
          disabled={loading}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              { color: theme.colors.onSurface },
            ]}
          >
            {isRegistered ? "View Event Details" : "Learn More"}
          </Text>
        </TouchableOpacity>

        {!isRegistered && (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
              availabilityInfo.urgent && {
                backgroundColor: theme.colors.warning,
              },
              loading && {
                backgroundColor: theme.colors.disabled,
                opacity: 0.6,
              },
            ]}
            onPress={onJoin}
            disabled={loading || availabilityInfo.text === "Event Full"}
          >
            <Text
              style={[
                styles.primaryButtonText,
                { color: theme.colors.onPrimary },
              ]}
            >
              {availabilityInfo.text === "Event Full" ? "Full" : "Join Event"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </BaseCard>
  );
};

// Loading Card Skeleton
export const LoadingCard = () => {
  const { theme } = useTheme();
  const [shimmerAnimation] = useState(new Animated.Value(0));

  React.useEffect(() => {
    const startShimmer = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startShimmer();
  }, []);

  const shimmerStyle = {
    opacity: shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  return (
    <View
      style={[
        styles.loadingCard,
        { backgroundColor: theme.colors.card, ...theme.shadows.sm },
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerTitle,
          { backgroundColor: theme.colors.outline },
          shimmerStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.shimmerText,
          { backgroundColor: theme.colors.outline },
          shimmerStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.shimmerText,
          { backgroundColor: theme.colors.outline },
          shimmerStyle,
        ]}
      />
      <View style={styles.shimmerButtonRow}>
        <Animated.View
          style={[
            styles.shimmerButton,
            { backgroundColor: theme.colors.outline },
            shimmerStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.shimmerButton,
            { backgroundColor: theme.colors.outline },
            shimmerStyle,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Base Card Styles
  baseCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  disabledCard: {
    opacity: 0.6,
  },

  // Welcome Card Styles
  welcomeCard: {
    marginBottom: 20,
    paddingVertical: 24,
  },

  welcomeContent: {
    alignItems: "center",
  },

  welcomeGreeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },

  welcomeSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },

  welcomeFooter: {
    flexDirection: "row",
    alignItems: "center",
  },

  welcomeFooterText: {
    fontSize: 14,
    marginLeft: 6,
  },

  // Quick Action Card Styles
  primaryActionCard: {
    flex: 1,
    aspectRatio: 1,
  },

  secondaryActionCard: {
    borderWidth: 1,
    flex: 1,
    aspectRatio: 1,
  },

  actionCardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  actionIconContainer: {
    marginBottom: 12,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },

  actionSubtitle: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 14,
  },

  // QR Scanner Hero Card Styles
  qrHeroCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#4A6CF7",
    borderStyle: "dashed",
    paddingVertical: 24,
    marginBottom: 20,
  },

  qrHeroContent: {
    alignItems: "center",
  },

  qrIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#EEF2FF",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  qrHeroTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },

  qrHeroSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },

  qrHeroButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A6CF7",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  qrHeroButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  // Event Card Styles
  eventCard: {
    marginBottom: 16,
  },

  eventHeader: {
    marginBottom: 16,
  },

  eventCategory: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },

  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 24,
  },

  eventImageContainer: {
    marginTop: -16,
    marginLeft: -16,
    marginRight: -16,
    marginBottom: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },

  eventImage: {
    width: "100%",
    minHeight: 120,
    maxHeight: 200,
  },

  eventInfo: {
    marginBottom: 20,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },

  eventActions: {
    flexDirection: "row",
    gap: 12,
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

  primaryButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Loading Card Styles
  loadingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  shimmerTitle: {
    height: 20,
    borderRadius: 4,
    marginBottom: 12,
    width: "80%",
  },

  shimmerText: {
    height: 14,
    borderRadius: 4,
    marginBottom: 8,
    width: "60%",
  },

  shimmerButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },

  shimmerButton: {
    height: 36,
    borderRadius: 8,
    flex: 1,
  },
});

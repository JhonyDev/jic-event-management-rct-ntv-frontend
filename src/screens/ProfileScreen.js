import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
  RefreshControl,
  Switch,
} from "react-native";
import {
  PersonalInfoIcon,
  EventsIcon,
  NotificationIcon,
  SecurityIcon,
  HelpIcon,
  InfoIcon,
  LogoutIcon,
} from "../components/SvgIcons";
import authService from "../services/authService";
import profileService from "../services/profileService";
import { useTheme } from "../context/ThemeContext";

const ProfileScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    first_name: "",
    last_name: "",
    profile_image: null,
    profile_image_url: null,
    memberSince: "",
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  // Add navigation focus listener to refresh data when returning from edit screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadUserInfo();
    });

    return unsubscribe;
  }, [navigation]);

  const loadUserInfo = async () => {
    try {
      const user = await profileService.getProfile();
      if (user) {
        console.log("Profile API Response:", user);
        console.log("Profile Image URL:", user.profile_image_url);
        setUserInfo({
          name:
            `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
            user.username ||
            "User",
          email: user.email || "",
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          profile_image: user.profile_image || null,
          profile_image_url: user.profile_image_url || null,
          memberSince: user.date_joined
            ? new Date(user.date_joined).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })
            : "Recently",
        });
      }
    } catch (error) {
      console.error("Error loading user info:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserInfo();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await authService.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: "Auth" }],
            });
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const getInitials = () => {
    const first = userInfo.first_name?.charAt(0)?.toUpperCase() || "";
    const last = userInfo.last_name?.charAt(0)?.toUpperCase() || "";
    return first + last || userInfo.name?.charAt(0)?.toUpperCase() || "U";
  };

  const menuItems = [
    {
      icon: PersonalInfoIcon,
      title: "Personal Information",
      onPress: () => navigation.navigate("EditProfile"),
    },
    {
      icon: NotificationIcon,
      title: "Announcements",
      onPress: () => navigation.navigate("Announcements"),
    },
    {
      icon: SecurityIcon,
      title: "Privacy & Security",
      onPress: () => navigation.navigate("PrivacySecurity"),
    },
    {
      icon: HelpIcon,
      title: "Help & Support",
      onPress: () => navigation.navigate("HelpSupport"),
    },
    {
      icon: InfoIcon,
      title: "About",
      onPress: () => navigation.navigate("About"),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* User Info Section */}
        <View style={[styles.userSection, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditProfile")}
            style={styles.avatarContainer}
          >
            {userInfo.profile_image_url ? (
              <Image
                source={{ uri: userInfo.profile_image_url }}
                style={styles.profileImage}
                onLoad={() =>
                  console.log(
                    "Image loaded successfully:",
                    userInfo.profile_image_url
                  )
                }
                onError={(error) =>
                  console.log(
                    "Image load error:",
                    error,
                    userInfo.profile_image_url
                  )
                }
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.avatarText, { color: theme.colors.onPrimary }]}>{getInitials()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={[styles.userName, { color: theme.colors.onSurface }]}>{userInfo.name}</Text>
          <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>{userInfo.email}</Text>
          <Text style={[styles.memberSince, { color: theme.colors.onSurfaceVariant }]}>
            Member since {userInfo.memberSince}
          </Text>
        </View>

        {/* Menu Items */}
        <View style={[styles.menuContainer, { backgroundColor: theme.colors.surface }]}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <IconComponent size={24} color={theme.colors.onSurfaceVariant} />
                  <Text style={[styles.menuText, { color: theme.colors.onSurface }]}>{item.title}</Text>
                </View>
                <View style={styles.chevron}>
                  <Text style={[styles.chevronText, { color: theme.colors.onSurfaceVariant }]}>›</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogoutIcon size={20} color={theme.colors.error} />
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userSection: {
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 8,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 12,
  },
  menuContainer: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    marginLeft: 16,
  },
  chevron: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  chevronText: {
    fontSize: 24,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ProfileScreen;

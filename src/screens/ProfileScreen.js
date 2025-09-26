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

const ProfileScreen = ({ navigation }) => {
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
      icon: EventsIcon,
      title: "My Events",
      onPress: () => Alert.alert("My Events", "View your registered events"),
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4A6CF7"]}
            tintColor="#4A6CF7"
          />
        }
      >
        {/* User Info Section */}
        <View style={styles.userSection}>
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
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{userInfo.name}</Text>
          <Text style={styles.userEmail}>{userInfo.email}</Text>
          <Text style={styles.memberSince}>
            Member since {userInfo.memberSince}
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <IconComponent size={24} />
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <View style={styles.chevron}>
                  <Text style={styles.chevronText}>›</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogoutIcon size={20} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  userSection: {
    backgroundColor: "#fff",
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
    backgroundColor: "#4A6CF7",
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
    color: "#fff",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  menuContainer: {
    backgroundColor: "#fff",
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
    borderBottomColor: "#F3F4F6",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    color: "#374151",
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
    color: "#9CA3AF",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ProfileScreen;

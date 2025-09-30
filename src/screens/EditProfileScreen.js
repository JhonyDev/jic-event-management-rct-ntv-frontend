import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  Text,
  TextInput as RNTextInput,
  Image,
  SafeAreaView,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  EyeIcon,
  EyeOffIcon,
  CameraIcon,
  CameraOutlineIcon,
} from "../components/SvgIcons";
import profileService from "../services/profileService";
import authService from "../services/authService";
import { useTheme } from "../context/ThemeContext";

const EditProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    profile_image: null,
    profile_image_url: null,
  });
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  // Set navigation header right button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Text
            style={[
              {
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.primary,
              },
              loading && { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {loading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, loading, theme]);

  const loadProfile = async () => {
    try {
      const user = await profileService.getProfile();
      if (user) {
        setProfile({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          username: user.username || "",
          profile_image: user.profile_image || null,
          profile_image_url: user.profile_image_url || null,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!profile.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!profile.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }
    if (!profile.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (
      passwordData.current_password ||
      passwordData.new_password ||
      passwordData.confirm_password
    ) {
      if (!passwordData.current_password) {
        newErrors.current_password = "Current password is required";
      }
      if (!passwordData.new_password) {
        newErrors.new_password = "New password is required";
      } else if (passwordData.new_password.length < 6) {
        newErrors.new_password = "Password must be at least 6 characters";
      }
      if (!passwordData.confirm_password) {
        newErrors.confirm_password = "Please confirm new password";
      } else if (passwordData.new_password !== passwordData.confirm_password) {
        newErrors.confirm_password = "Passwords do not match";
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateProfile()) return;

    setLoading(true);
    try {
      // Update basic profile information
      await profileService.updateProfile({
        first_name: profile.first_name.trim(),
        last_name: profile.last_name.trim(),
        email: profile.email.trim().toLowerCase(),
      });

      // Change password if provided
      if (passwordData.current_password && passwordData.new_password) {
        if (!validatePassword()) {
          setLoading(false);
          return;
        }

        await profileService.changePassword(
          passwordData.current_password,
          passwordData.new_password
        );

        // Clear password fields after successful change
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      }

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      let errorMessage = "Failed to update profile. Please try again.";

      if (error.response?.data) {
        const data = error.response.data;
        if (data.email) {
          errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        }
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfile((prev) => ({
          ...prev,
          profile_image: imageUri,
          profile_image_url: null,
        }));

        // Upload image
        try {
          setLoading(true);
          await profileService.uploadProfileImage({
            uri: imageUri,
            type: "image/jpeg",
            fileName: "profile.jpg",
          });
        } catch (error) {
          Alert.alert("Error", "Failed to upload image");
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
    }
  };

  const getInitials = () => {
    const first = profile.first_name?.charAt(0)?.toUpperCase() || "";
    const last = profile.last_name?.charAt(0)?.toUpperCase() || "";
    return first + last || "U";
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={theme.colors.statusBar}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Image Section */}
          <View
            style={[
              styles.imageSection,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
              {profile.profile_image || profile.profile_image_url ? (
                <Image
                  source={{
                    uri: profile.profile_image || profile.profile_image_url,
                  }}
                  style={styles.profileImage}
                />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      { color: theme.colors.onPrimary },
                    ]}
                  >
                    {getInitials()}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.cameraButton,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <CameraIcon size={18} color={theme.colors.onPrimary} />
              </View>
            </TouchableOpacity>
            <View style={styles.imageHintContainer}>
              <CameraOutlineIcon
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.imageHint,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Tap to select from gallery
              </Text>
            </View>
          </View>

          {/* Personal Information */}
          <View
            style={[styles.section, { backgroundColor: theme.colors.surface }]}
          >
            <Text
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Personal Information
            </Text>

            <View style={styles.nameRow}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text
                  style={[styles.inputLabel, { color: theme.colors.onSurface }]}
                >
                  First Name
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.border,
                    },
                    errors.first_name && { borderColor: theme.colors.error },
                  ]}
                >
                  <RNTextInput
                    style={[styles.input, { color: theme.colors.onSurface }]}
                    value={profile.first_name}
                    onChangeText={(text) => {
                      setProfile((prev) => ({ ...prev, first_name: text }));
                      if (errors.first_name)
                        setErrors((prev) => ({ ...prev, first_name: null }));
                    }}
                    placeholder="First name"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    autoCapitalize="words"
                  />
                </View>
                {errors.first_name && (
                  <Text
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {errors.first_name}
                  </Text>
                )}
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text
                  style={[styles.inputLabel, { color: theme.colors.onSurface }]}
                >
                  Last Name
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.border,
                    },
                    errors.last_name && { borderColor: theme.colors.error },
                  ]}
                >
                  <RNTextInput
                    style={[styles.input, { color: theme.colors.onSurface }]}
                    value={profile.last_name}
                    onChangeText={(text) => {
                      setProfile((prev) => ({ ...prev, last_name: text }));
                      if (errors.last_name)
                        setErrors((prev) => ({ ...prev, last_name: null }));
                    }}
                    placeholder="Last name"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    autoCapitalize="words"
                  />
                </View>
                {errors.last_name && (
                  <Text
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {errors.last_name}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text
                style={[styles.inputLabel, { color: theme.colors.onSurface }]}
              >
                Email
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.border,
                  },
                  errors.email && { borderColor: theme.colors.error },
                ]}
              >
                <RNTextInput
                  style={[styles.input, { color: theme.colors.onSurface }]}
                  value={profile.email}
                  onChangeText={(text) => {
                    setProfile((prev) => ({ ...prev, email: text }));
                    if (errors.email)
                      setErrors((prev) => ({ ...prev, email: null }));
                  }}
                  placeholder="email@example.com"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.email}
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text
                style={[styles.inputLabel, { color: theme.colors.onSurface }]}
              >
                Username
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.colors.outline,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <RNTextInput
                  style={[
                    styles.input,
                    styles.disabledInput,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                  value={profile.username}
                  placeholder="Username"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  editable={false}
                />
              </View>
              <Text
                style={[
                  styles.inputHint,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Username cannot be changed
              </Text>
            </View>
          </View>

          {/* Password Section */}
          <View
            style={[styles.section, { backgroundColor: theme.colors.surface }]}
          >
            <Text
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Change Password
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Leave blank to keep current password
            </Text>

            <View style={styles.inputContainer}>
              <Text
                style={[styles.inputLabel, { color: theme.colors.onSurface }]}
              >
                Current Password
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.border,
                  },
                  errors.current_password && {
                    borderColor: theme.colors.error,
                  },
                ]}
              >
                <RNTextInput
                  style={[styles.input, { color: theme.colors.onSurface }]}
                  value={passwordData.current_password}
                  onChangeText={(text) => {
                    setPasswordData((prev) => ({
                      ...prev,
                      current_password: text,
                    }));
                    if (errors.current_password)
                      setErrors((prev) => ({
                        ...prev,
                        current_password: null,
                      }));
                  }}
                  placeholder="Current password"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeIcon}
                >
                  {showCurrentPassword ? (
                    <EyeOffIcon
                      size={20}
                      color={theme.colors.onSurfaceVariant}
                    />
                  ) : (
                    <EyeIcon size={20} color={theme.colors.onSurfaceVariant} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.current_password && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.current_password}
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text
                style={[styles.inputLabel, { color: theme.colors.onSurface }]}
              >
                New Password
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.border,
                  },
                  errors.new_password && { borderColor: theme.colors.error },
                ]}
              >
                <RNTextInput
                  style={[styles.input, { color: theme.colors.onSurface }]}
                  value={passwordData.new_password}
                  onChangeText={(text) => {
                    setPasswordData((prev) => ({
                      ...prev,
                      new_password: text,
                    }));
                    if (errors.new_password)
                      setErrors((prev) => ({ ...prev, new_password: null }));
                  }}
                  placeholder="New password"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  {showNewPassword ? (
                    <EyeOffIcon
                      size={20}
                      color={theme.colors.onSurfaceVariant}
                    />
                  ) : (
                    <EyeIcon size={20} color={theme.colors.onSurfaceVariant} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.new_password && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.new_password}
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text
                style={[styles.inputLabel, { color: theme.colors.onSurface }]}
              >
                Confirm New Password
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.border,
                  },
                  errors.confirm_password && {
                    borderColor: theme.colors.error,
                  },
                ]}
              >
                <RNTextInput
                  style={[styles.input, { color: theme.colors.onSurface }]}
                  value={passwordData.confirm_password}
                  onChangeText={(text) => {
                    setPasswordData((prev) => ({
                      ...prev,
                      confirm_password: text,
                    }));
                    if (errors.confirm_password)
                      setErrors((prev) => ({
                        ...prev,
                        confirm_password: null,
                      }));
                  }}
                  placeholder="Confirm new password"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon
                      size={20}
                      color={theme.colors.onSurfaceVariant}
                    />
                  ) : (
                    <EyeIcon size={20} color={theme.colors.onSurfaceVariant} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirm_password && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.confirm_password}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageSection: {
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 8,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4A6CF7",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4A6CF7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageHintContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  imageHint: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  section: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    height: 48,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },
  disabledInput: {
    color: "#9CA3AF",
  },
  eyeIcon: {
    padding: 4,
  },
  inputHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
});

export default EditProfileScreen;

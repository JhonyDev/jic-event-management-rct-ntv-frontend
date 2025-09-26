import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  EyeIcon,
  EyeOffIcon,
  ArrowLeftIcon,
  CameraIcon,
  CameraOutlineIcon
} from '../components/SvgIcons';
import profileService from '../services/profileService';
import authService from '../services/authService';

const EditProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    profile_image: null,
    profile_image_url: null,
  });
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await profileService.getProfile();
      if (user) {
        setProfile({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          username: user.username || '',
          profile_image: user.profile_image || null,
          profile_image_url: user.profile_image_url || null,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!profile.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!profile.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (passwordData.current_password || passwordData.new_password || passwordData.confirm_password) {
      if (!passwordData.current_password) {
        newErrors.current_password = 'Current password is required';
      }
      if (!passwordData.new_password) {
        newErrors.new_password = 'New password is required';
      } else if (passwordData.new_password.length < 6) {
        newErrors.new_password = 'Password must be at least 6 characters';
      }
      if (!passwordData.confirm_password) {
        newErrors.confirm_password = 'Please confirm new password';
      } else if (passwordData.new_password !== passwordData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
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
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      }

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      let errorMessage = 'Failed to update profile. Please try again.';

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

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
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
        setProfile(prev => ({ ...prev, profile_image: imageUri, profile_image_url: null }));

        // Upload image
        try {
          setLoading(true);
          await profileService.uploadProfileImage({
            uri: imageUri,
            type: 'image/jpeg',
            fileName: 'profile.jpg',
          });
        } catch (error) {
          Alert.alert('Error', 'Failed to upload image');
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const getInitials = () => {
    const first = profile.first_name?.charAt(0)?.toUpperCase() || '';
    const last = profile.last_name?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveButton}>
          <Text style={[styles.saveText, loading && styles.saveTextDisabled]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
              {(profile.profile_image || profile.profile_image_url) ? (
                <Image source={{ uri: profile.profile_image || profile.profile_image_url }} style={styles.profileImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{getInitials()}</Text>
                </View>
              )}
              <View style={styles.cameraButton}>
                <CameraIcon size={18} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.imageHintContainer}>
              <CameraOutlineIcon size={16} color="#6B7280" />
              <Text style={styles.imageHint}>Tap to select from gallery</Text>
            </View>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.nameRow}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>First Name</Text>
                <View style={[styles.inputWrapper, errors.first_name && styles.inputError]}>
                  <RNTextInput
                    style={styles.input}
                    value={profile.first_name}
                    onChangeText={(text) => {
                      setProfile(prev => ({ ...prev, first_name: text }));
                      if (errors.first_name) setErrors(prev => ({ ...prev, first_name: null }));
                    }}
                    placeholder="First name"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                  />
                </View>
                {errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <View style={[styles.inputWrapper, errors.last_name && styles.inputError]}>
                  <RNTextInput
                    style={styles.input}
                    value={profile.last_name}
                    onChangeText={(text) => {
                      setProfile(prev => ({ ...prev, last_name: text }));
                      if (errors.last_name) setErrors(prev => ({ ...prev, last_name: null }));
                    }}
                    placeholder="Last name"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                  />
                </View>
                {errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <RNTextInput
                  style={styles.input}
                  value={profile.email}
                  onChangeText={(text) => {
                    setProfile(prev => ({ ...prev, email: text }));
                    if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                  }}
                  placeholder="email@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputWrapper}>
                <RNTextInput
                  style={[styles.input, styles.disabledInput]}
                  value={profile.username}
                  placeholder="Username"
                  placeholderTextColor="#9CA3AF"
                  editable={false}
                />
              </View>
              <Text style={styles.inputHint}>Username cannot be changed</Text>
            </View>
          </View>

          {/* Password Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <Text style={styles.sectionSubtitle}>Leave blank to keep current password</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={[styles.inputWrapper, errors.current_password && styles.inputError]}>
                <RNTextInput
                  style={styles.input}
                  value={passwordData.current_password}
                  onChangeText={(text) => {
                    setPasswordData(prev => ({ ...prev, current_password: text }));
                    if (errors.current_password) setErrors(prev => ({ ...prev, current_password: null }));
                  }}
                  placeholder="Current password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeIcon}
                >
                  {showCurrentPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </TouchableOpacity>
              </View>
              {errors.current_password && <Text style={styles.errorText}>{errors.current_password}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={[styles.inputWrapper, errors.new_password && styles.inputError]}>
                <RNTextInput
                  style={styles.input}
                  value={passwordData.new_password}
                  onChangeText={(text) => {
                    setPasswordData(prev => ({ ...prev, new_password: text }));
                    if (errors.new_password) setErrors(prev => ({ ...prev, new_password: null }));
                  }}
                  placeholder="New password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  {showNewPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </TouchableOpacity>
              </View>
              {errors.new_password && <Text style={styles.errorText}>{errors.new_password}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={[styles.inputWrapper, errors.confirm_password && styles.inputError]}>
                <RNTextInput
                  style={styles.input}
                  value={passwordData.confirm_password}
                  onChangeText={(text) => {
                    setPasswordData(prev => ({ ...prev, confirm_password: text }));
                    if (errors.confirm_password) setErrors(prev => ({ ...prev, confirm_password: null }));
                  }}
                  placeholder="Confirm new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </TouchableOpacity>
              </View>
              {errors.confirm_password && <Text style={styles.errorText}>{errors.confirm_password}</Text>}
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  saveButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6CF7',
  },
  saveTextDisabled: {
    color: '#9CA3AF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 8,
  },
  imageContainer: {
    position: 'relative',
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
    backgroundColor: '#4A6CF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A6CF7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  imageHint: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    height: 48,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  disabledInput: {
    color: '#9CA3AF',
  },
  eyeIcon: {
    padding: 4,
  },
  inputHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});

export default EditProfileScreen;
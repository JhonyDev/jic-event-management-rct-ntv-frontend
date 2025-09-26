import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  TouchableOpacity,
  Text,
  TextInput as RNTextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Svg, { Path } from "react-native-svg";
import { EyeIcon, EyeOffIcon } from "../components/SvgIcons";
import authService from "../services/authService";

const { width } = Dimensions.get("window");

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        username: email.trim().toLowerCase(), // Use email as username
      };

      await authService.register(userData);

      Alert.alert(
        "Registration Successful",
        "Your account has been created successfully!",
        [
          {
            text: "OK",
            onPress: () => navigation.replace("Main"),
          },
        ]
      );
    } catch (error) {
      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.data) {
        const data = error.response.data;
        if (data.email) {
          errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
        } else if (data.username) {
          errorMessage = Array.isArray(data.username) ? data.username[0] : data.username;
        } else if (data.password) {
          errorMessage = Array.isArray(data.password) ? data.password[0] : data.password;
        } else if (data.detail) {
          errorMessage = data.detail;
        }
      }

      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4A6CF7", "#2563EB", "#1E40AF"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Animated.View
              style={[
                styles.headerSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Icon name="calendar-check" size={32} color="#4A6CF7" />
                </View>
              </View>

              <Text style={styles.companyName}>JIC</Text>
              <Text style={styles.companyTagline}>Event Management</Text>
              <Text style={styles.companySubtitle}>Company</Text>
            </Animated.View>

            <Svg
              height={120}
              width={width}
              style={styles.waveSvg}
              viewBox={`0 0 ${width} 120`}
              preserveAspectRatio="none"
            >
              <Path
                d={`M0,40 Q${width / 4},20 ${
                  width / 2
                },40 T${width},40 L${width},120 L0,120 Z`}
                fill="white"
              />
            </Svg>

            <Animated.View
              style={[
                styles.formSection,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <View style={styles.headerRow}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                >
                  <Icon name="arrow-left" size={24} color="#4A6CF7" />
                </TouchableOpacity>
                <Text style={styles.formTitle}>Create your account</Text>
                <View style={styles.placeholder} />
              </View>

              <View style={styles.nameRow}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.firstName && styles.inputError,
                    ]}
                  >
                    <RNTextInput
                      style={styles.input}
                      value={firstName}
                      onChangeText={(text) => {
                        setFirstName(text);
                        if (errors.firstName) setErrors({ ...errors, firstName: null });
                      }}
                      placeholder="John"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="words"
                    />
                  </View>
                  {errors.firstName && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.lastName && styles.inputError,
                    ]}
                  >
                    <RNTextInput
                      style={styles.input}
                      value={lastName}
                      onChangeText={(text) => {
                        setLastName(text);
                        if (errors.lastName) setErrors({ ...errors, lastName: null });
                      }}
                      placeholder="Doe"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="words"
                    />
                  </View>
                  {errors.lastName && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.email && styles.inputError,
                  ]}
                >
                  <RNTextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    placeholder="john@example.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.password && styles.inputError,
                  ]}
                >
                  <RNTextInput
                    style={styles.input}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors({ ...errors, password: null });
                    }}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    {showPassword ? (
                      <EyeOffIcon size={20} />
                    ) : (
                      <EyeIcon size={20} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.confirmPassword && styles.inputError,
                  ]}
                >
                  <RNTextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword)
                        setErrors({ ...errors, confirmPassword: null });
                    }}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon size={20} />
                    ) : (
                      <EyeIcon size={20} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.signUpButtonText}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.footerText}>
                Already have an account?
                <Text
                  style={styles.footerLink}
                  onPress={() => navigation.goBack()}
                >
                  {" "}
                  Sign In
                </Text>
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  companyName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  companyTagline: {
    fontSize: 18,
    color: "white",
    opacity: 0.95,
  },
  companySubtitle: {
    fontSize: 16,
    color: "white",
    opacity: 0.85,
    marginTop: 2,
  },
  waveSvg: {
    position: "absolute",
    bottom: 0,
  },
  formSection: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
    marginTop: -2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    flex: 1,
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
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
  signUpButton: {
    backgroundColor: "#4A6CF7",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  signUpButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footerText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
  },
  footerLink: {
    color: "#4A6CF7",
    fontWeight: "600",
  },
});

export default RegisterScreen;
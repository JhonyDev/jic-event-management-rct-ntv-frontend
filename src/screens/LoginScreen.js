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
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.login(email, password);
      navigation.replace("Main");
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.detail || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  const gradientColors = isDarkMode
    ? [
        theme.colors.background,
        theme.colors.surface,
        theme.colors.surfaceVariant,
      ]
    : [
        theme.colors.primary,
        theme.colors.primaryVariant,
        theme.colors.primaryDark,
      ];

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <LinearGradient
        colors={gradientColors}
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
                <View
                  style={[
                    styles.logoCircle,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <Icon
                    name="calendar-check"
                    size={32}
                    color={theme.colors.primary}
                  />
                </View>
              </View>

              <Text
                style={[
                  styles.companyName,
                  { color: isDarkMode ? theme.colors.onBackground : "#FFFFFF" },
                ]}
              >
                JIC
              </Text>
              <Text
                style={[
                  styles.companyTagline,
                  { color: isDarkMode ? theme.colors.onBackground : "#FFFFFF" },
                ]}
              >
                Event Management
              </Text>
              <Text
                style={[
                  styles.companySubtitle,
                  {
                    color: isDarkMode
                      ? theme.colors.onSurfaceVariant
                      : "#FFFFFF",
                  },
                ]}
              >
                Platform
              </Text>
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
                fill={theme.colors.background}
              />
            </Svg>

            <Animated.View
              style={[
                styles.formSection,
                {
                  opacity: fadeAnim,
                  backgroundColor: theme.colors.background,
                },
              ]}
            >
              <Text
                style={[styles.formTitle, { color: theme.colors.onBackground }]}
              >
                Login to your account
              </Text>

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
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceVariant,
                    },
                    errors.email && { borderColor: theme.colors.error },
                  ]}
                >
                  <RNTextInput
                    testID="email-input"
                    style={[styles.input, { color: theme.colors.onSurface }]}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    placeholder="thomas@email.com"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text
                  style={[styles.inputLabel, { color: theme.colors.onSurface }]}
                >
                  Password
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceVariant,
                    },
                    errors.password && { borderColor: theme.colors.error },
                  ]}
                >
                  <RNTextInput
                    testID="password-input"
                    style={[styles.input, { color: theme.colors.onSurface }]}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password)
                        setErrors({ ...errors, password: null });
                    }}
                    placeholder="••••••••"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    {showPassword ? (
                      <EyeOffIcon
                        size={20}
                        color={theme.colors.onSurfaceVariant}
                      />
                    ) : (
                      <EyeIcon
                        size={20}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: theme.colors.border },
                      rememberMe && {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                  >
                    {rememberMe && (
                      <Icon
                        name="check"
                        size={14}
                        color={theme.colors.onPrimary}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.rememberText,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Remember me
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Info", "Password recovery coming soon!")
                  }
                >
                  <Text
                    style={[styles.forgotText, { color: theme.colors.primary }]}
                  >
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                testID="login-button"
                style={[
                  styles.signInButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.signInButtonText,
                    { color: theme.colors.onPrimary },
                  ]}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
                <Text
                  style={[
                    styles.dividerText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Or
                </Text>
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.signUpButton,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surfaceVariant,
                  },
                ]}
                onPress={() => navigation.navigate("Register")}
              >
                <Text
                  style={[
                    styles.signUpButtonText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Sign up with email
                </Text>
              </TouchableOpacity>

              <Text
                style={[
                  styles.footerText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Already a member?
                <Text
                  style={[styles.footerLink, { color: theme.colors.primary }]}
                  onPress={() => handleLogin()}
                >
                  {" "}
                  Login
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
    marginBottom: 4,
  },
  companyTagline: {
    fontSize: 18,
    opacity: 0.95,
  },
  companySubtitle: {
    fontSize: 16,
    opacity: 0.85,
    marginTop: 2,
  },
  waveSvg: {
    position: "absolute",
    bottom: 0,
  },
  formSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
    marginTop: -2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  eyeIcon: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rememberText: {
    fontSize: 14,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "500",
  },
  signInButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  signUpButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
  },
  footerLink: {
    fontWeight: "600",
  },
});

export default LoginScreen;

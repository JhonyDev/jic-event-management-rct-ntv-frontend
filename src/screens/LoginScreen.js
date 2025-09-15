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
import { EyeIcon, EyeOffIcon, FacebookIcon, GoogleIcon } from "../components/SvgIcons";
import authService from "../services/authService";

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
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
                d={`M0,40 Q${width/4},20 ${width/2},40 T${width},40 L${width},120 L0,120 Z`}
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
              <Text style={styles.formTitle}>Login to your account</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                  <RNTextInput
                    testID="email-input"
                    style={styles.input}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    placeholder="thomas@email.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                  <RNTextInput
                    testID="password-input"
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
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Icon name="check" size={14} color="white" />}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => Alert.alert("Info", "Password recovery coming soon!")}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                testID="login-button"
                style={styles.signInButton}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.signInButtonText}>
                  {loading ? "Signing in..." : "Sign in"}
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Or</Text>
                <View style={styles.divider} />
              </View>

              <Text style={styles.socialText}>Don't have an account?</Text>

              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <FacebookIcon size={20} />
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton}>
                  <GoogleIcon size={20} />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={styles.signUpButtonText}>Sign up with email</Text>
              </TouchableOpacity>

              <Text style={styles.footerText}>
                Already a member?
                <Text
                  style={styles.footerLink}
                  onPress={() => handleLogin()}
                > Login</Text>
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
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
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
    borderColor: "#D1D5DB",
    borderRadius: 4,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4A6CF7",
    borderColor: "#4A6CF7",
  },
  rememberText: {
    fontSize: 14,
    color: "#6B7280",
  },
  forgotText: {
    fontSize: 14,
    color: "#4A6CF7",
    fontWeight: "500",
  },
  signInButton: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  signInButtonText: {
    color: "white",
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
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#9CA3AF",
    fontSize: 14,
  },
  socialText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "white",
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  signUpButton: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  signUpButtonText: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "500",
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

export default LoginScreen;
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../context/ThemeContext";
import eventService from "../services/eventService";
import profileService from "../services/profileService";

const EventRegistrationScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState(null);
  const [registrationTypes, setRegistrationTypes] = useState([]);
  const [workshops, setWorkshops] = useState([]);

  // Form fields
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    designation: "",
    affiliations: "",
    address: "",
    country: "",
    registration_type_id: "",
    selected_workshop: null, // Changed from array to single value
  });

  const [errors, setErrors] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    loadEventAndUserData();
  }, [eventId]);

  useEffect(() => {
    calculateTotalAmount();
  }, [formData.registration_type_id, formData.selected_workshop]);

  const loadEventAndUserData = async () => {
    try {
      setLoading(true);

      // Load event details
      const eventData = await eventService.getEventById(eventId);
      setEvent(eventData);

      // Load registration types for this event
      const regTypes = await eventService.getRegistrationTypes(eventId);
      setRegistrationTypes(regTypes || []);

      // Load workshops for this event
      const workshopsData = await eventService.getWorkshops(eventId);
      setWorkshops(workshopsData || []);

      // Load current user data from profile API (gets latest data)
      const userData = await profileService.getProfile();
      console.log('User data loaded for registration:', userData);

      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        first_name: userData?.first_name || "",
        last_name: userData?.last_name || "",
        email: userData?.email || "",
        phone_number: userData?.phone_number || "",
        designation: userData?.designation || "",
        affiliations: userData?.affiliations || "",
        address: userData?.address || "",
        country: userData?.country || "",
      }));

    } catch (error) {
      console.error("Error loading event data:", error);
      Alert.alert("Error", "Failed to load event details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = () => {
    let total = 0;

    // Add event base fee
    if (event?.registration_fee) {
      total += parseFloat(event.registration_fee);
    }

    // Add registration type fee
    if (formData.registration_type_id) {
      const selectedRegType = registrationTypes.find(
        rt => rt.id === formData.registration_type_id
      );
      if (selectedRegType?.is_paid && selectedRegType?.amount) {
        total += parseFloat(selectedRegType.amount);
      }
    }

    // Add workshop fee (single workshop)
    if (formData.selected_workshop) {
      const workshop = workshops.find(w => w.id === formData.selected_workshop);
      if (workshop?.is_paid && workshop?.fee) {
        total += parseFloat(workshop.fee);
      }
    }

    setTotalAmount(total);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Phone number validation
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else {
      const phoneNumber = formData.phone_number.trim();
      // Check if phone number contains only digits
      if (!/^\d+$/.test(phoneNumber)) {
        newErrors.phone_number = "Phone number must contain only digits";
      }
      // Check if phone number is exactly 11 digits
      else if (phoneNumber.length !== 11) {
        newErrors.phone_number = "Phone number must be exactly 11 digits";
      }
      // Check if phone number starts with 03
      else if (!phoneNumber.startsWith('03')) {
        newErrors.phone_number = "Phone number must start with 03";
      }
    }

    // Registration type is mandatory
    if (registrationTypes.length > 0 && !formData.registration_type_id) {
      newErrors.registration_type_id = "Please select a registration type";
    }

    // Workshop is mandatory if workshops are available
    if (workshops.length > 0 && !formData.selected_workshop) {
      newErrors.selected_workshop = "Please select a workshop";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      // Prepare registration data
      const registrationData = {
        event_id: eventId,
        ...formData,
      };

      // Check if payment is required
      if (totalAmount > 1) {
        // Navigate to payment screen WITH registration data (don't submit yet)
        navigation.replace("Payment", {
          type: 'event_registration',
          eventId: eventId,
          amount: totalAmount,
          title: event.title,
          paymentMethods: event.payment_methods || ['mwallet', 'card'],
          bankDetails: event.bank_details || '',
          registrationData: registrationData, // Pass registration data to payment screen
        });
      } else {
        // Free registration - submit immediately
        const response = await eventService.submitEventRegistration(registrationData);

        // Show success and navigate back
        Alert.alert(
          "Registration Successful",
          "You have successfully registered for this event!",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error submitting registration:", error);
      let errorMessage = "Failed to submit registration. Please try again.";

      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        }
      }

      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const selectWorkshop = (workshopId) => {
    setFormData(prev => ({
      ...prev,
      selected_workshop: prev.selected_workshop === workshopId ? null : workshopId,
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            Loading event details...
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
          Event Registration
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Event Details */}
        <View style={[styles.eventCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.eventTitle, { color: theme.colors.onSurface }]}>
            {event?.title}
          </Text>
          {event?.description && (
            <Text style={[styles.eventDescription, { color: theme.colors.onSurfaceVariant }]}>
              {event.description}
            </Text>
          )}
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Personal Information
          </Text>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                First Name *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.onSurface,
                    borderColor: errors.first_name ? theme.colors.error : theme.colors.border,
                  },
                ]}
                value={formData.first_name}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, first_name: text }));
                  setErrors(prev => ({ ...prev, first_name: null }));
                }}
                placeholder="Enter first name"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
              {errors.first_name && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.first_name}
                </Text>
              )}
            </View>

            <View style={styles.halfWidth}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                Last Name *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.onSurface,
                    borderColor: errors.last_name ? theme.colors.error : theme.colors.border,
                  },
                ]}
                value={formData.last_name}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, last_name: text }));
                  setErrors(prev => ({ ...prev, last_name: null }));
                }}
                placeholder="Enter last name"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
              {errors.last_name && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.last_name}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Email *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.onSurface,
                  borderColor: errors.email ? theme.colors.error : theme.colors.border,
                },
              ]}
              value={formData.email}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, email: text }));
                setErrors(prev => ({ ...prev, email: null }));
              }}
              placeholder="Enter email"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.email}
              </Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Phone Number *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.onSurface,
                  borderColor: errors.phone_number ? theme.colors.error : theme.colors.border,
                },
              ]}
              value={formData.phone_number}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, phone_number: text }));
                setErrors(prev => ({ ...prev, phone_number: null }));
              }}
              placeholder="Enter phone number"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              keyboardType="phone-pad"
            />
            {errors.phone_number && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.phone_number}
              </Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Designation
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.onSurface,
                  borderColor: theme.colors.border,
                },
              ]}
              value={formData.designation}
              onChangeText={(text) => setFormData(prev => ({ ...prev, designation: text }))}
              placeholder="Enter designation"
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Organization/Affiliation
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.onSurface,
                  borderColor: theme.colors.border,
                },
              ]}
              value={formData.affiliations}
              onChangeText={(text) => setFormData(prev => ({ ...prev, affiliations: text }))}
              placeholder="Enter organization"
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Address
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.onSurface,
                  borderColor: theme.colors.border,
                },
              ]}
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              placeholder="Enter address"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Country
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.onSurface,
                  borderColor: theme.colors.border,
                },
              ]}
              value={formData.country}
              onChangeText={(text) => setFormData(prev => ({ ...prev, country: text }))}
              placeholder="Enter country"
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>
        </View>

        {/* Registration Type Section */}
        {registrationTypes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Registration Type *
            </Text>

            {registrationTypes.map((regType) => (
              <TouchableOpacity
                key={regType.id}
                style={[
                  styles.radioOption,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: formData.registration_type_id === regType.id
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
                onPress={() => {
                  setFormData(prev => ({ ...prev, registration_type_id: regType.id }));
                  setErrors(prev => ({ ...prev, registration_type_id: null }));
                }}
              >
                <Icon
                  name={formData.registration_type_id === regType.id ? "radiobox-marked" : "radiobox-blank"}
                  size={24}
                  color={formData.registration_type_id === regType.id ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <View style={styles.radioContent}>
                  <Text style={[styles.radioLabel, { color: theme.colors.onSurface }]}>
                    {regType.name}
                  </Text>
                  {regType.description && (
                    <Text style={[styles.radioDescription, { color: theme.colors.onSurfaceVariant }]}>
                      {regType.description}
                    </Text>
                  )}
                  {regType.is_paid && (
                    <Text style={[styles.radioPrice, { color: theme.colors.primary }]}>
                      PKR {regType.amount}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {errors.registration_type_id && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.registration_type_id}
              </Text>
            )}
          </View>
        )}

        {/* Workshops Section */}
        {workshops.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Select Workshop *
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Choose one workshop to attend (Required)
            </Text>

            {workshops.map((workshop) => (
              <TouchableOpacity
                key={workshop.id}
                style={[
                  styles.radioOption,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: formData.selected_workshop === workshop.id
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
                onPress={() => selectWorkshop(workshop.id)}
              >
                <Icon
                  name={formData.selected_workshop === workshop.id ? "radiobox-marked" : "radiobox-blank"}
                  size={24}
                  color={formData.selected_workshop === workshop.id ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <View style={styles.radioContent}>
                  <Text style={[styles.radioLabel, { color: theme.colors.onSurface }]}>
                    {workshop.title}
                  </Text>
                  {workshop.description && (
                    <Text style={[styles.radioDescription, { color: theme.colors.onSurfaceVariant }]}>
                      {workshop.description}
                    </Text>
                  )}
                  {workshop.is_paid && workshop.fee && (
                    <Text style={[styles.radioPrice, { color: theme.colors.primary }]}>
                      PKR {workshop.fee}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {errors.selected_workshop && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.selected_workshop}
              </Text>
            )}
          </View>
        )}

        {/* Cost Summary */}
        {totalAmount > 0 && (
          <View style={[styles.costSummary, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: theme.colors.onSurface }]}>
                Total Amount:
              </Text>
              <Text style={[styles.costValue, { color: theme.colors.primary }]}>
                PKR {totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.primary },
            submitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {totalAmount > 1 ? "Proceed to Payment" : "Complete Registration"}
            </Text>
          )}
        </TouchableOpacity>

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
  eventCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    marginTop: -8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  checkboxOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  radioContent: {
    flex: 1,
    marginLeft: 12,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  radioDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  radioPrice: {
    fontSize: 14,
    fontWeight: "700",
  },
  costSummary: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  costLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  costValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  submitButton: {
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 32,
  },
});

export default EventRegistrationScreen;

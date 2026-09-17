import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  BackHandler,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RenderHTML from 'react-native-render-html';
import { CreditCardIcon, DollarIcon } from '../components/SvgIcons';
import paymentService from '../services/paymentService';
import eventService from '../services/eventService';
import { useTheme } from '../context/ThemeContext';

const PaymentScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const {
    type, // 'event' or 'session' or 'event_registration'
    id, // event ID or session ID (only for non-registration payments)
    eventId, // event ID for registration
    amount,
    title,
    paymentMethods = ['mwallet', 'card'],
    bankDetails = '',
    registrationData = null, // Registration data to submit after payment
    isHeldRegistration = false, // Flag indicating registration already exists (for held registrations)
  } = route.params;

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [cnic, setCnic] = useState('');
  const [processing, setProcessing] = useState(false);

  // Bank transfer fields
  const [paymentDate, setPaymentDate] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Helper function to strip HTML tags and decode HTML entities
  const stripHTML = (html) => {
    if (!html) return '';

    // First, convert line break tags to newlines BEFORE removing other tags
    let text = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p>/gi, '')
      .replace(/<\/div>/gi, '\n')
      .replace(/<div>/gi, '');

    // Remove all other HTML tags
    text = text.replace(/<[^>]*>/g, '');

    // Decode common HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"');

    // Clean up excessive newlines (more than 2 consecutive) but preserve single and double newlines
    text = text.replace(/\n{3,}/g, '\n\n');

    // Trim each line while preserving newlines
    text = text.split('\n').map(line => line.trim()).join('\n');

    // Trim the entire string
    return text.trim();
  };

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Cancel Payment?',
        'Going back will cancel your registration. Are you sure you want to continue?',
        [
          {
            text: 'Stay',
            style: 'cancel',
          },
          {
            text: 'Go Back',
            style: 'destructive',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main', params: { screen: 'Browse' } }],
              });
            },
          },
        ]
      );
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const pickReceipt = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setReceiptFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
    if (date) {
      setSelectedDate(date);
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      setPaymentDate(formattedDate);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment?',
      'Going back will cancel your registration. Are you sure you want to continue?',
      [
        {
          text: 'Stay',
          style: 'cancel',
        },
        {
          text: 'Go Back',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main', params: { screen: 'Browse' } }],
            });
          },
        },
      ]
    );
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (selectedMethod === 'mwallet') {
      // Validate mobile number
      if (!mobileNumber || mobileNumber.length !== 11 || !mobileNumber.startsWith('03')) {
        Alert.alert('Error', 'Please enter a valid mobile number (03XXXXXXXXX)');
        return;
      }

      // Validate CNIC
      if (!cnic || cnic.length !== 6) {
        Alert.alert('Error', 'Please enter last 6 digits of your CNIC');
        return;
      }
    }

    if (selectedMethod === 'bank_transfer') {
      // Validate bank transfer fields
      if (!paymentDate) {
        Alert.alert('Error', 'Please select payment date');
        return;
      }

      if (!receiptFile) {
        Alert.alert('Error', 'Please upload payment receipt');
        return;
      }
    }

    setProcessing(true);

    try {
      let response;
      const description = `Payment for ${type}: ${title}`;

      if (type === 'event_registration') {
        // For held registrations, we cannot use bank transfer (registration already exists)
        // Bank transfer creates registration with 'pending' status, not 'hold'
        if (isHeldRegistration) {
          // Registration already exists with 'hold' status, just process payment
          // Only online payments (card/mwallet) are allowed for held registrations
          if (selectedMethod === 'bank_transfer') {
            Alert.alert('Error', 'Bank transfer is not available for held registrations. Please use Card or Mobile Wallet payment.');
            setProcessing(false);
            return;
          }

          if (selectedMethod === 'mwallet') {
            response = await paymentService.initiateEventMWalletPayment(
              eventId,
              amount,
              mobileNumber,
              cnic,
              description
            );
          } else if (selectedMethod === 'card') {
            response = await paymentService.initiateEventCardPayment(
              eventId,
              amount,
              description
            );
          }
        } else {
          // Normal flow: creating new registration
          if (!registrationData) {
            throw new Error('Registration data is missing');
          }

          // For bank transfer, we submit registration with payment info together
          // The backend will create registration with pending status
          if (selectedMethod === 'bank_transfer') {
            // Submit registration with bank transfer payment data
            response = await eventService.submitEventRegistrationWithBankTransfer({
              registrationData,
              paymentDate,
              receiptFile,
              amount,
              notes
            });
          } else {
            // For online payments (mwallet/card), create registration first
            // Backend will automatically set 'hold' status for paid events
            const registrationResponse = await eventService.submitEventRegistration(registrationData);
            const registrationId = registrationResponse.registration_id;

            if (selectedMethod === 'mwallet') {
              response = await paymentService.initiateEventMWalletPayment(
                eventId,
                amount,
                mobileNumber,
                cnic,
                description
              );
            } else if (selectedMethod === 'card') {
              response = await paymentService.initiateEventCardPayment(
                eventId,
                amount,
                description
              );
            }
          }
        }
      } else if (type === 'event') {
        if (selectedMethod === 'bank_transfer') {
          response = await paymentService.submitBankTransferPayment(
            id,
            amount,
            paymentDate,
            receiptFile,
            notes,
            'event'
          );
        } else if (selectedMethod === 'mwallet') {
          response = await paymentService.initiateEventMWalletPayment(
            id,
            amount,
            mobileNumber,
            cnic,
            description
          );
        } else if (selectedMethod === 'card') {
          response = await paymentService.initiateEventCardPayment(
            id,
            amount,
            description
          );
        }
      } else if (type === 'session') {
        if (selectedMethod === 'bank_transfer') {
          response = await paymentService.submitBankTransferPayment(
            id,
            amount,
            paymentDate,
            receiptFile,
            notes,
            'session'
          );
        } else if (selectedMethod === 'mwallet') {
          response = await paymentService.initiateSessionMWalletPayment(
            id,
            amount,
            mobileNumber,
            cnic,
            description
          );
        } else if (selectedMethod === 'card') {
          response = await paymentService.initiateSessionCardPayment(
            id,
            amount,
            description
          );
        }
      }

      if (response.success) {
        // For bank transfer, show success message and navigate back
        if (selectedMethod === 'bank_transfer') {
          Alert.alert(
            'Registration Submitted',
            'Your registration has been submitted successfully. Your payment will be verified by the organizer and you will be notified once confirmed.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate back to Browse Events screen
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main', params: { screen: 'Browse' } }],
                  });
                },
              },
            ]
          );
        } else if (selectedMethod === 'card') {
          // For card payments, navigate to WebView
          navigation.navigate('CardPaymentWebView', {
            formData: response.form_data,
            txnRefNo: response.txn_ref_no,
            type,
            id: eventId || id,  // Use eventId for held registrations, id for others
          });
        } else {
          // For MWallet, navigate directly to status screen
          navigation.navigate('PaymentStatus', {
            txnRefNo: response.txn_ref_no || response.data?.pp_TxnRefNo,
            type,
            id: eventId || id,  // Use eventId for held registrations, id for others
          });
        }
      } else {
        Alert.alert('Payment Failed', response.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to process payment. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <DollarIcon size={48} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>Complete Payment</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>{title}</Text>
          <View style={[styles.amountContainer, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
            <Text style={[styles.amountLabel, { color: theme.colors.onSurfaceVariant }]}>Total Amount</Text>
            <Text style={[styles.amountValue, { color: theme.colors.primary }]}>PKR {amount}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Select Payment Method</Text>

          {/* Mobile Wallet */}
          {paymentMethods.includes('mwallet') && (
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
                selectedMethod === 'mwallet' && { borderColor: theme.colors.primary, borderWidth: 2 },
              ]}
              onPress={() => setSelectedMethod('mwallet')}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodContent}>
                <View style={[styles.paymentIconContainer, { backgroundColor: '#FFFFFF' }]}>
                  <Image
                    source={require('../../jazzcash-logo.png')}
                    style={styles.jazzCashLogo}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.paymentMethodText}>
                  <Text style={[styles.paymentMethodTitle, { color: theme.colors.onSurface }]}>JazzCash Mobile Wallet</Text>
                  <Text style={[styles.paymentMethodSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                    Pay using JazzCash mobile wallet
                  </Text>
                </View>
              </View>
              {selectedMethod === 'mwallet' && (
                <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Card Payment */}
          {paymentMethods.includes('card') && (
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
                selectedMethod === 'card' && { borderColor: theme.colors.primary, borderWidth: 2 },
              ]}
              onPress={() => setSelectedMethod('card')}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodContent}>
                <View style={[styles.paymentIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                  <CreditCardIcon size={32} color={theme.colors.primary} />
                </View>
                <View style={styles.paymentMethodText}>
                  <Text style={[styles.paymentMethodTitle, { color: theme.colors.onSurface }]}>Credit/Debit Card</Text>
                  <Text style={[styles.paymentMethodSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                    Pay using Visa, Mastercard, etc.
                  </Text>
                </View>
              </View>
              {selectedMethod === 'card' && (
                <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Bank Transfer */}
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
              selectedMethod === 'bank_transfer' && { borderColor: theme.colors.primary, borderWidth: 2 },
            ]}
            onPress={() => setSelectedMethod('bank_transfer')}
            activeOpacity={0.7}
          >
            <View style={styles.paymentMethodContent}>
              <View style={[styles.paymentIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                <Icon name="bank" size={32} color={theme.colors.primary} />
              </View>
              <View style={styles.paymentMethodText}>
                <Text style={[styles.paymentMethodTitle, { color: theme.colors.onSurface }]}>Bank Transfer (Offline)</Text>
                <Text style={[styles.paymentMethodSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                  Pay via bank transfer and upload receipt
                </Text>
              </View>
            </View>
            {selectedMethod === 'bank_transfer' && (
              <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Mobile Wallet Form */}
        {selectedMethod === 'mwallet' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Mobile Wallet Details</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                Mobile Number <Text style={{ color: theme.colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.onSurface, borderColor: theme.colors.border }]}
                placeholder="03XXXXXXXXX"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
                maxLength={11}
              />
              <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
                Enter your JazzCash mobile number
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                CNIC <Text style={{ color: theme.colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.onSurface, borderColor: theme.colors.border }]}
                placeholder="Last 6 digits"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={cnic}
                onChangeText={setCnic}
                keyboardType="number-pad"
                maxLength={6}
                secureTextEntry
              />
              <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
                Enter last 6 digits of your CNIC
              </Text>
            </View>
          </View>
        )}

        {/* Bank Transfer Form */}
        {selectedMethod === 'bank_transfer' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Bank Transfer Details</Text>

            {bankDetails ? (
              <View style={[styles.bankDetails, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.primary, borderWidth: 1 }]}>
                <Icon name="bank" size={20} color={theme.colors.primary} style={styles.bankIcon} />
                <View style={{ flex: 1 }}>
                  <RenderHTML
                    contentWidth={width - 100}
                    source={{ html: bankDetails }}
                    baseStyle={{
                      color: theme.colors.onSurface,
                      fontSize: 14,
                      lineHeight: 20,
                    }}
                    tagsStyles={{
                      strong: { fontWeight: 'bold', color: theme.colors.onSurface },
                      b: { fontWeight: 'bold', color: theme.colors.onSurface },
                      em: { fontStyle: 'italic', color: theme.colors.onSurface },
                      i: { fontStyle: 'italic', color: theme.colors.onSurface },
                      p: { margin: 0, marginVertical: 0, color: theme.colors.onSurface },
                      body: { margin: 0, padding: 0 },
                    }}
                  />
                </View>
              </View>
            ) : (
              <View style={[styles.bankDetails, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.primary, borderWidth: 1 }]}>
                <Icon name="information" size={20} color={theme.colors.primary} />
                <Text style={[styles.bankDetailsText, { color: theme.colors.onSurface }]}>
                  Please transfer the amount to the organizer's bank account and upload the payment receipt below.
                </Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                Payment Date <Text style={{ color: theme.colors.error }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.input, styles.datePickerInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={showDatePickerModal}
              >
                <Text style={[styles.datePickerText, { color: paymentDate ? theme.colors.onSurface : theme.colors.onSurfaceVariant }]}>
                  {paymentDate || 'Select payment date'}
                </Text>
                <Icon name="calendar" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
              <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
                Date when you made the payment
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                Payment Receipt <Text style={{ color: theme.colors.error }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={pickReceipt}
              >
                <Icon name="file-upload" size={24} color={theme.colors.primary} />
                <Text style={[styles.uploadButtonText, { color: theme.colors.onSurface }]}>
                  {receiptFile ? receiptFile.name : 'Choose Receipt Image'}
                </Text>
              </TouchableOpacity>
              {receiptFile && (
                <Text style={[styles.fileName, { color: theme.colors.primary }]}>
                  ✓ {receiptFile.name}
                </Text>
              )}
              <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
                Upload a screenshot or photo of your payment receipt
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                Additional Notes (Optional)
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.colors.surface, color: theme.colors.onSurface, borderColor: theme.colors.border }]}
                placeholder="Any additional information..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={[styles.warningBox, { backgroundColor: theme.colors.surfaceVariant, borderColor: '#F59E0B', borderWidth: 1 }]}>
              <Icon name="alert" size={20} color="#F59E0B" />
              <Text style={[styles.warningText, { color: theme.colors.onSurface }]}>
                Your registration will be marked as "Pending Approval" until the organizer verifies your payment receipt.
              </Text>
            </View>
          </View>
        )}

        {/* Payment Button */}
        {selectedMethod && (
          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: theme.colors.primary }]}
            onPress={handlePayment}
            disabled={processing}
            activeOpacity={0.7}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.payButtonText}>
                {selectedMethod === 'bank_transfer' ? 'Submit Registration' : `Pay PKR ${amount}`}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Cancel Button */}
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.colors.border }]}
          onPress={handleCancel}
          disabled={processing}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelButtonText, { color: theme.colors.onSurface }]}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
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

  header: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },

  amountContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  amountLabel: {
    fontSize: 14,
    marginBottom: 4,
  },

  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  paymentMethod: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  paymentIcon: {
    fontSize: 24,
  },

  jazzCashLogo: {
    width: 40,
    height: 40,
  },

  paymentMethodText: {
    flex: 1,
  },

  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },

  paymentMethodSubtitle: {
    fontSize: 14,
  },

  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  formGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },

  datePickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  datePickerText: {
    fontSize: 16,
    flex: 1,
  },

  hint: {
    fontSize: 12,
    marginTop: 4,
  },

  payButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },

  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  cancelButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  bankDetails: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },

  bankDetailsText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },

  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  uploadButtonText: {
    marginLeft: 8,
    fontSize: 14,
  },

  fileName: {
    fontSize: 12,
    marginTop: 8,
  },

  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  warningBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },

  warningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
  },
});

export default PaymentScreen;

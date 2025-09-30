import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
// Use React Native icons instead of Expo vector icons for compatibility
import { Text as IconText } from 'react-native';

// Import QRScanner and Camera for permission checking
let QRScanner = null;
let Camera = null;
try {
  QRScanner = require('../components/QRScanner').default;
  Camera = require('expo-camera').Camera;
} catch (error) {
  console.log('Camera modules not available:', error.message);
}

const QRScannerScreen = ({ navigation, route }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(true);
  const [manualInput, setManualInput] = useState('');
  const [cameraPermission, setCameraPermission] = useState(null);
  const [showFallback, setShowFallback] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);

  // Check camera permissions when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      checkCameraPermissions();
      setIsCameraVisible(true);
      return () => setIsCameraVisible(false);
    }, [])
  );

  const checkCameraPermissions = async () => {
    try {
      if (!Camera) {
        console.log('Camera not available, showing fallback');
        setShowFallback(true);
        setPermissionChecked(true);
        return;
      }

      const { status } = await Camera.getCameraPermissionsAsync();
      console.log('Current camera permission status:', status);

      setCameraPermission(status);
      setPermissionChecked(true);

      // If permission is denied, show fallback with option to request
      if (status === 'denied' || status === 'undetermined') {
        setShowFallback(true);
      } else if (status === 'granted') {
        setShowFallback(false);
      }
    } catch (error) {
      console.log('Error checking camera permissions:', error);
      setShowFallback(true);
      setPermissionChecked(true);
    }
  };

  const requestCameraPermission = async () => {
    try {
      if (!Camera) {
        Alert.alert(
          'Camera Not Available',
          'Camera functionality requires a development build. Please use manual input or build the app for production.'
        );
        return;
      }

      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log('Camera permission request result:', status);

      setCameraPermission(status);

      if (status === 'granted') {
        setShowFallback(false);
        Alert.alert(
          'Permission Granted!',
          'Camera access granted. You can now use the QR scanner.'
        );
      } else {
        Alert.alert(
          'Permission Denied',
          'Camera permission is required to scan QR codes. Please grant permission in your device settings or use manual input.',
          [
            {
              text: 'Use Manual Input',
              onPress: () => setShowFallback(true),
            },
            {
              text: 'Try Again',
              onPress: requestCameraPermission,
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert(
        'Error',
        'Failed to request camera permission. Please try again or use manual input.'
      );
    }
  };

  const handleQRScanned = async (qrData) => {
    try {
      setIsProcessing(true);
      console.log('Processing QR data:', qrData);

      // Check if this is a check-in QR code
      if (qrData.type === 'checkin_url') {
        await handleCheckIn(qrData.eventId);
        return;
      }

      // Extract event ID from different QR code formats
      let eventId = null;
      let eventDetails = null;

      if (qrData.type === 'registration_url' || qrData.type === 'event_url') {
        eventId = qrData.eventId;
      } else if (qrData.type === 'structured_data') {
        eventId = qrData.eventId;
        if (qrData.event_agenda) {
          // For agenda QR codes, we might want to navigate to agenda directly
          eventDetails = { isAgenda: true };
        }
      }

      if (!eventId) {
        throw new Error('No event ID found in QR code');
      }

      // Get user token
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert(
          'Authentication Required',
          'Please log in to register for events.',
          [
            {
              text: 'Cancel',
              onPress: () => navigation.goBack(),
            },
            {
              text: 'Login',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
        return;
      }

      // Fetch event details first
      const eventResponse = await api.get(`/events/${eventId}/`);

      const event = eventResponse.data;

      // Check if user is already registered
      try {
        const registrationResponse = await api.get(
          `/events/${eventId}/registration_status/`
        );

        if (registrationResponse.data.is_registered) {
          Alert.alert(
            'Already Registered',
            `You are already registered for "${event.title}". Would you like to view the event details?`,
            [
              {
                text: 'Cancel',
                onPress: () => navigation.goBack(),
              },
              {
                text: 'View Event',
                onPress: () => {
                  navigation.navigate('EventDetail', { event, eventId });
                },
              },
            ]
          );
          return;
        }
      } catch (registrationCheckError) {
        // If endpoint doesn't exist, continue with registration
        console.log('Registration status check not available:', registrationCheckError.message);
      }

      // Show confirmation dialog
      Alert.alert(
        'Register for Event',
        `Would you like to register for "${event.title}"?\n\nDate: ${new Date(event.date).toLocaleDateString()}\nLocation: ${event.location}`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Register',
            onPress: () => registerForEvent(eventId, event),
          },
        ]
      );

    } catch (error) {
      console.error('Error processing QR code:', error);

      let errorMessage = 'Failed to process QR code.';

      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Event not found. The QR code may be invalid or the event may no longer exist.';
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in and try again.';
        } else if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(
        'Error',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => setIsProcessing(false),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const handleCheckIn = async (eventId) => {
    try {
      // Get user token and user info
      const token = await AsyncStorage.getItem('authToken');
      const userInfoStr = await AsyncStorage.getItem('userInfo');

      if (!token || !userInfoStr) {
        Alert.alert(
          'Authentication Required',
          'Please log in to check in for events.',
          [
            {
              text: 'Login',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
        return;
      }

      const userInfo = JSON.parse(userInfoStr);
      const userId = userInfo.id || userInfo.user_id;

      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }

      // Send check-in request
      const response = await api.post(
        `/events/${eventId}/check_in/`,
        { user_id: userId }
      );

      if (response.data.success) {
        Alert.alert(
          '✅ Check-In Successful!',
          `You have been checked in for "${response.data.attendee.event}".\n\nPlease proceed to the entrance to collect your entry pass.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Check-in error:', error);

      let errorMessage = 'Check-in failed. Please try again.';

      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Registration not found. Please ensure you are registered for this event.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.error || 'Invalid check-in request.';
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in and try again.';
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(
        'Check-In Failed',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => setIsProcessing(false),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const registerForEvent = async (eventId, event) => {
    try {
      const response = await api.post(
        `/events/${eventId}/register/`,
        {}
      );

      Alert.alert(
        'Registration Successful!',
        `You have been registered for "${event.title}". You can view your registration in the Events tab.`,
        [
          {
            text: 'View Event',
            onPress: () => {
              navigation.navigate('EventDetail', { event, eventId });
            },
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';

      if (error.response && error.response.data) {
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }

      // Only log unexpected errors, not expected ones like "already registered"
      if (!errorMessage.toLowerCase().includes('already registered')) {
        console.error('Registration error:', error);
      }

      Alert.alert(
        'Registration Failed',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => setIsProcessing(false),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      Alert.alert('Error', 'Please enter a QR code or URL');
      return;
    }

    // Simulate QR scan with manual input
    const qrData = parseQRCode(manualInput.trim());
    if (qrData) {
      handleQRScanned(qrData);
    } else {
      Alert.alert(
        'Invalid Input',
        'Please enter a valid event URL or QR code data.\n\nExamples:\n• http://domain.com/register/123/\n• EVENT_AGENDA:123|TITLE:Event Name'
      );
    }
  };

  const parseQRCode = (data) => {
    try {
      // Check if it's a check-in URL from the organizer's QR code
      if (data.includes('/api/events/') && data.includes('/check-in')) {
        const match = data.match(/\/api\/events\/(\d+)\/check-in/);
        if (match) {
          return {
            type: 'checkin_url',
            eventId: match[1],
            originalData: data
          };
        }
      }

      // Check if it's a registration URL from Django
      if (data.includes('/register/')) {
        const match = data.match(/\/register\/(\d+)\//);
        if (match) {
          return {
            type: 'registration_url',
            eventId: match[1],
            originalData: data
          };
        }
      }

      // Check if it's structured data format
      if (data.includes('|') && data.includes(':')) {
        const parts = data.split('|');
        const parsedData = { type: 'structured_data' };

        for (const part of parts) {
          const [key, value] = part.split(':');
          parsedData[key.toLowerCase()] = value;
        }

        if (parsedData.event || parsedData.event_agenda) {
          parsedData.eventId = parsedData.event || parsedData.event_agenda;
          return parsedData;
        }
      }

      // If it's just a number, assume it's an event ID
      if (/^\d+$/.test(data)) {
        return {
          type: 'event_id',
          eventId: data,
          originalData: data
        };
      }

      return null;
    } catch (error) {
      console.error('Error parsing QR code:', error);
      return null;
    }
  };

  const renderFallbackInterface = () => (
    <SafeAreaView style={styles.fallbackContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter Event Info</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.fallbackContent}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoIcon}>📷</Text>
          <Text style={styles.infoTitle}>
            {!Camera ? 'Camera Scanner Not Available' :
             cameraPermission === 'denied' ? 'Camera Permission Needed' :
             cameraPermission === 'undetermined' ? 'Camera Permission Required' :
             'Camera Scanner Not Available'}
          </Text>
          <Text style={styles.infoText}>
            {!Camera
              ? 'QR camera scanning requires a development build. For now, you can manually enter the event information below.'
              : cameraPermission === 'denied'
              ? 'Camera access was denied. Please grant permission to use QR scanning or use manual input below.'
              : cameraPermission === 'undetermined'
              ? 'Camera permission is needed to scan QR codes. Grant permission to enable camera scanning.'
              : 'Camera permission is required for QR scanning. You can still manually enter event information below.'
            }
          </Text>

          {/* Show permission button if camera is available but permission not granted */}
          {Camera && cameraPermission !== 'granted' && (
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestCameraPermission}
            >
              <Text style={styles.permissionButtonIcon}>🔓</Text>
              <Text style={styles.permissionButtonText}>
                {cameraPermission === 'denied' ? 'Grant Camera Permission' : 'Request Camera Permission'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Manual Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Enter Event URL or ID:</Text>
          <TextInput
            style={styles.textInput}
            value={manualInput}
            onChangeText={setManualInput}
            placeholder="e.g., http://domain.com/register/123/ or just 123"
            placeholderTextColor="#9CA3AF"
            multiline={true}
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.submitButton, !manualInput.trim() && styles.disabledButton]}
            onPress={handleManualSubmit}
            disabled={!manualInput.trim() || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.submitButtonText}>Register for Event</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Examples Section */}
        <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>Valid Formats:</Text>
          <TouchableOpacity
            style={styles.exampleButton}
            onPress={() => setManualInput('http://165.232.126.196:8000/api/events/1/check-in')}
          >
            <Text style={styles.exampleText}>Check-in: /api/events/1/check-in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exampleButton}
            onPress={() => setManualInput('http://165.232.126.196:8000/register/1/')}
          >
            <Text style={styles.exampleText}>Register: /register/1/</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exampleButton}
            onPress={() => setManualInput('EVENT_AGENDA:1|TITLE:Sample Event')}
          >
            <Text style={styles.exampleText}>EVENT_AGENDA:1|TITLE:Sample Event</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exampleButton}
            onPress={() => setManualInput('1')}
          >
            <Text style={styles.exampleText}>1 (Event ID only)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  if (isProcessing) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#4A6CF7" />
        <Text style={styles.processingText}>Processing...</Text>
      </View>
    );
  }

  // Show loading while checking permissions
  if (!permissionChecked) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#4A6CF7" />
        <Text style={styles.processingText}>Checking camera permissions...</Text>
      </View>
    );
  }

  // Show fallback interface if no camera, no QRScanner, or no permission
  if (showFallback || !QRScanner || !Camera || cameraPermission !== 'granted') {
    return renderFallbackInterface();
  }

  // Show camera scanner if everything is available and permission granted
  return (
    <View style={styles.container}>
      <QRScanner
        onQRScanned={handleQRScanned}
        onClose={handleClose}
        isVisible={isCameraVisible}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4A6CF7',
    fontWeight: '600',
  },

  // Fallback Interface Styles
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeIcon: {
    fontSize: 24,
    color: '#1F2937',
    fontWeight: 'bold',
  },

  headerTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
  },

  placeholder: {
    width: 40,
  },

  fallbackContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  infoSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },

  infoIcon: {
    fontSize: 48,
  },

  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A6CF7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },

  permissionButtonIcon: {
    fontSize: 16,
  },

  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  infoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  inputSection: {
    marginBottom: 32,
  },

  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },

  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },

  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A6CF7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },

  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  checkIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  examplesSection: {
    flex: 1,
  },

  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },

  exampleButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },

  exampleText: {
    fontSize: 12,
    color: '#4A6CF7',
    fontFamily: 'monospace',
  },
});

export default QRScannerScreen;
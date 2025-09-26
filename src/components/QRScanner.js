import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';

const { width, height } = Dimensions.get('window');

const QRScanner = ({ onQRScanned, onClose, isVisible = true }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to scan QR codes for event registration.',
          [
            {
              text: 'Cancel',
              onPress: onClose,
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => {
                // In a real app, you'd open device settings
                // Linking.openSettings();
                onClose();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Error', 'Failed to request camera permission');
      onClose();
    }
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      console.log('QR Code scanned:', { type, data });

      // Parse the QR code data
      const parsedData = parseQRCode(data);

      if (parsedData) {
        await onQRScanned(parsedData);
      } else {
        Alert.alert(
          'Invalid QR Code',
          'This QR code is not recognized as a valid event registration code.',
          [
            {
              text: 'Scan Again',
              onPress: () => {
                setScanned(false);
                setLoading(false);
              }
            },
            {
              text: 'Cancel',
              onPress: onClose,
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert(
        'Error',
        'Failed to process QR code. Please try again.',
        [
          {
            text: 'Scan Again',
            onPress: () => {
              setScanned(false);
              setLoading(false);
            }
          },
          {
            text: 'Cancel',
            onPress: onClose,
            style: 'cancel'
          }
        ]
      );
    }
  };

  const parseQRCode = (data) => {
    try {
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

      // Check if it's structured data format (TICKET:xxx|EVENT:xxx|ATTENDEE:xxx)
      if (data.includes('|') && data.includes(':')) {
        const parts = data.split('|');
        const parsedData = { type: 'structured_data' };

        for (const part of parts) {
          const [key, value] = part.split(':');
          parsedData[key.toLowerCase()] = value;
        }

        // Check if it has event information
        if (parsedData.event || parsedData.event_agenda) {
          parsedData.eventId = parsedData.event || parsedData.event_agenda;
          return parsedData;
        }
      }

      // If it's just a URL, try to extract event ID
      try {
        const url = new URL(data);
        const pathMatch = url.pathname.match(/\/events?\/(\d+)/);
        if (pathMatch) {
          return {
            type: 'event_url',
            eventId: pathMatch[1],
            originalData: data
          };
        }
      } catch (urlError) {
        // Not a valid URL, continue with other checks
      }

      // Return null if we can't parse it
      return null;
    } catch (error) {
      console.error('Error parsing QR code:', error);
      return null;
    }
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const resetScanner = () => {
    setScanned(false);
    setLoading(false);
  };

  if (!isVisible) {
    return null;
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A6CF7" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Please allow camera access to scan QR codes for event registration.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
          <Text style={styles.flashText}>{flashOn ? "⚡" : "💡"}</Text>
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          enableTorch={flashOn}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          {/* Scanning Overlay */}
          <View style={styles.overlay}>
            {/* Top overlay */}
            <View style={styles.overlayTop} />

            {/* Middle section with scanning area */}
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />

              {/* Scanning Square */}
              <View style={styles.scanningSquare}>
                {/* Corner borders */}
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />

                {loading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#4A6CF7" />
                    <Text style={styles.processingText}>Processing...</Text>
                  </View>
                )}
              </View>

              <View style={styles.overlaySide} />
            </View>

            {/* Bottom overlay */}
            <View style={styles.overlayBottom} />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Point your camera at the QR code on the event page
            </Text>
            <Text style={styles.subInstructionsText}>
              The QR code will be scanned automatically
            </Text>
          </View>
        </CameraView>
      </View>

      {/* Bottom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, scanned && styles.controlButtonDisabled]}
          onPress={resetScanner}
          disabled={!scanned}
        >
          <Text style={styles.refreshIcon}>🔄</Text>
          <Text style={[styles.controlButtonText, scanned && styles.controlButtonTextActive]}>
            Scan Again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Loading and Permission States
  loadingText: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
  },

  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  permissionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  permissionButton: {
    backgroundColor: '#4A6CF7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },

  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },

  flashButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Camera
  cameraContainer: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },

  // Overlay
  overlay: {
    flex: 1,
  },

  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  overlayMiddle: {
    flexDirection: 'row',
    height: 250,
  },

  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  // Scanning Square
  scanningSquare: {
    width: 250,
    height: 250,
    position: 'relative',
  },

  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#4A6CF7',
    borderWidth: 3,
  },

  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },

  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },

  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  processingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4A6CF7',
    fontWeight: '600',
  },

  // Instructions
  instructionsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  instructionsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },

  subInstructionsText: {
    color: '#E5E7EB',
    fontSize: 14,
    textAlign: 'center',
  },

  // Controls
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },

  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  controlButtonDisabled: {
    // Enabled state when scanned is true
  },

  controlButtonText: {
    color: '#6B7280',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },

  controlButtonTextActive: {
    color: '#4A6CF7',
  },

  // Icon styles
  closeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },

  flashText: {
    fontSize: 20,
  },

  refreshIcon: {
    fontSize: 16,
    color: '#6B7280',
  },

  cameraIcon: {
    fontSize: 64,
  },
});

export default QRScanner;
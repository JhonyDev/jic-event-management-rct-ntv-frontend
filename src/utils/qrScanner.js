import { Alert } from 'react-native';

// QR Scanner utility functions
export class QRScannerService {
  static parseEventQR(data) {
    try {
      // Handle different QR code formats
      if (data.startsWith('http')) {
        // URL-based QR code
        const url = new URL(data);
        const eventId = url.searchParams.get('eventId') || url.pathname.split('/').pop();
        return {
          type: 'url',
          eventId: eventId,
          originalData: data
        };
      }

      if (data.startsWith('EVENT:')) {
        // Custom event format: EVENT:123
        const eventId = data.replace('EVENT:', '');
        return {
          type: 'event',
          eventId: eventId,
          originalData: data
        };
      }

      if (data.includes('event') && data.includes('id')) {
        // JSON format
        const parsed = JSON.parse(data);
        return {
          type: 'json',
          eventId: parsed.eventId || parsed.event_id,
          originalData: data
        };
      }

      // Try to parse as number (simple event ID)
      const numericId = parseInt(data, 10);
      if (!isNaN(numericId)) {
        return {
          type: 'numeric',
          eventId: numericId.toString(),
          originalData: data
        };
      }

      throw new Error('Invalid QR format');
    } catch (error) {
      console.error('Error parsing QR code:', error);
      return null;
    }
  }

  static showQRError(message = 'Invalid QR Code') {
    Alert.alert(
      'QR Code Error',
      message,
      [
        { text: 'Try Again', style: 'default' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }

  static showQRSuccess(eventTitle, onJoin, onCancel) {
    Alert.alert(
      'Event Found!',
      `Would you like to join "${eventTitle}"?`,
      [
        { text: 'Maybe Later', style: 'cancel', onPress: onCancel },
        { text: 'Join Event', style: 'default', onPress: onJoin }
      ]
    );
  }

  static async requestCameraPermission() {
    // Note: This will need expo-camera or react-native-camera
    // For now, we'll create a placeholder
    try {
      // const { status } = await Camera.requestCameraPermissionsAsync();
      // return status === 'granted';

      // Placeholder - always return true for development
      return true;
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  }

  static showPermissionError() {
    Alert.alert(
      'Camera Permission Required',
      'Please allow camera access to scan QR codes.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', style: 'default' }
      ]
    );
  }
}

export default QRScannerService;
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';

const CardPaymentWebView = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { formData, txnRefNo, type, id } = route.params;
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const [showingResult, setShowingResult] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Generate HTML form that auto-submits to JazzCash
  const generateFormHTML = () => {
    const fields = Object.entries(formData.fields)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
      .join('\n');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Processing Payment...</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 20px;
            }
            .spinner {
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            h2 { color: #333; margin: 0 0 10px 0; }
            p { color: #666; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h2>Redirecting to Payment Gateway</h2>
            <p>Please wait while we redirect you to JazzCash...</p>
          </div>
          <form id="paymentForm" method="${formData.method}" action="${formData.action}">
            ${fields}
          </form>
          <script>
            // Auto-submit form after 1 second
            setTimeout(function() {
              document.getElementById('paymentForm').submit();
            }, 1000);
          </script>
        </body>
      </html>
    `;
  };

  // Countdown effect when showing result
  useEffect(() => {
    if (showingResult && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showingResult && countdown === 0) {
      // Navigate after countdown reaches 0
      navigation.replace('PaymentStatus', {
        txnRefNo,
        type,
        id,
      });
    }
  }, [showingResult, countdown, navigation, txnRefNo, type, id]);

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    setCurrentUrl(url);

    // Check if user returned from JazzCash (contains return URL or specific parameters)
    if (url.includes('/api/payments/jazzcash/return/') || url.includes('pp_TxnRefNo')) {
      // Payment process completed - wait 10 seconds before navigating
      if (!showingResult) {
        setShowingResult(true);
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    // User cancelled - go back to payment screen
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} />

      {/* Header with cancel button */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={[styles.cancelText, { color: theme.colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>JazzCash Payment</Text>
        <View style={styles.placeholder} />
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: generateFormHTML() }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.webview}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>Loading payment page...</Text>
          </View>
        )}
      />

      {/* Loading indicator overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {/* Countdown button when showing result */}
      {showingResult && (
        <View style={styles.countdownContainer}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: theme.colors.primary, opacity: 0.3 }]}
            onPress={() => {
              navigation.replace('PaymentStatus', {
                txnRefNo,
                type,
                id,
              });
            }}
            activeOpacity={0.5}
          >
            <Text style={styles.continueButtonText}>Continue ({countdown}s)</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },

  cancelButton: {
    padding: 8,
  },

  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  placeholder: {
    width: 60, // Same width as cancel button for centering
  },

  webview: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  countdownContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  continueButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CardPaymentWebView;

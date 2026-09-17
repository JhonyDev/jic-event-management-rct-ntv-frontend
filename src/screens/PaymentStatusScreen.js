import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import paymentService from '../services/paymentService';
import eventService from '../services/eventService';
import { useTheme } from '../context/ThemeContext';

const PaymentStatusScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { txnRefNo, type, id } = route.params;

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    checkPaymentStatus();
    // Poll for status every 5 seconds, max 12 times (1 minute)
    const interval = setInterval(() => {
      if (retryCount < 12) {
        checkPaymentStatus();
        setRetryCount(prev => prev + 1);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const checkPaymentStatus = async () => {
    try {
      const response = await paymentService.checkTransactionStatus(txnRefNo);

      if (response.success) {
        const transaction = response.transaction;
        const paymentStatus = transaction?.status || response.payment_status || 'pending';

        if (paymentStatus === 'completed') {
          setStatus('success');
          setMessage('Payment completed successfully!');
          setLoading(false);
        } else if (paymentStatus === 'failed') {
          setStatus('failed');
          setMessage(transaction?.pp_response_message || 'Payment failed');
          setLoading(false);
        } else {
          // Still pending
          setStatus('pending');
          setMessage('Processing your payment...');
        }
      } else {
        // Transaction not found or error
        if (retryCount < 11) {
          setStatus('pending');
          setMessage('Waiting for payment confirmation...');
        } else {
          setStatus('unknown');
          setMessage('Payment is being processed. Please check your transaction history in a few minutes.');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Status check error:', error);

      // Check if it's a 404 error (transaction not created yet)
      if (error.response?.status === 404) {
        // Transaction not created yet, keep trying
        if (retryCount < 11) {
          setStatus('pending');
          setMessage('Waiting for payment to be initiated...');
        } else {
          // After multiple retries, ask user to check manually
          setStatus('unknown');
          setMessage('Payment is being processed. Please check your transaction history in a few minutes.');
          setLoading(false);
        }
      } else if (retryCount >= 11) {
        setStatus('unknown');
        setMessage('Unable to verify payment status. Please check your transaction history.');
        setLoading(false);
      } else {
        // Keep trying for other errors
        setStatus('pending');
        setMessage('Verifying payment...');
      }
    }
  };

  const handleDone = () => {
    // Navigate back to MyEvents tab
    navigation.navigate('MainTabs', { screen: 'MyEvents' });
  };

  const handleRetry = () => {
    navigation.goBack(); // Go back to payment screen to retry
  };

  const getStatusIcon = () => {
    if (status === 'success') {
      return '✓';
    } else if (status === 'failed') {
      return '✕';
    } else if (status === 'pending') {
      return '⏱';
    } else {
      return '?';
    }
  };

  const getStatusColor = () => {
    if (status === 'success') {
      return '#10B981';
    } else if (status === 'failed') {
      return '#EF4444';
    } else if (status === 'pending') {
      return '#F59E0B';
    } else {
      return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} translucent={true} />

      <View style={styles.content}>
        {loading && status === 'pending' ? (
          <>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.onBackground, marginTop: 24 }]}>
              Processing Payment
            </Text>
            <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>{message}</Text>
            <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
              Please wait while we verify your payment...
            </Text>
          </>
        ) : (
          <>
            <View
              style={[
                styles.statusIcon,
                {
                  backgroundColor: getStatusColor() + '20',
                  borderColor: getStatusColor(),
                },
              ]}
            >
              <Text style={[styles.statusIconText, { color: getStatusColor() }]}>{getStatusIcon()}</Text>
            </View>

            <Text style={[styles.title, { color: theme.colors.onBackground }]}>
              {status === 'success'
                ? 'Payment Successful'
                : status === 'failed'
                ? 'Payment Failed'
                : status === 'pending'
                ? 'Payment Pending'
                : 'Payment Status Unknown'}
            </Text>

            <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>{message}</Text>

            {txnRefNo && (
              <View style={[styles.refContainer, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
                <Text style={[styles.refLabel, { color: theme.colors.onSurfaceVariant }]}>Transaction Reference</Text>
                <Text style={[styles.refValue, { color: theme.colors.onSurface }]}>{txnRefNo}</Text>
              </View>
            )}

            {status === 'success' && (
              <TouchableOpacity
                style={[styles.button, styles.successButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleDone}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            )}

            {status === 'failed' && (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.retryButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleRetry}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
                  onPress={handleDone}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.colors.onSurface }]}>Go Back</Text>
                </TouchableOpacity>
              </>
            )}

            {(status === 'unknown' || status === 'pending') && (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.checkButton, { backgroundColor: theme.colors.primary }]}
                  onPress={checkPaymentStatus}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>Check Status</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
                  onPress={handleDone}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.colors.onSurface }]}>Go Back</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  statusIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  statusIconText: {
    fontSize: 48,
    fontWeight: 'bold',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },

  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },

  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },

  refContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
  },

  refLabel: {
    fontSize: 12,
    marginBottom: 4,
  },

  refValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  button: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },

  successButton: {},

  retryButton: {},

  checkButton: {},

  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentStatusScreen;

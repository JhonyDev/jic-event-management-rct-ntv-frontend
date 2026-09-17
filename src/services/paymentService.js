import api from '../config/api';

const paymentService = {
  /**
   * Initiate MWallet payment for event
   * @param {number} eventId - Event ID
   * @param {number} amount - Payment amount
   * @param {string} mobileNumber - Mobile number (03XXXXXXXXX)
   * @param {string} cnic - Last 6 digits of CNIC
   * @param {string} description - Payment description
   */
  initiateEventMWalletPayment: async (eventId, amount, mobileNumber, cnic, description = '') => {
    try {
      const response = await api.post('/payments/jazzcash/mwallet/initiate/', {
        event_id: eventId,
        amount: amount,
        mobile_number: mobileNumber,
        cnic: cnic,
        description: description,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Initiate Card payment for event
   * @param {number} eventId - Event ID
   * @param {number} amount - Payment amount
   * @param {string} description - Payment description
   */
  initiateEventCardPayment: async (eventId, amount, description = '') => {
    try {
      const response = await api.post('/payments/jazzcash/card/initiate/', {
        event_id: eventId,
        amount: amount,
        description: description,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Initiate MWallet payment for session
   * @param {number} sessionId - Session ID
   * @param {number} amount - Payment amount
   * @param {string} mobileNumber - Mobile number (03XXXXXXXXX)
   * @param {string} cnic - Last 6 digits of CNIC
   * @param {string} description - Payment description
   */
  initiateSessionMWalletPayment: async (sessionId, amount, mobileNumber, cnic, description = '') => {
    try {
      const response = await api.post('/payments/jazzcash/session/mwallet/initiate/', {
        session_id: sessionId,
        amount: amount,
        mobile_number: mobileNumber,
        cnic: cnic,
        description: description,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Initiate Card payment for session
   * @param {number} sessionId - Session ID
   * @param {number} amount - Payment amount
   * @param {string} description - Payment description
   */
  initiateSessionCardPayment: async (sessionId, amount, description = '') => {
    try {
      const response = await api.post('/payments/jazzcash/session/card/initiate/', {
        session_id: sessionId,
        amount: amount,
        description: description,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check transaction status (simple local database check)
   * @param {string} txnRefNo - Transaction reference number
   */
  checkTransactionStatus: async (txnRefNo) => {
    try {
      const response = await api.post('/payments/transactions/check-status/', {
        txn_ref_no: txnRefNo,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check transaction status from JazzCash (calls JazzCash API)
   * @param {string} txnRefNo - Transaction reference number
   */
  checkTransactionStatusFromJazzCash: async (txnRefNo) => {
    try {
      const response = await api.post('/payments/jazzcash/status-inquiry/', {
        txn_ref_no: txnRefNo,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user's transaction history
   */
  getTransactionHistory: async () => {
    try {
      const response = await api.get('/payments/transactions/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get transaction details
   * @param {string} txnRefNo - Transaction reference number
   */
  getTransactionDetails: async (txnRefNo) => {
    try {
      const response = await api.get(`/payments/transactions/${txnRefNo}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancel pending registration
   * @param {number} registrationId - Registration ID to cancel
   */
  cancelPendingRegistration: async (registrationId) => {
    try {
      const response = await api.delete(`/registrations/${registrationId}/`);
      return response.data;
    } catch (error) {
      // Only log error if it's not a 404 (registration already deleted)
      if (error.response && error.response.status !== 404) {
        console.error('Cancel registration error:', error);
      }
      throw error;
    }
  },

  /**
   * Submit bank transfer payment with receipt
   * @param {string} registrationId - Registration ID or event/session ID
   * @param {number} amount - Payment amount
   * @param {string} paymentDate - Date of payment (YYYY-MM-DD)
   * @param {Object} receiptFile - Receipt file object from DocumentPicker
   * @param {string} notes - Additional notes (optional)
   * @param {string} type - Type of payment ('event_registration', 'event', 'session')
   */
  submitBankTransferPayment: async (registrationId, amount, paymentDate, receiptFile, notes = '', type = 'event_registration') => {
    try {
      const formData = new FormData();
      formData.append('amount', amount.toString());
      formData.append('payment_date', paymentDate);
      formData.append('notes', notes);
      formData.append('type', type);

      // Add the appropriate ID field based on type
      if (type === 'event_registration') {
        formData.append('registration_id', registrationId);
      } else if (type === 'event') {
        formData.append('event_id', registrationId);
      } else if (type === 'session') {
        formData.append('session_id', registrationId);
      }

      // Add receipt file
      if (receiptFile) {
        formData.append('receipt', {
          uri: receiptFile.uri,
          type: receiptFile.mimeType || 'image/jpeg',
          name: receiptFile.name || 'receipt.jpg',
        });
      }

      const response = await api.post('/payments/bank-transfer/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Bank transfer payment error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit bank transfer payment'
      };
    }
  },
};

export default paymentService;

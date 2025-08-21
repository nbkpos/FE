const Transaction = require('../models/Transaction');
const payoutService = require('./payoutService');
const crypto = require('crypto');

const PROTOCOLS = {
  "POS Terminal -101.1 (4-digit approval)": 4,
  "POS Terminal -101.4 (6-digit approval)": 6,
  "POS Terminal -101.6 (Pre-authorization)": 6,
  "POS Terminal -101.7 (4-digit approval)": 4,
  "POS Terminal -101.8 (PIN-LESS transaction)": 4,
  "POS Terminal -201.1 (6-digit approval)": 6,
  "POS Terminal -201.3 (6-digit approval)": 6,
  "POS Terminal -201.5 (6-digit approval)": 6
};

class MTIProcessor {
  constructor() {
    this.io = null;
  }

  initialize(io) {
    this.io = io;
  }

  async processTransaction(transactionData) {
    try {
      const transaction = new Transaction(transactionData);
      await transaction.save();

      // Process MTI 0100 - Authorization Request
      await this.processMTI0100(transaction);
      
      return transaction;
    } catch (error) {
      console.error('Transaction processing error:', error);
      throw error;
    }
  }

  async processMTI0100(transaction) {
    // Authorization Request
    this.emitMTINotification(transaction.merchantId, {
      mti: '0100',
      transactionId: transaction.transactionId,
      status: 'processing',
      message: 'Authorization request initiated'
    });

    // Simulate card validation and authorization
    const authResult = await this.validateCard(transaction);
    
    if (authResult.approved) {
      await this.processMTI0110(transaction, authResult);
    } else {
      await this.processMTI0110(transaction, authResult);
    }
  }

  async processMTI0110(transaction, authResult) {
    // Authorization Response
    transaction.status = authResult.approved ? 'approved' : 'declined';
    transaction.approvalCode = authResult.approvalCode;
    transaction.responseCode = authResult.responseCode;
    transaction.processedAt = new Date();
    
    await transaction.save();

    this.emitMTINotification(transaction.merchantId, {
      mti: '0110',
      transactionId: transaction.transactionId,
      status: transaction.status,
      approvalCode: transaction.approvalCode,
      responseCode: transaction.responseCode,
      message: `Authorization ${transaction.status}`
    });

    if (authResult.approved) {
      // Process financial transaction
      await this.processMTI0200(transaction);
    }
  }

  async processMTI0200(transaction) {
    // Financial Transaction Request
    this.emitMTINotification(transaction.merchantId, {
      mti: '0200',
      transactionId: transaction.transactionId,
      status: 'processing',
      message: 'Financial transaction processing'
    });

    // Simulate financial processing
    const financialResult = await this.processFinancialTransaction(transaction);
    await this.processMTI0210(transaction, financialResult);
  }

  async processMTI0210(transaction, financialResult) {
    // Financial Transaction Response
    this.emitMTINotification(transaction.merchantId, {
      mti: '0210',
      transactionId: transaction.transactionId,
      status: financialResult.success ? 'completed' : 'failed',
      message: `Financial transaction ${financialResult.success ? 'completed' : 'failed'}`
    });

    if (financialResult.success) {
      // Initiate payout
      await this.initiatePayout(transaction);
    }
  }

  async processMTI0220(transaction) {
    // Transaction Advice
    this.emitMTINotification(transaction.merchantId, {
      mti: '0220',
      transactionId: transaction.transactionId,
      status: 'advice',
      message: 'Transaction advice sent'
    });
  }

  async processMTI0230(transaction) {
    // Transaction Advice Response
    this.emitMTINotification(transaction.merchantId, {
      mti: '0230',
      transactionId: transaction.transactionId,
      status: 'acknowledged',
      message: 'Transaction advice acknowledged'
    });
  }

  async validateCard(transaction) {
    // Simulate card validation logic
    const isValid = this.validateCardNumber(transaction.cardDetails.cardNumber);
    const authCodeValid = this.validateAuthCode(transaction.authCode, transaction.protocol);
    
    if (isValid && authCodeValid) {
      return {
        approved: true,
        approvalCode: this.generateApprovalCode(),
        responseCode: '00' // Approved
      };
    } else {
      return {
        approved: false,
        approvalCode: null,
        responseCode: '05' // Declined
      };
    }
  }

  validateCardNumber(cardNumber) {
    // Luhn algorithm validation
    const cleanNumber = cardNumber.replace(/\s/g, '');
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  validateAuthCode(authCode, protocol) {
    const requiredLength = PROTOCOLS[protocol];
    return authCode && authCode.length === requiredLength && /^\d+$/.test(authCode);
  }

  generateApprovalCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  async processFinancialTransaction(transaction) {
    // Simulate financial processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    
    return { success };
  }

  async initiatePayout(transaction) {
    try {
      const payoutResult = await payoutService.processPayout(transaction);
      
      transaction.payoutStatus = 'processing';
      transaction.payoutMethod = payoutResult.method;
      transaction.payoutTxId = payoutResult.txId;
      await transaction.save();

      this.emitMTINotification(transaction.merchantId, {
        mti: 'PAYOUT',
        transactionId: transaction.transactionId,
        status: 'payout_initiated',
        payoutMethod: payoutResult.method,
        message: 'Payout initiated'
      });

    } catch (error) {
      console.error('Payout initiation error:', error);
      transaction.payoutStatus = 'failed';
      await transaction.save();
    }
  }

  emitMTINotification(merchantId, notification) {
    if (this.io) {
      this.io.to(`merchant_${merchantId}`).emit('mti_notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new MTIProcessor();

const User = require('../models/User');
const axios = require('axios');
const crypto = require('crypto');

class PayoutService {
  async processPayout(transaction) {
    const user = await User.findOne({ merchantId: transaction.merchantId });
    
    if (!user) {
      throw new Error('Merchant not found');
    }

    const payoutMethod = user.payoutSettings.defaultPayoutMethod;
    
    if (payoutMethod === 'bank') {
      return await this.processBankPayout(transaction, user.payoutSettings.bankAccount);
    } else {
      return await this.processCryptoPayout(transaction, user.payoutSettings.cryptoWallet);
    }
  }

  async processBankPayout(transaction, bankAccount) {
    try {
      // Simulate bank API call
      const payoutData = {
        amount: transaction.amount * 0.97, // 3% fee
        currency: transaction.currency,
        accountNumber: bankAccount.accountNumber,
        routingNumber: bankAccount.routingNumber,
        accountHolderName: bankAccount.accountHolderName,
        reference: transaction.transactionId
      };

      // Mock bank API response
      const response = await this.mockBankAPI(payoutData);
      
      return {
        method: 'bank',
        txId: response.transferId,
        status: 'processing'
      };
    } catch (error) {
      throw new Error('Bank payout failed: ' + error.message);
    }
  }

  async processCryptoPayout(transaction, cryptoWallet) {
    try {
      // Default to BTC for this example
      const address = cryptoWallet.btcAddress;
      
      if (!address) {
        throw new Error('No crypto wallet address configured');
      }

      const payoutData = {
        amount: transaction.amount * 0.95, // 5% fee for crypto
        currency: 'BTC',
        address: address,
        reference: transaction.transactionId
      };

      // Mock crypto API response
      const response = await this.mockCryptoAPI(payoutData);
      
      return {
        method: 'crypto',
        txId: response.txHash,
        status: 'processing'
      };
    } catch (error) {
      throw new Error('Crypto payout failed: ' + error.message);
    }
  }

  async mockBankAPI(payoutData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      transferId: 'TXN_' + Date.now(),
      status: 'processing',
      estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }

  async mockCryptoAPI(payoutData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      txHash: crypto.randomBytes(32).toString('hex'),
      status: 'pending',
      confirmations: 0
    };
  }
}

module.exports = new PayoutService();

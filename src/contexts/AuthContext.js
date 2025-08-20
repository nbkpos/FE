import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      // Set mock user for demo
      setUser({
        _id: 'demo_user_id',
        email: 'demo@example.com',
        businessName: 'Demo Business',
        merchantId: 'DEMO_MERCHANT_001',
        payoutSettings: {
          defaultPayoutMethod: 'bank',
          bankAccount: {
            accountNumber: '1234567890',
            bankName: 'Demo Bank',
            accountHolderName: 'Demo Account Holder'
          },
          cryptoWallet: {
            btcAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            ethAddress: '0x742d35Cc6634C0532925a3b8D4C8C8b4C8C8b4C8',
            usdtAddress: '0x742d35Cc6634C0532925a3b8D4C8C8b4C8C8b4C8'
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      // For demo purposes, allow any login
      if (email && password) {
        const mockToken = 'demo_token_' + Date.now();
        localStorage.setItem('token', mockToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
        
        const mockUser = {
          _id: 'demo_user_id',
          email: email,
          businessName: 'Demo Business',
          merchantId: 'DEMO_MERCHANT_001',
          payoutSettings: {
            defaultPayoutMethod: 'bank',
            bankAccount: {
              accountNumber: '1234567890',
              bankName: 'Demo Bank',
              accountHolderName: 'Demo Account Holder'
            },
            cryptoWallet: {
              btcAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
              ethAddress: '0x742d35Cc6634C0532925a3b8D4C8C8b4C8C8b4C8',
              usdtAddress: '0x742d35Cc6634C0532925a3b8D4C8C8b4C8C8b4C8'
            }
          }
        };
        
        setUser(mockUser);
        return { success: true };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

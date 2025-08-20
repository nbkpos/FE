import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CreditCard, DollarSign, TrendingUp, Clock, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const WelcomeCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  color: ${props => props.connected ? '#27ae60' : '#e74c3c'};
  font-weight: 600;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color || '#667eea'};
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PayoutInfo = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const PayoutMethod = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin: 15px 0;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 20px;
  border-radius: 15px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover {
    transform: translateY(-2px);
  }
`;

function Dashboard() {
  const { user } = useAuth();
  const { connected } = useSocket();
  const [stats, setStats] = useState({
    todayTransactions: 0,
    todayRevenue: 0,
    totalTransactions: 0,
    pendingPayouts: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set mock data for demo
      setStats({
        todayTransactions: 12,
        todayRevenue: 2450.75,
        totalTransactions: 156,
        pendingPayouts: 3
      });
    }
  };

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return 'Not configured';
    return `****${accountNumber.slice(-4)}`;
  };

  const maskWalletAddress = (address) => {
    if (!address) return 'Not configured';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <DashboardContainer>
      <WelcomeCard>
        <h1>Welcome back, {user?.businessName || 'Merchant'}!</h1>
        <p>Merchant ID: {user?.merchantId || 'DEMO_MERCHANT_001'}</p>
        <ConnectionStatus connected={connected}>
          {connected ? <Wifi size={20} /> : <WifiOff size={20} />}
          {connected ? 'Connected' : 'Disconnected'}
        </ConnectionStatus>
      </WelcomeCard>

      <StatsGrid>
        <StatCard>
          <StatIcon color="#667eea">
            <CreditCard size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.todayTransactions}</StatValue>
            <StatLabel>Today's Transactions</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#55efc4">
            <DollarSign size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>${stats.todayRevenue.toFixed(2)}</StatValue>
            <StatLabel>Today's Revenue</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#fd79a8">
            <TrendingUp size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalTransactions}</StatValue>
            <StatLabel>Total Transactions</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#fdcb6e">
            <Clock size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.pendingPayouts}</StatValue>
            <StatLabel>Pending Payouts</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <PayoutInfo>
        <h2>Payout Configuration</h2>
        <p>Default Method: <strong>{user?.payoutSettings?.defaultPayoutMethod?.toUpperCase() || 'BANK'}</strong></p>
        
        <PayoutMethod>
          <h3>🏦 Bank Account</h3>
          <p>Account: {maskAccountNumber(user?.payoutSettings?.bankAccount?.accountNumber || '1234567890')}</p>
          <p>Bank: {user?.payoutSettings?.bankAccount?.bankName || 'Demo Bank'}</p>
          <p>Holder: {user?.payoutSettings?.bankAccount?.accountHolderName || 'Demo Account Holder'}</p>
        </PayoutMethod>

        <PayoutMethod>
          <h3>₿ Crypto Wallets</h3>
          <p>BTC: {maskWalletAddress(user?.payoutSettings?.cryptoWallet?.btcAddress || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')}</p>
          <p>ETH: {maskWalletAddress(user?.payoutSettings?.cryptoWallet?.ethAddress || '0x742d35Cc6634C0532925a3b8D4C8C8b4C8C8b4C8')}</p>
          <p>USDT: {maskWalletAddress(user?.payoutSettings?.cryptoWallet?.usdtAddress || '0x742d35Cc6634C0532925a3b8D4C8C8b4C8C8b4C8')}</p>
        </PayoutMethod>
      </PayoutInfo>

      <QuickActions>
        <ActionButton onClick={() => window.location.href = '/terminal'}>
          <CreditCard size={20} />
          New Transaction
        </ActionButton>
        <ActionButton onClick={() => window.location.href = '/transactions'}>
          <TrendingUp size={20} />
          View History
        </ActionButton>
      </QuickActions>
    </DashboardContainer>
  );
}

export default Dashboard;

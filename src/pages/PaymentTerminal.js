import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { CreditCard, Lock, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';

const TerminalContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const TerminalCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Form = styled.form`
  display: grid;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &.error {
    border-color: #e74c3c;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const CardRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 80px;
  gap: 15px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProcessButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusPanel = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
`;

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e1e5e9;

  &:last-child {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'processing': return '#ffeaa7';
      case 'approved': return '#55efc4';
      case 'declined': return '#ff7675';
      case 'completed': return '#74b9ff';
      case 'payout_initiated': return '#a29bfe';
      default: return '#ddd';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'processing': return '#d63031';
      case 'approved': return '#00b894';
      case 'declined': return '#ffffff';
      case 'completed': return '#ffffff';
      case 'payout_initiated': return '#ffffff';
      default: return '#333';
    }
  }};
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 14px;
  margin-top: 5px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
`;

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

function PaymentTerminal() {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm();
  const [processing, setProcessing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [mtiNotifications, setMtiNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const { socket, connected } = useSocket();

  const selectedProtocol = watch('protocol');

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value) => {
    if (!value) return '';
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date with slash
  const formatExpiryDate = (value) => {
    if (!value) return '';
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  // Handle card number input
  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setValue('cardNumber', formatted);
  };

  // Handle expiry date input
  const handleExpiryDateChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setValue('expiryDate', formatted);
  };

  // Socket event listeners
  useEffect(() => {
    if (socket) {
      socket.on('mti_notification', (notification) => {
        setMtiNotifications(prev => [notification, ...prev.slice(0, 9)]);
        
        if (notification.transactionId === currentTransaction?.transactionId) {
          setCurrentTransaction(prev => ({
            ...prev,
            status: notification.status,
            lastUpdate: notification.timestamp
          }));
        }

        // Show toast for important notifications
        if (notification.mti === '0110') {
          if (notification.status === 'approved') {
            toast.success('Transaction Approved!');
          } else {
            toast.error('Transaction Declined');
          }
        } else if (notification.mti === '0210') {
          if (notification.status === 'completed') {
            toast.success('Payment Completed!');
          }
        } else if (notification.mti === 'PAYOUT') {
          toast.info(`Payout initiated via ${notification.payoutMethod}`);
        }
      });

      return () => {
        socket.off('mti_notification');
      };
    }
  }, [socket, currentTransaction]);

  const onSubmit = async (data) => {
    setProcessing(true);
    
    try {
      const response = await api.post('/transactions/process', {
        ...data,
        isOnline
      });

      if (response.data.success) {
        setCurrentTransaction({
          transactionId: response.data.transactionId,
          status: 'processing',
          amount: data.amount,
          cardNumber: data.cardNumber,
          protocol: data.protocol,
          startTime: new Date().toISOString()
        });
        
        toast.success('Transaction initiated successfully!');
        reset(); // Clear form after successful submission
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Transaction failed');
    } finally {
      setProcessing(false);
    }
  };

  const getRequiredAuthCodeLength = () => {
    return selectedProtocol ? PROTOCOLS[selectedProtocol] : 4;
  };

  return (
    <TerminalContainer>
      <TerminalCard>
        <Title>
          <CreditCard size={32} />
          Payment Terminal
          {connected ? <Wifi size={24} color="green" /> : <WifiOff size={24} color="red" />}
        </Title>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>Card Holder Name</Label>
            <Input
              {...register('cardHolderName', { required: 'Card holder name is required' })}
              placeholder="Enter card holder name"
              className={errors.cardHolderName ? 'error' : ''}
            />
            {errors.cardHolderName && <ErrorMessage>{errors.cardHolderName.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Card Number</Label>
            <Input
              {...register('cardNumber', { 
                required: 'Card number is required',
                pattern: {
                  value: /^[\d\s]{13,19}$/,
                  message: 'Invalid card number'
                }
              })}
              placeholder="0000 0000 0000 0000"
              maxLength="19"
              onChange={handleCardNumberChange}
              className={errors.cardNumber ? 'error' : ''}
            />
            {errors.cardNumber && <ErrorMessage>{errors.cardNumber.message}</ErrorMessage>}
          </FormGroup>

          <CardRow>
            <FormGroup>
              <Label>Amount ($)</Label>
              <Input
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className={errors.amount ? 'error' : ''}
              />
              {errors.amount && <ErrorMessage>{errors.amount.message}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Expiry Date</Label>
              <Input
                {...register('expiryDate', { 
                  required: 'Expiry date is required',
                  pattern: {
                    value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                    message: 'Format: MM/YY'
                  }
                })}
                placeholder="MM/YY"
                maxLength="5"
                onChange={handleExpiryDateChange}
                className={errors.expiryDate ? 'error' : ''}
              />
              {errors.expiryDate && <ErrorMessage>{errors.expiryDate.message}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>CVV</Label>
              <Input
                {...register('cvv', { 
                  required: 'CVV is required',
                  pattern: {
                    value: /^\d{3,4}$/,
                    message: 'Invalid CVV'
                  }
                })}
                type="password"
                maxLength="4"
                placeholder="000"
                className={errors.cvv ? 'error' : ''}
              />
              {errors.cvv && <ErrorMessage>{errors.cvv.message}</ErrorMessage>}
            </FormGroup

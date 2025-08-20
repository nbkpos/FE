import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Filter, Download, Eye } from 'lucide-react';
import api from '../services/api';

const HistoryContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const HistoryCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 30px;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 12px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const TableHeader = styled.th`
  background: #f8f9fa;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e1e5e9;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 15px;
  border-bottom: 1px solid #e1e5e9;
  color: #666;
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

const ViewButton = styled.button`
  background: transparent;
  border: 1px solid #667eea;
  color: #667eea;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: #667eea;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
`;

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transactions', {
        params: {
          page: currentPage,
          search: searchTerm,
          status: statusFilter,
          limit: 10
        }
      });
      
      setTransactions(response.data.transactions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Set mock data for demo
      setTransactions([
        {
          _id: '1',
          transactionId: 'TXN_001',
          amount: 150.00,
          cardNumber: '4532123456789012',
          cardHolderName: 'John Doe',
          status: 'completed',
          protocol: 'POS Terminal -101.1 (4-digit approval)',
          createdAt: new Date().toISOString(),
          payoutMethod: 'bank'
        },
        {
          _id: '2',
          transactionId: 'TXN_002',
          amount: 75.50,
          cardNumber: '5555666677778888',
          cardHolderName: 'Jane Smith',
          status: 'approved',
          protocol: 'POS Terminal -201.1 (6-digit approval)',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          payoutMethod: 'crypto'
        },
        {
          _id: '3',
          transactionId: 'TXN_003',
          amount: 200.00,
          cardNumber: '4111111111111111',
          cardHolderName: 'Bob Johnson',
          status: 'declined',
          protocol: 'POS Terminal -101.4 (6-digit approval)',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          payoutMethod: 'bank'
        }
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/transactions/export', {
        params: {
          search: searchTerm,
          status: statusFilter
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting transactions:', error);
    }
  };

  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    return `****${cardNumber.slice(-4)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <HistoryContainer>
      <HistoryCard>
        <Title>Transaction History</Title>
        
        <FilterBar>
          <SearchInput
            type="text"
            placeholder="Search by transaction ID, card holder name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="processing">Processing</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="declined">Declined</option>
            <option value="payout_initiated">Payout Initiated</option>
          </FilterSelect>
          
          <ActionButton onClick={handleExport}>
            <Download size={16} />
            Export
          </ActionButton>
        </FilterBar>

        {loading ? (
          <LoadingMessage>Loading transactions...</LoadingMessage>
        ) : transactions.length === 0 ? (
          <EmptyMessage>No transactions found</EmptyMessage>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Transaction ID</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Card</TableHeader>
                  <TableHeader>Holder</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Protocol</TableHeader>
                  <TableHeader>Payout</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{transaction.transactionId}</TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell>{formatAmount(transaction.amount)}</TableCell>
                    <TableCell>{maskCardNumber(transaction.cardNumber)}</TableCell>
                    <TableCell>{transaction.cardHolderName}</TableCell>
                    <TableCell>
                      <StatusBadge status={transaction.status}>
                        {transaction.status?.toUpperCase()}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{transaction.protocol}</TableCell>
                    <TableCell>{transaction.payoutMethod?.toUpperCase()}</TableCell>
                    <TableCell>
                      <ViewButton>
                        <Eye size={14} />
                        View
                      </ViewButton>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>

            <Pagination>
              <PageButton
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </PageButton>
              
              {[...Array(totalPages)].map((_, index) => (
                <PageButton
                  key={index + 1}
                  active={currentPage === index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </PageButton>
              ))}
              
              <PageButton
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </PageButton>
            </Pagination>
          </>
        )}
      </HistoryCard>
    </HistoryContainer>
  );
}

export default TransactionHistory;

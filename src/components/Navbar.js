import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { CreditCard, Home, Terminal, History, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 0 20px;
`;

const NavbarContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #333;
  font-size: 20px;
  font-weight: 700;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 30px;
  align-items: center;

  @media (max-width: 768px) {
    gap: 15px;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: ${props => props.active ? '#667eea' : '#666'};
  font-weight: ${props => props.active ? '600' : '500'};
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    color: #667eea;
    background: #f8f9fa;
  }

  @media (max-width: 768px) {
    span {
      display: none;
    }
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;

  @media (max-width: 768px) {
    span {
      display: none;
    }
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    background: #e74c3c;
    color: white;
  }

  @media (max-width: 768px) {
    span {
      display: none;
    }
  }
`;

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <NavbarContainer>
      <NavbarContent>
        <Logo to="/dashboard">
          <CreditCard size={24} />
          PayTerminal
        </Logo>

        <NavLinks>
          <NavLink to="/dashboard" active={isActive('/dashboard')}>
            <Home size={18} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/terminal" active={isActive('/terminal')}>
            <Terminal size={18} />
            <span>Terminal</span>
          </NavLink>
          
          <NavLink to="/transactions" active={isActive('/transactions')}>
            <History size={18} />
            <span>History</span>
          </NavLink>
        </NavLinks>

        <UserSection>
          <UserInfo>
            <User size={18} />
            <span>{user?.businessName || 'Merchant'}</span>
          </UserInfo>
          
          <LogoutButton onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </LogoutButton>
        </UserSection>
      </NavbarContent>
    </NavbarContainer>
  );
}

export default Navbar;

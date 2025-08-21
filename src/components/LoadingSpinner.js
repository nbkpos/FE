import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: ${props => props.fullScreen ? '100vh' : '200px'};
  background: ${props => props.fullScreen ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  color: ${props => props.fullScreen ? 'white' : '#667eea'};
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid ${props => props.fullScreen ? 'white' : '#667eea'};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 20px;
`;

const LoadingText = styled.div`
  font-size: 16px;
  font-weight: 500;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 10px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.fullScreen ? 'white' : '#667eea'};
    animation: ${pulse} 1.4s ease-in-out infinite;

    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`;

function LoadingSpinner({ fullScreen = false, text = "Loading..." }) {
  return (
    <LoadingContainer fullScreen={fullScreen}>
      <Spinner fullScreen={fullScreen} />
      <LoadingText>{text}</LoadingText>
      <LoadingDots fullScreen={fullScreen}>
        <span></span>
        <span></span>
        <span></span>
      </LoadingDots>
    </LoadingContainer>
  );
}

export default LoadingSpinner;

import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    line-height: 1.6;
  }

  #root {
    min-height: 100vh;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    transition: background 0.3s ease;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  /* Selection */
  ::selection {
    background: rgba(102, 126, 234, 0.3);
    color: #333;
  }

  /* Focus styles */
  button:focus,
  input:focus,
  select:focus,
  textarea:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -468px 0;
    }
    100% {
      background-position: 468px 0;
    }
  }

  .fade-in {
    animation: fadeIn 0.6s ease-out;
  }

  .slide-in {
    animation: slideIn 0.6s ease-out;
  }

  /* Toast Customization */
  .Toastify__toast-container {
    font-family: 'Inter', sans-serif;
  }

  .Toastify__toast {
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    font-weight: 500;
  }

  .Toastify__toast--success {
    background: linear-gradient(135deg, #00b894 0%, #55efc4 100%);
  }

  .Toastify__toast--error {
    background: linear-gradient(135deg, #e17055 0%, #ff7675 100%);
  }

  .Toastify__toast--info {
    background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%);
  }

  .Toastify__toast--warning {
    background: linear-gradient(135deg, #e17055 0%, #fdcb6e 100%);
  }

  /* Responsive Typography */
  @media (max-width: 768px) {
    body {
      font-size: 14px;
    }
  }

  /* Loading Skeleton */
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }

  /* Glassmorphism effect */
  .glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  /* Royal gradient backgrounds */
  .royal-gradient-1 {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .royal-gradient-2 {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .royal-gradient-3 {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  .royal-gradient-4 {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }

  .royal-gradient-5 {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }
`;

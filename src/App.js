import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import LoadingSpinner from './components/LoadingSpinner';
import Navbar from './components/Navbar';

// Lazy load components for better performance
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PaymentTerminal = React.lazy(() => import('./pages/PaymentTerminal'));
const TransactionHistory = React.lazy(() => import('./pages/TransactionHistory'));

const AppContainer = styled(motion.div)`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const MainContent = styled(motion.div)`
  position: relative;
  z-index: 1;
  padding-top: ${props => props.hasNavbar ? '80px' : '0'};
  min-height: 100vh;
`;

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Initializing Payment Terminal..." />;
  }

  return (
    <AppContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <AnimatePresence mode="wait">
        {user && <Navbar />}
      </AnimatePresence>
      
      <MainContent hasNavbar={!!user}>
        <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/login" 
                element={
                  !user ? (
                    <motion.div
                      key="login"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Login />
                    </motion.div>
                  ) : (
                    <Navigate to="/dashboard" />
                  )
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  user ? (
                    <motion.div
                      key="dashboard"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Dashboard />
                    </motion.div>
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              <Route 
                path="/terminal" 
                element={
                  user ? (
                    <motion.div
                      key="terminal"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <PaymentTerminal />
                    </motion.div>
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              <Route 
                path="/transactions" 
                element={
                  user ? (
                    <motion.div
                      key="transactions"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <TransactionHistory />
                    </motion.div>
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              <Route 
                path="/" 
                element={<Navigate to={user ? "/dashboard" : "/login"} />} 
              />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </MainContent>
      
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastStyle={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          borderRadius: '12px'
        }}
      />
    </AppContainer>
  );
}

function App() {
  return (
    <>
      <GlobalStyles />
      <Router>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
          </SocketProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;

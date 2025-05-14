import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import TransactionList from './components/transaction/TransactionList';
import WalletFormPage from './pages/WalletForm';
import TransactionForm from './pages/TransactionForm';
import BankAccounts from './pages/BankAccounts';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This will help identify if the App component is properly loading
    console.log("App component mounted");
    
    // Check if environment variables are loaded correctly
    console.log("API URL:", import.meta.env.VITE_API_URL || 'Not set');
    
    // Set loading to false after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div className="app-loading">Loading application...</div>;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/finance-dashboard" element={<FinanceDashboard />} />
              <Route path="/wallet/:walletId" element={<TransactionList />} />
              <Route path="/wallet/new" element={<WalletFormPage />} />
              <Route path="/wallet/edit/:walletId" element={<WalletFormPage />} />
              <Route path="/transactions/new" element={<TransactionForm />} />
              <Route path="/bank-accounts" element={<BankAccounts />} />
            </Route>
            {/* Catch-all route for 404 errors */}
            <Route path="*" element={
              <div className="not-found">
                <h2>404 - Page Not Found</h2>
                <p>The page you are looking for doesn't exist.</p>
                <button onClick={() => window.location.href = '/login'}>
                  Go to Login
                </button>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

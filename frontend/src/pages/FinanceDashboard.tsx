import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../config/api';

interface Wallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
  bankAccount?: string;
}

const FinanceDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    // Fetch data whenever the component mounts or the location changes
    fetchWallets();
  }, [location.pathname]);

  const fetchWallets = async () => {
    try {
      const res = await api.get('/api/wallet');
      setWallets(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching wallets:', err);
      setLoading(false);
    }
  };

  const calculateTotalBalance = () => {
    return Array.isArray(wallets) ? wallets.reduce((total, wallet) => total + wallet.balance, 0) : 0;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your financial data...</p>
      </div>
    );
  }

  const totalBalance = calculateTotalBalance();

  return (
    <div className="finance-dashboard">
      {/* Header */}
      <div className="finance-header">
        <div className="finance-title">
          <h2>Finance Dashboard</h2>
          <p className="finance-subtitle">Welcome back, {user?.name || 'User'}</p>
        </div>
        
        <div className="profile-area" onClick={navigateToDashboard}>
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="profile-picture" 
            />
          ) : (
            <div className="profile-initial">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>
      </div>
      
      {/* Total Balance Card */}
      <div className="dashboard-summary-row">
        <div className="total-balance-card finance-card">
          <div className="total-balance-header">
            <div className="card-icon total-balance-icon">
              <span role="img" aria-label="wallet">💰</span>
            </div>
            <div>
              <h3>Total Balance</h3>
              <div className="wallet-count">{Array.isArray(wallets) ? wallets.length : 0} {Array.isArray(wallets) && wallets.length === 1 ? 'Wallet' : 'Wallets'}</div>
            </div>
          </div>
          <div className="total-balance-amount">
            ${formatCurrency(totalBalance)}
          </div>
          <div className="total-balance-footer">
            <p>Updated {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      {/* Finance Tracker Link */}
      <div className="finance-section">
        <Link to="/finance-dashboard" className="finance-tracker-link">
          <span className="tracker-icon">📈</span>
          Finance Tracker
        </Link>
      </div>
      
      {/* Add Transaction Button */}
      <Link to="/new-transaction" className="add-transaction-button">
        <span>+</span>
      </Link>
    </div>
  );
};

export default FinanceDashboard; 
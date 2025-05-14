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

interface Transaction {
  id: number | string;
  description: string;
  amount: number;
  date: string;
  type: string;
  category: string;
}

interface ExpenseCategory {
  category: string;
  total: number;
  percentage: number;
}

interface FinanceDashboardData {
  totalBalance: number;
  wallets: Wallet[];
  recentTransactions: Transaction[];
  expensesByCategory: ExpenseCategory[];
}

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string; 
  accountType: string;
}

const FinanceDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<FinanceDashboardData | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    // Fetch data whenever the component mounts or the location changes
    // This ensures fresh data when returning from WalletForm or TransactionForm
    fetchWallets();
    fetchBankAccounts();
    fetchFinanceDashboardData();
  }, [location.pathname]);

  const fetchWallets = async () => {
    try {
      const res = await api.get('/api/wallet');
      setWallets(res.data);
    } catch (err) {
      console.error('Error fetching wallets:', err);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const res = await api.get('/api/plaid/accounts');
      setBankAccounts(res.data);
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      // Set to empty array if error occurs
      setBankAccounts([]);
    }
  };

  const fetchFinanceDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/dashboard/finance-dashboard');
      setDashboardData(res.data.dashboardData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching finance dashboard data:', err);
      
      // Create empty dashboard data structure without any mock data
      setDashboardData({
        totalBalance: calculateTotalBalance(),
        wallets: wallets,
        recentTransactions: [],
        expensesByCategory: []
      });
      setLoading(false);
    }
  };

  const calculateTotalBalance = () => {
    return Array.isArray(wallets) ? wallets.reduce((total, wallet) => total + wallet.balance, 0) : 0;
  };

  const editWallet = (id: string) => {
    navigate(`/wallet/edit/${id}`);
  };

  const deleteWallet = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this wallet? All transactions will be lost.')) {
      try {
        await api.delete(`/api/wallet/${id}`);
        setWallets(wallets.filter(wallet => wallet._id !== id));
        // Refresh dashboard data after wallet deletion
        fetchFinanceDashboardData();
      } catch (err) {
        console.error('Error deleting wallet:', err);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getCurrencySymbol = (currency: string): string => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      case 'PHP': return '₱';
      default: return '$';
    }
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
          <p className="finance-subtitle">Welcome back, {user?.name || 'Roberto M. Prisoris Jr.'}</p>
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
              {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
            </div>
          )}
        </div>
      </div>
      
      {/* Dashboard Summary Row */}
      <div className="dashboard-summary-row">
        {/* Total Balance Card */}
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
      
      {/* Wallets Section */}
      <div className="finance-section wallets-section">
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-icon">💼</span>
            <h3>My Wallets</h3>
          </div>
          <Link to="/wallet/new" className="section-action-btn">+ Add Wallet</Link>
        </div>
        
        <div className="wallets-container">
          {wallets.length > 0 ? wallets.map(wallet => (
            <div key={wallet._id} className="wallet-card">
              <div className="wallet-actions">
                <button className="wallet-action-btn edit-btn" onClick={(e) => { e.stopPropagation(); editWallet(wallet._id); }}>
                  <span className="action-icon">✏️</span>
                </button>
                <button className="wallet-action-btn delete-btn" onClick={(e) => { e.stopPropagation(); deleteWallet(wallet._id); }}>
                  <span className="action-icon">🗑️</span>
                </button>
              </div>
              <div className="wallet-main wallet-main-responsive" onClick={() => navigate(`/wallet/${wallet._id}`)}>
                <div className="wallet-icon">
                  <span role="img" aria-label="wallet" className="wallet-icon-symbol">
                    {wallet.name.toLowerCase().includes('cash') ? '💵' : 
                     wallet.name.toLowerCase().includes('bank') ? '🏦' : 
                     wallet.name.toLowerCase().includes('credit') ? '💳' : 
                     wallet.name.toLowerCase().includes('savings') ? '🏆' : '💼'}
                  </span>
                </div>
                <div className="wallet-details">
                  <p className="wallet-name">{wallet.name}</p>
                  <p className="wallet-balance">
                    {getCurrencySymbol(wallet.currency)}{formatCurrency(wallet.balance)}
                  </p>
                </div>
              </div>
            </div>
          )) : (
            <div className="empty-wallets">
              <div className="empty-icon">💼</div>
              <p>No wallets yet</p>
              <Link to="/wallet/new" className="add-first-wallet-btn">Add Your First Wallet</Link>
            </div>
          )}
          
          {wallets.length > 0 && (
            <Link to="/wallet/new" className="add-wallet-card">
              <div className="add-icon">+</div>
              <p className="add-text">Add Wallet</p>
            </Link>
          )}
        </div>
      </div>
      
      {/* Add Transaction Button */}
      <Link to="/transactions/new" className="add-transaction-button">
        <span>+</span>
      </Link>
    </div>
  );
};

// Helper function for category colors
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Food: '#FF9800',
    Shopping: '#F44336',
    Transport: '#2196F3',
    Entertainment: '#9C27B0',
    Housing: '#795548',
    Utilities: '#607D8B',
    Healthcare: '#E91E63',
    Personal: '#00BCD4',
    Education: '#3F51B5',
    Travel: '#009688',
    Uncategorized: '#9E9E9E'
  };
  
  return colors[category] || '#607D8B';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
};

export default FinanceDashboard; 
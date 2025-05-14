import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../config/api';

interface Transaction {
  id: number | string;
  description: string;
  amount: number;
  date: string;
  type: string;
  category?: string;
}

interface Wallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
}

interface DashboardData {
  totalBalance: number;
  recentTransactions: Transaction[];
  analytics: {
    income: number;
    expenses: number;
    savings: number;
  };
}

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard data from the API
      const res = await api.get('/api/dashboard');
      setDashboardData(res.data.dashboardData);
      
      // Fetch wallets
      const walletsRes = await api.get('/api/wallet');
      setWallets(walletsRes.data || []);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
      
      // Empty data if API fails
      setDashboardData({
        totalBalance: 0,
        recentTransactions: [],
        analytics: {
          income: 0,
          expenses: 0,
          savings: 0
        }
      });
      
      setWallets([]);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [location.pathname]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your financial data...</p>
      </div>
    );
  }

  // Calculate total balance from wallets, ensuring wallets is an array first
  const totalWalletBalance = Array.isArray(wallets) 
    ? wallets.reduce((total, wallet) => total + wallet.balance, 0) 
    : 0;

  return (
    <div className="mobile-dashboard">
      {/* Header */}
      <div className="mobile-header">
        <h2>Dashboard</h2>
      </div>
      
      {/* User Profile Section */}
      <div className="profile-section">
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
        
        <div className="welcome-text">
          <h2>Welcome, {user?.name || 'Roberto M. Prisoris Jr.'}</h2>
          <p className="user-email">{user?.email || 'roberto.prisoris12@gmail.com'}</p>
          <p className="login-status">You are successfully logged in!</p>
        </div>
      </div>
      
      {/* Total Balance Card */}
      <div className="dashboard-total-balance">
        <h3>Total Balance</h3>
        <div className="balance-amount">₱{formatCurrency(totalWalletBalance)}</div>
        <div className="balance-date">As of {new Date().toLocaleDateString()}</div>
      </div>
      
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-value">{Array.isArray(wallets) ? wallets.length : 0}</div>
          <div className="card-label">Wallets</div>
        </div>
        
        <div className="summary-card">
          <div className="card-value">
            {formatCurrency(dashboardData?.analytics?.income || 0)}
          </div>
          <div className="card-label">Income</div>
        </div>
        
        <div className="summary-card">
          <div className="card-value negative">
            {formatCurrency(dashboardData?.analytics?.expenses || 0)}
          </div>
          <div className="card-label">Expenses</div>
        </div>
      </div>
      
      {/* Monthly Summary */}
      <div className="monthly-summary">
        <h3>Monthly Summary</h3>
        
        <div className="summary-stats">
          <div className="stat-item income">
            <span className="stat-icon">↓</span>
            <span className="stat-label">Income</span>
            <span className="stat-value">₱{formatCurrency(dashboardData?.analytics?.income || 0)}</span>
          </div>
          
          <div className="stat-item expenses">
            <span className="stat-icon">↑</span>
            <span className="stat-label">Expenses</span>
            <span className="stat-value">₱{formatCurrency(dashboardData?.analytics?.expenses || 0)}</span>
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="dashboard-recent-transactions">
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <Link to="/finance-dashboard" className="view-all-link">View All</Link>
        </div>
        
        {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
          <div className="dashboard-transactions-list">
            {dashboardData.recentTransactions.slice(0, 3).map(transaction => (
              <div key={transaction.id} className="dashboard-transaction-item">
                <div className={`transaction-icon-circle ${transaction.type}`}>
                  {transaction.category === 'Food' && <span>🍔</span>}
                  {transaction.category === 'Investments' && <span>📈</span>}
                  {transaction.category === 'Healthcare' && <span>💊</span>}
                  {!['Food', 'Investments', 'Healthcare'].includes(transaction.category || '') && 
                    <span>{transaction.type === 'income' ? '↓' : '↑'}</span>}
                </div>
                <div className="transaction-info-container">
                  <div className="transaction-details">
                    <h4>{transaction.category || (transaction.type === 'income' ? 'Income' : 'Expense')}</h4>
                    <p className="transaction-description">{transaction.description}</p>
                  </div>
                  <div className="transaction-info">
                    <p className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'expense' ? '-' : '+'}₱{formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <p className="transaction-date">{formatDate(transaction.date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-transactions">
            <div className="empty-icon">📊</div>
            <p>No recent transactions</p>
          </div>
        )}
      </div>
      
      {/* Finance Tracker Link */}
      <Link to="/finance-dashboard" className="finance-tracker-link">
        <span className="tracker-icon">📊</span>
        <span className="tracker-text">Finance Tracker</span>
      </Link>
      
      {/* Logout Button */}
      <button onClick={logout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default Dashboard; 
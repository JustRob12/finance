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
        
        {/* Quick Stats Cards */}
        <div className="quick-stats-card finance-card">
          <div className="stats-header">
            <div className="card-icon stats-icon">
              <span role="img" aria-label="stats">📊</span>
            </div>
            <h3>Stats</h3>
          </div>
          <div className="stats-content">
            <div className="stats-item">
              <span className="stats-label">Wallets</span>
              <span className="stats-value">{Array.isArray(wallets) ? wallets.length : 0}</span>
            </div>
            <div className="stats-item">
              <span className="stats-label">Accounts</span>
              <span className="stats-value">{bankAccounts.length}</span>
            </div>
            <div className="stats-item">
              <span className="stats-label">Transactions</span>
              <span className="stats-value">{dashboardData?.recentTransactions?.length || 0}</span>
            </div>
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
      
      {/* Linked Bank Accounts */}
      <div className="finance-section bank-accounts-section">
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-icon">🏦</span>
            <h3>Linked Bank Accounts</h3>
          </div>
          <Link to="/bank-accounts" className="section-action-btn">Manage</Link>
        </div>
        
        {bankAccounts.length === 0 ? (
          <div className="bank-link-card" onClick={() => navigate('/bank-accounts')}>
            <div className="bank-icon">
              <span role="img" aria-label="bank" className="bank-icon-symbol">💳</span>
            </div>
            <div className="bank-info">
              <h4>Connect Bank Accounts</h4>
              <p>Link your accounts to automatically track transactions</p>
            </div>
            <div className="bank-arrow">
              <span className="arrow-icon">›</span>
            </div>
          </div>
        ) : (
          <div className="bank-accounts-list">
            {bankAccounts.slice(0, 2).map((account) => (
              <div key={account.id} className="bank-account-card" onClick={() => navigate('/bank-accounts')}>
                <div className="bank-icon">
                  <span role="img" aria-label="bank" className="bank-icon-symbol">🏦</span>
                </div>
                <div className="bank-info">
                  <h4>{account.bankName}</h4>
                  <p>{account.accountName} •••• {account.accountNumber}</p>
                </div>
                <div className="bank-arrow">
                  <span className="arrow-icon">›</span>
                </div>
              </div>
            ))}
            {bankAccounts.length > 2 && (
              <div className="more-accounts">
                <Link to="/bank-accounts">+{bankAccounts.length - 2} more accounts</Link>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Expense Breakdown */}
      {dashboardData?.expensesByCategory && dashboardData.expensesByCategory.length > 0 && (
        <div className="finance-section expense-section">
          <div className="section-header">
            <div className="section-title-group">
              <span className="section-icon">📊</span>
              <h3>Expense Breakdown</h3>
            </div>
          </div>
          
          <div className="expense-breakdown">
            {dashboardData.expensesByCategory.map((category, index) => (
              <div key={index} className="expense-category">
                <div className="expense-category-header">
                  <div className="expense-category-label">
                    <div className="expense-dot" style={{ backgroundColor: getCategoryColor(category.category) }}></div>
                    <span className="expense-category-name" title={category.category}>{category.category}</span>
                  </div>
                  <span className="expense-amount" title={`$${formatCurrency(category.total)}`}>
                    ${formatCurrency(category.total)}
                  </span>
                </div>
                <div className="expense-bar-container">
                  <div 
                    className="expense-bar" 
                    style={{ 
                      width: `${category.percentage}%`,
                      backgroundColor: getCategoryColor(category.category)
                    }}
                  ></div>
                  <span className="expense-percentage">{Math.round(category.percentage)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Recent Transactions */}
      <div className="finance-section transactions-section">
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-icon">📝</span>
            <h3>Recent Transactions</h3>
          </div>
          <Link to="/transactions" className="section-action-btn">View All</Link>
        </div>
        
        {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
          <div className="transactions-list">
            {dashboardData.recentTransactions.map(transaction => (
              <div key={transaction.id} className={`finance-transaction-item ${transaction.type}-type`}>
                <div className={`transaction-icon-circle ${transaction.type}`}>
                  {transaction.category === 'Food' && <span>🍔</span>}
                  {transaction.category === 'Shopping' && <span>🛍️</span>}
                  {transaction.category === 'Transport' && <span>🚗</span>}
                  {transaction.category === 'Entertainment' && <span>🎬</span>}
                  {transaction.category === 'Housing' && <span>🏠</span>}
                  {transaction.category === 'Utilities' && <span>💡</span>}
                  {transaction.category === 'Healthcare' && <span>💊</span>}
                  {transaction.category === 'Education' && <span>📚</span>}
                  {!['Food', 'Shopping', 'Transport', 'Entertainment', 'Housing', 'Utilities', 'Healthcare', 'Education'].includes(transaction.category) && 
                    <span>{transaction.type === 'income' ? '↓' : '↑'}</span>}
                </div>
                <div className="transaction-info-container">
                  <div className="transaction-details">
                    <h4>{transaction.category}</h4>
                    <p className="transaction-description">{transaction.description || 'No description'}</p>
                    <p className="transaction-date">{formatDate(transaction.date)}</p>
                  </div>
                  <p className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-transactions">
            <div className="empty-icon">📊</div>
            <p>No transactions yet</p>
            <p className="empty-subtext">Use the + button to add your first transaction</p>
          </div>
        )}
      </div>
      
      {/* Add Transaction Button */}
      <Link to="/new-transaction" className="add-transaction-button">
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
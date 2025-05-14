import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../config/api';
import PlaidLinkButton from '../components/plaid/PlaidLinkButton';

interface Wallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
  bankAccount?: string;
}

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  walletId: string;
}

const FinanceDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data whenever the component mounts or the location changes
    // This ensures fresh data when returning from WalletForm or TransactionForm
    fetchWallets();
    fetchTransactions();
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

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/api/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    try {
      // Exchange public token for access token and store bank account data
      await api.post('/api/plaid/exchange-token', {
        public_token: publicToken,
        metadata: metadata
      });
      
      // Show success message
      setLinkSuccess('Bank account connected successfully!');
      
      // Refresh the wallets to show updated data
      fetchWallets();
    } catch (err) {
      console.error('Error linking bank account:', err);
    }
  };

  const handlePlaidExit = (err: any, metadata: any) => {
    if (err != null) {
      console.error('Plaid Link exit with error:', err, metadata);
    }
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
      
      {linkSuccess && <div className="success-message">{linkSuccess}</div>}
      
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
      
      {/* Bank Account Link Section */}
      <div className="finance-section bank-section">
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-icon">🏦</span>
            <h3>Link Bank Account</h3>
          </div>
          <Link to="/bank-accounts" className="section-action-btn">Manage Accounts</Link>
        </div>
        
        <div className="bank-link-container">
          <div className="bank-link-info">
            <p>Connect your bank accounts to automatically track transactions and balances</p>
            <PlaidLinkButton 
              onSuccess={handlePlaidSuccess}
              onExit={handlePlaidExit}
              className="bank-link-button"
            />
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
      
      {/* Transactions Section */}
      <div className="finance-section transactions-section">
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-icon">📊</span>
            <h3>Recent Transactions</h3>
          </div>
          <Link to="/transactions" className="section-action-btn">View All</Link>
        </div>
        
        <div className="transactions-container">
          {transactions.length > 0 ? (
            <div className="transactions-list">
              {transactions.slice(0, 5).map(transaction => (
                <div key={transaction._id} className="transaction-item">
                  <div className={`transaction-icon-circle ${transaction.amount < 0 ? 'expense' : 'income'}`}>
                    {transaction.category === 'Food' && <span>🍔</span>}
                    {transaction.category === 'Investments' && <span>📈</span>}
                    {transaction.category === 'Healthcare' && <span>💊</span>}
                    {!['Food', 'Investments', 'Healthcare'].includes(transaction.category || '') && 
                      <span>{transaction.amount < 0 ? '↑' : '↓'}</span>}
                  </div>
                  <div className="transaction-info-container">
                    <div className="transaction-details">
                      <h4>{transaction.category || (transaction.amount < 0 ? 'Expense' : 'Income')}</h4>
                      <p className="transaction-description">{transaction.description}</p>
                    </div>
                    <div className="transaction-info">
                      <p className={`transaction-amount ${transaction.amount < 0 ? 'expense' : 'income'}`}>
                        {transaction.amount < 0 ? '-' : '+'}${formatCurrency(Math.abs(transaction.amount))}
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
              <p>No transactions yet</p>
              <Link to="/transactions/new" className="add-first-transaction-btn">Add Your First Transaction</Link>
            </div>
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

export default FinanceDashboard;
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../config/api';

interface Wallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
}

interface TransactionFormData {
  type: 'income' | 'expense' | 'transfer';
  walletId: string;
  amount: string;
  category: string;
  description: string;
  date: string;
}

// List of categories based on transaction type
const CATEGORIES = {
  income: [
    'Salary', 'Freelance', 'Investments', 'Gifts', 'Refunds', 'Other'
  ],
  expense: [
    'Food', 'Shopping', 'Transport', 'Entertainment', 'Housing', 'Utilities', 
    'Healthcare', 'Personal', 'Education', 'Travel', 'Gifts', 'Other'
  ],
  transfer: [
    'Transfer'
  ]
};

const TransactionForm = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'income',
    walletId: '',
    amount: '',
    category: '',
    description: '',
    date: today
  });
  
  useEffect(() => {
    fetchWallets();
  }, []);
  
  useEffect(() => {
    // When transaction type changes, reset category
    setFormData(prev => ({
      ...prev,
      category: CATEGORIES[prev.type][0] || ''
    }));
  }, [formData.type]);
  
  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/wallet');
      setWallets(res.data);
      
      // Set default wallet if available
      if (res.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          walletId: res.data[0]._id,
          category: CATEGORIES[prev.type][0] || ''
        }));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching wallets:', err);
      setError('Failed to load wallets');
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleTypeChange = (type: 'income' | 'expense' | 'transfer') => {
    setFormData(prev => ({
      ...prev,
      type,
      category: CATEGORIES[type][0] || ''
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!formData.walletId) {
      setError('Please select a wallet');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare the data for sending to the API
      const transactionData = {
        walletId: formData.walletId,
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description || '', // Ensure description is not undefined
        date: new Date(formData.date).toISOString()
      };
      
      // Send the data to the API
      const response = await api.post('/api/transaction', transactionData);
      
      setSuccess(true);
      setError(null);
      
      // Reset form after successful submission
      setFormData({
        type: 'income',
        walletId: formData.walletId,
        amount: '',
        category: CATEGORIES['income'][0],
        description: '',
        date: today
      });
      
      // Navigate back to finance dashboard after a short delay
      setTimeout(() => {
        navigate('/finance-dashboard');
      }, 1500);
      
    } catch (err: any) {
      console.error('Error saving transaction:', err);
      
      // Detailed error handling
      if (err.response) {
        if (err.response.data && err.response.data.msg) {
          setError(err.response.data.msg);
        } else if (err.response.status === 401) {
          setError('Authentication error. Please log in again.');
        } else {
          setError(`Request failed: ${err.response.status} - ${err.response.statusText}`);
        }
      } else if (err.request) {
        setError('No response received from server. Please check your connection.');
      } else {
        setError('Error preparing request: ' + err.message);
      }
      
      setLoading(false);
    }
  };
  
  if (loading && wallets.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading wallet data...</p>
      </div>
    );
  }
  
  // Format wallet display for select dropdown
  const formatWalletOption = (wallet: Wallet) => {
    const currencySymbol = getCurrencySymbol(wallet.currency);
    return `${wallet.name} (${currencySymbol}${wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${wallet.currency})`;
  };
  
  // Get currency symbol
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
  
  return (
    <div className="transaction-form-page">
      {/* Header with back button */}
      <div className="transaction-form-header">
        <Link to="/finance-dashboard" className="back-button">
          <span>←</span>
        </Link>
        <h2>New Transaction</h2>
      </div>
      
      {/* Transaction form */}
      <div className="transaction-form-container">
        {success && (
          <div className="success-message">
            Transaction saved successfully! Redirecting...
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="simple-form">
          <div className="form-group">
            <label htmlFor="type">Transaction Type *</label>
            <div className="transaction-type-tabs">
              <button
                type="button"
                className={`type-tab ${formData.type === 'income' ? 'active' : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                Income
              </button>
              <button
                type="button"
                className={`type-tab ${formData.type === 'expense' ? 'active' : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`type-tab ${formData.type === 'transfer' ? 'active' : ''}`}
                onClick={() => handleTypeChange('transfer')}
              >
                Transfer
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="walletId">Wallet *</label>
            <select
              id="walletId"
              name="walletId"
              value={formData.walletId}
              onChange={handleChange}
              required
              disabled={loading || wallets.length === 0}
              className="form-select"
            >
              {wallets.length === 0 ? (
                <option value="">No wallets available</option>
              ) : (
                wallets.map(wallet => (
                  <option key={wallet._id} value={wallet._id}>
                    {formatWalletOption(wallet)}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              disabled={loading}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={loading}
              className="form-select"
            >
              {CATEGORIES[formData.type].map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add notes about the transaction"
              disabled={loading}
              rows={3}
              className="form-textarea"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={today}
              required
              disabled={loading}
              className="form-input"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="simple-button"
            disabled={loading || !formData.walletId || !formData.amount}
          >
            Add Transaction
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
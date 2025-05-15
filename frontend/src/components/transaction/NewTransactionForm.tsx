import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/api';

interface TransactionFormProps {
  walletId?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = {
  income: [
    { name: 'Salary', icon: '💰' },
    { name: 'Investment', icon: '📈' },
    { name: 'Gift', icon: '🎁' },
    { name: 'Other', icon: '💸' }
  ],
  expense: [
    { name: 'Food', icon: '🍔' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Transport', icon: '🚗' },
    { name: 'Entertainment', icon: '🎬' },
    { name: 'Housing', icon: '🏠' },
    { name: 'Utilities', icon: '💡' },
    { name: 'Healthcare', icon: '💊' },
    { name: 'Education', icon: '📚' },
    { name: 'Travel', icon: '✈️' },
    { name: 'Personal', icon: '👤' },
    { name: 'Other', icon: '📝' }
  ]
};

const NewTransactionForm = ({ walletId, onClose, onSuccess }: TransactionFormProps) => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedWallet, setSelectedWallet] = useState<string>(walletId || '');
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  useEffect(() => {
    // Fetch wallets
    const fetchWallets = async () => {
      try {
        const res = await api.get('/api/wallet');
        setWallets(res.data);
        
        // If no wallet is selected and wallets exist, select the first one
        if (!selectedWallet && res.data.length > 0) {
          setSelectedWallet(res.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching wallets:', err);
        setError('Failed to load wallets. Please try again.');
      }
    };
    
    fetchWallets();
    
    // If id is provided, fetch transaction details for editing
    if (id) {
      const fetchTransaction = async () => {
        try {
          const res = await api.get(`/api/transaction/${id}`);
          const transaction = res.data;
          
          setType(transaction.type);
          setCategory(transaction.category);
          setAmount(transaction.amount.toString());
          setDescription(transaction.description);
          setDate(new Date(transaction.date).toISOString().split('T')[0]);
          setSelectedWallet(transaction.wallet);
        } catch (err) {
          console.error('Error fetching transaction:', err);
          setError('Failed to load transaction details. Please try again.');
        }
      };
      
      fetchTransaction();
    }
  }, [id, selectedWallet, walletId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWallet) {
      setError('Please select a wallet');
      return;
    }
    
    if (!category) {
      setError('Please select a category');
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const transactionData = {
      type,
      category,
      amount: Number(amount),
      description,
      date,
      wallet: selectedWallet
    };
    
    try {
      if (id) {
        // Update existing transaction
        await api.put(`/api/transaction/${id}`, transactionData);
        setSuccess('Transaction updated successfully!');
      } else {
        // Create new transaction
        await api.post('/api/transaction', transactionData);
        setSuccess('Transaction added successfully!');
      }
      
      // Clear form
      if (!id) {
        setAmount('');
        setDescription('');
        setCategory('');
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Redirect or close after short delay
      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          navigate('/finance-dashboard');
        }
      }, 1500);
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError('Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (value: string) => {
    return value.replace(/\D/g, '')
               .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setAmount(value);
  };

  return (
    <div className="transaction-form-container">
      <div className="transaction-form-header">
        <h2>{id ? 'Edit Transaction' : 'New Transaction'}</h2>
        <p className="transaction-form-subtitle">
          {id ? 'Update your transaction details' : 'Enter the details of your transaction'}
        </p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        {/* Transaction Type */}
        <div className="transaction-type-selector">
          <div 
            className={`type-option expense ${type === 'expense' ? 'active' : ''}`}
            onClick={() => setType('expense')}
          >
            Expense
          </div>
          <div 
            className={`type-option income ${type === 'income' ? 'active' : ''}`}
            onClick={() => setType('income')}
          >
            Income
          </div>
        </div>
        
        {/* Amount Input */}
        <div className="form-group amount-input">
          <label htmlFor="amount">Amount</label>
          <span className="currency-symbol">₱</span>
          <input
            type="text"
            id="amount"
            value={formatCurrency(amount)}
            onChange={handleAmountChange}
            placeholder="0.00"
            required
          />
        </div>
        
        {/* Category Selection */}
        <div className="form-group">
          <label>Category</label>
          <div className="category-options">
            {CATEGORIES[type].map((cat) => (
              <div 
                key={cat.name}
                className={`category-item ${category === cat.name ? 'active' : ''}`}
                onClick={() => setCategory(cat.name)}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
          />
        </div>
        
        {/* Date */}
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        {/* Wallet Selection (only show if walletId is not provided) */}
        {!walletId && (
          <div className="form-group">
            <label htmlFor="wallet">Wallet</label>
            <select
              id="wallet"
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              required
            >
              <option value="">Select Wallet</option>
              {wallets.map((wallet) => (
                <option key={wallet._id} value={wallet._id}>
                  {wallet.name} (${wallet.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Submit Button */}
        <button 
          type="submit" 
          className="add-transaction-button-form"
          disabled={loading}
        >
          {loading 
            ? 'Saving...' 
            : id 
              ? 'Update Transaction' 
              : 'Add Transaction'
          }
        </button>
      </form>
    </div>
  );
};

export default NewTransactionForm; 
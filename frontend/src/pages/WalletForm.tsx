import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../config/api';

interface WalletFormData {
  name: string;
  balance: string;
  currency: string;
  bankAccount?: string;
  maskedBankAccount?: string; // Added for displaying masked account number
}

interface WalletResponse {
  _id: string;
  name: string;
  balance: number;
  currency: string;
  bankAccount?: string;
  maskedBankAccount?: string; // Added for receiving masked account from API
}

// Available currencies
const CURRENCIES = [
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pound', value: 'GBP' },
  { label: 'JPY - Japanese Yen', value: 'JPY' },
  { label: 'CAD - Canadian Dollar', value: 'CAD' },
  { label: 'AUD - Australian Dollar', value: 'AUD' },
  { label: 'CNY - Chinese Yuan', value: 'CNY' },
  { label: 'INR - Indian Rupee', value: 'INR' },
  { label: 'PHP - Philippine Peso', value: 'PHP' },
];

const WalletForm = () => {
  const navigate = useNavigate();
  const { walletId } = useParams();
  const isEditMode = Boolean(walletId);
  
  const [formData, setFormData] = useState<WalletFormData>({
    name: '',
    balance: '0',
    currency: 'USD',
    bankAccount: '',
    maskedBankAccount: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasBankAccount, setHasBankAccount] = useState(false);
  const [isBankAccountChanged, setIsBankAccountChanged] = useState(false);

  useEffect(() => {
    // If editing existing wallet, fetch its data
    if (isEditMode && walletId) {
      fetchWalletData(walletId);
    }
  }, [isEditMode, walletId]);

  const fetchWalletData = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.get<WalletResponse>(`/api/wallet/${id}`);
      const wallet = response.data;
      
      // Check if this wallet has a bank account
      setHasBankAccount(!!wallet.maskedBankAccount);
      
      setFormData({
        name: wallet.name,
        balance: wallet.balance.toString(),
        currency: wallet.currency,
        bankAccount: '', // Don't populate the actual bank account number for security
        maskedBankAccount: wallet.maskedBankAccount || ''
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching wallet:', err);
      setError('Failed to load wallet data');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If bank account is changed, mark it as changed
    if (name === 'bankAccount' && value !== '') {
      setIsBankAccountChanged(true);
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Wallet name is required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Only send bank account data if it was changed or it's a new wallet
      const walletData = {
        name: formData.name.trim(),
        balance: parseFloat(formData.balance || '0'),
        currency: formData.currency,
        bankAccount: (isEditMode && !isBankAccountChanged) 
          ? undefined 
          : formData.bankAccount?.trim() || ''
      };
      
      if (isEditMode && walletId) {
        await api.put(`/api/wallet/${walletId}`, walletData);
      } else {
        await api.post('/api/wallet', walletData);
      }
      
      // Navigate back to finance dashboard
      navigate('/finance-dashboard');
      
    } catch (err: any) {
      console.error('Error saving wallet:', err);
      setError(err.response?.data?.message || 'Failed to save wallet');
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading wallet data...</p>
      </div>
    );
  }

  return (
    <div className="wallet-form-page">
      {/* Header with back button */}
      <div className="wallet-form-header">
        <Link to="/finance-dashboard" className="back-button">
          <span>←</span>
        </Link>
        <h2>{isEditMode ? 'Edit Wallet' : 'New Wallet'}</h2>
      </div>
      
      {/* Wallet form */}
      <div className="wallet-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Wallet Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter wallet name"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="balance">Initial Balance</label>
            <input
              type="number"
              id="balance"
              name="balance"
              value={formData.balance}
              onChange={handleChange}
              placeholder="0"
              step="0.01"
              disabled={loading || isEditMode}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              disabled={loading}
            >
              {CURRENCIES.map(currency => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="bankAccount">
              {isEditMode && hasBankAccount && !isBankAccountChanged
                ? 'Bank Account Number (Already Saved)'
                : 'Bank Account Number (Optional)'}
            </label>
            
            {isEditMode && hasBankAccount && !isBankAccountChanged ? (
              <div className="bank-account-display">
                <div className="masked-account">
                  <span className="masked-text">{formData.maskedBankAccount}</span>
                  <button 
                    type="button" 
                    className="change-btn"
                    onClick={() => setIsBankAccountChanged(true)}
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  id="bankAccount"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleChange}
                  placeholder="Enter bank account number"
                  disabled={loading}
                />
                <p className="helper-text">This will be stored securely and tokenized for your privacy.</p>
              </>
            )}
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="create-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Wallet' : 'Create Wallet')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WalletForm; 
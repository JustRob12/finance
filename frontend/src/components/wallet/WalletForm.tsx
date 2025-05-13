import { useState, useEffect } from 'react';

interface Wallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
}

interface WalletFormProps {
  wallet: Wallet | null;
  onSubmit: (id: string, data: any) => void;
  onCancel: () => void;
}

const WalletForm = ({ wallet, onSubmit, onCancel }: WalletFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    balance: 0,
    currency: 'USD'
  });

  const { name, balance, currency } = formData;

  useEffect(() => {
    if (wallet) {
      setFormData({
        name: wallet.name,
        balance: wallet.balance,
        currency: wallet.currency
      });
    }
  }, [wallet]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === 'balance' 
        ? parseFloat(e.target.value) 
        : e.target.value
    });
  };

  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (wallet) {
      // Don't allow editing balance directly to maintain integrity
      const { name, currency } = formData;
      onSubmit(wallet._id, { name, currency });
    } else {
      onSubmit('', formData);
    }
  };

  return (
    <div className="wallet-form-container fade-in">
      <div className="wallet-form-header">
        <h3>{wallet ? 'Edit Wallet' : 'Add New Wallet'}</h3>
        <p className="wallet-form-subtitle">
          {wallet 
            ? 'Update your wallet details below' 
            : 'Create a new wallet to start tracking your finances'}
        </p>
      </div>
      
      <form onSubmit={onSubmitForm}>
        <div className="form-group">
          <label htmlFor="name">Wallet Name</label>
          <div className="input-with-icon">
            <span className="input-icon">💼</span>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={onChange}
              required
              placeholder="e.g. My Main Wallet"
              className="wallet-input"
            />
          </div>
        </div>
        
        {!wallet && (
          <div className="form-group">
            <label htmlFor="balance">Starting Balance</label>
            <div className="input-with-icon">
              <span className="input-icon">💰</span>
              <input
                type="number"
                name="balance"
                id="balance"
                value={balance}
                onChange={onChange}
                step="0.01"
                placeholder="0.00"
                className="wallet-input"
              />
            </div>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <div className="select-wrapper">
            <select
              name="currency"
              id="currency"
              value={currency}
              onChange={onChange}
              className="wallet-select"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="INR">INR (₹)</option>
              <option value="CNY">CNY (¥)</option>
            </select>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-save">
            {wallet ? 'Update Wallet' : 'Create Wallet'}
          </button>
          <button 
            type="button" 
            className="btn-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default WalletForm; 
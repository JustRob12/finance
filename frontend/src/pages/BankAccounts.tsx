import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import PlaidLinkButton from '../components/plaid/PlaidLinkButton';

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string; // Usually masked like "xxxx1234"
  accountType: string;
  createdAt: string;
}

const BankAccounts = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/plaid/accounts');
      setAccounts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      setError('Failed to load your bank accounts. Please try again later.');
      setLoading(false);
    }
  };

  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Exchange public token for access token and store bank account data
      await api.post('/api/plaid/exchange-token', {
        public_token: publicToken,
        metadata: metadata
      });
      
      // Show success message
      setSuccess('Bank account connected successfully!');
      
      // Refresh the list of bank accounts
      fetchBankAccounts();
    } catch (err) {
      console.error('Error linking bank account:', err);
      setError('Failed to link your bank account. Please try again.');
      setLoading(false);
    }
  };

  const handlePlaidExit = (err: any, metadata: any) => {
    if (err != null) {
      console.error('Plaid Link exit with error:', err, metadata);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (window.confirm('Are you sure you want to disconnect this bank account?')) {
      try {
        setLoading(true);
        await api.delete(`/api/plaid/accounts/${accountId}`);
        setAccounts(accounts.filter(account => account.id !== accountId));
        setSuccess('Bank account disconnected successfully');
        setLoading(false);
      } catch (err) {
        console.error('Error disconnecting account:', err);
        setError('Failed to disconnect your bank account. Please try again.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="bank-accounts-page">
      {/* Header with back button */}
      <div className="page-header">
        <Link to="/finance-dashboard" className="back-button">
          <span>←</span>
        </Link>
        <h2>Bank Accounts</h2>
      </div>
      
      {/* Success and Error messages */}
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Connect Bank Account button */}
      <div className="connect-bank-section">
        <h3>Link a New Bank Account</h3>
        <p>Connect your bank accounts to automatically track transactions and balances</p>
        <PlaidLinkButton 
          onSuccess={handlePlaidSuccess} 
          onExit={handlePlaidExit}
          className="connect-bank-button"
        />
      </div>
      
      {/* List of connected accounts */}
      <div className="connected-accounts-section">
        <h3>Connected Accounts</h3>
        
        {loading ? (
          <div className="loading-spinner"></div>
        ) : accounts.length === 0 ? (
          <div className="no-accounts">
            <p>You don't have any connected bank accounts yet.</p>
          </div>
        ) : (
          <div className="accounts-list">
            {accounts.map(account => (
              <div key={account.id} className="bank-account-item">
                <div className="bank-account-info">
                  <div className="bank-icon">
                    <span role="img" aria-label="bank">🏦</span>
                  </div>
                  <div className="bank-details">
                    <h4>{account.bankName}</h4>
                    <p>{account.accountName} ({account.accountType})</p>
                    <p className="account-number">•••• {account.accountNumber}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDisconnect(account.id)}
                  className="disconnect-button"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BankAccounts; 
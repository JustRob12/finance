import { useState, useEffect } from 'react';
import axios from 'axios';
import WalletForm from './WalletForm.tsx';
import WalletItem from './WalletItem.tsx';

interface Wallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
  createdAt: string;
}

const WalletList = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/wallet');
      setWallets(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching wallets:', err);
      setLoading(false);
    }
  };

  const addWallet = async (_id: string, wallet: { name: string, balance: number, currency: string }) => {
    try {
      const res = await axios.post('/api/wallet', wallet);
      setWallets([res.data, ...wallets]);
      setShowForm(false);
    } catch (err) {
      console.error('Error adding wallet:', err);
    }
  };

  const updateWallet = async (id: string, wallet: { name: string, currency: string }) => {
    try {
      const res = await axios.put(`/api/wallet/${id}`, wallet);
      setWallets(wallets.map(w => (w._id === id ? res.data : w)));
      setCurrentWallet(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error updating wallet:', err);
    }
  };

  const deleteWallet = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this wallet? All transactions will be lost.')) {
      try {
        await axios.delete(`/api/wallet/${id}`);
        setWallets(wallets.filter(wallet => wallet._id !== id));
      } catch (err) {
        console.error('Error deleting wallet:', err);
      }
    }
  };

  const openEditForm = (wallet: Wallet) => {
    setCurrentWallet(wallet);
    setShowForm(true);
  };

  if (loading) {
    return <div className="loading">Loading wallets...</div>;
  }

  return (
    <div className="wallet-list-container">
      <div className="wallet-list-header">
        <h2>My Wallets</h2>
        <button 
          className="btn-add-wallet"
          onClick={() => {
            setCurrentWallet(null);
            setShowForm(true);
          }}
        >
          <i className="fas fa-plus"></i> Add Wallet
        </button>
      </div>
      
      {showForm && (
        <WalletForm 
          wallet={currentWallet}
          onSubmit={currentWallet ? updateWallet : addWallet}
          onCancel={() => {
            setShowForm(false);
            setCurrentWallet(null);
          }}
        />
      )}
      
      {wallets.length === 0 ? (
        <div className="no-wallets">
          <p>You don't have any wallets yet. Add one to get started!</p>
        </div>
      ) : (
        <div className="wallets-grid">
          {wallets.map(wallet => (
            <WalletItem 
              key={wallet._id}
              wallet={wallet}
              onEdit={() => openEditForm(wallet)}
              onDelete={() => deleteWallet(wallet._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletList; 
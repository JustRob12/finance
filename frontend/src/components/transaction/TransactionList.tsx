import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import TransactionForm from './TransactionForm.tsx';
import TransactionItem from './TransactionItem.tsx';
import TransactionStats from './TransactionStats.tsx';

interface Transaction {
  _id: string;
  wallet: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface Wallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
}

interface Stats {
  income: number;
  expenses: number;
  balance: number;
  savings: number;
}

const TransactionList = () => {
  const { walletId } = useParams<{ walletId: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (walletId) {
      fetchWallet();
      fetchTransactions();
      fetchStats();
    }
  }, [walletId]);

  const fetchWallet = async () => {
    try {
      const res = await axios.get(`/api/wallet/${walletId}`);
      setWallet(res.data);
    } catch (err) {
      console.error('Error fetching wallet:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/transaction/wallet/${walletId}`);
      setTransactions(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`/api/transaction/stats/wallet/${walletId}`);
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const addTransaction = async (transaction: any) => {
    try {
      const res = await axios.post('/api/transaction', {
        ...transaction,
        walletId
      });
      setTransactions([res.data.transaction, ...transactions]);
      setWallet(prevWallet => {
        if (prevWallet) {
          return {
            ...prevWallet,
            balance: res.data.wallet.balance
          };
        }
        return null;
      });
      fetchStats();
      setShowForm(false);
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  const updateTransaction = async (id: string, transaction: any) => {
    try {
      const res = await axios.put(`/api/transaction/${id}`, transaction);
      setTransactions(transactions.map(t => (t._id === id ? res.data.transaction : t)));
      setWallet(prevWallet => {
        if (prevWallet) {
          return {
            ...prevWallet,
            balance: res.data.wallet.balance
          };
        }
        return null;
      });
      fetchStats();
      setCurrentTransaction(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error updating transaction:', err);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const res = await axios.delete(`/api/transaction/${id}`);
        setTransactions(transactions.filter(transaction => transaction._id !== id));
        setWallet(prevWallet => {
          if (prevWallet) {
            return {
              ...prevWallet,
              balance: res.data.wallet.balance
            };
          }
          return null;
        });
        fetchStats();
      } catch (err) {
        console.error('Error deleting transaction:', err);
      }
    }
  };

  const openEditForm = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setShowForm(true);
  };

  if (loading && !wallet) {
    return <div className="loading">Loading transactions...</div>;
  }

  if (!wallet) {
    return <div className="error">Wallet not found</div>;
  }

  return (
    <div className="transaction-container">
      <div className="transaction-header">
        <div className="wallet-info">
          <h2>{wallet.name}</h2>
          <p className={wallet.balance < 0 ? 'negative' : 'positive'}>
            Balance: ${Math.abs(wallet.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <button 
          className="btn-add-transaction"
          onClick={() => {
            setCurrentTransaction(null);
            setShowForm(true);
          }}
        >
          <i className="fas fa-plus"></i> Add Transaction
        </button>
      </div>

      {stats && <TransactionStats stats={stats} />}
      
      {showForm && (
        <TransactionForm 
          transaction={currentTransaction}
          onSubmit={currentTransaction ? updateTransaction : addTransaction}
          onCancel={() => {
            setShowForm(false);
            setCurrentTransaction(null);
          }}
        />
      )}
      
      {!loading && transactions.length === 0 ? (
        <div className="no-transactions">
          <p>No transactions found for this wallet. Add one to get started!</p>
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.map(transaction => (
            <TransactionItem 
              key={transaction._id}
              transaction={transaction}
              onEdit={() => openEditForm(transaction)}
              onDelete={() => deleteTransaction(transaction._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList; 
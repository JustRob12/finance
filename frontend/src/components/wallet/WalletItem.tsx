import { Link } from 'react-router-dom';

interface Wallet {
  _id: string;
  name: string;
  balance: number;
  currency: string;
  createdAt: string;
  maskedBankAccount?: string;
}

interface WalletItemProps {
  wallet: Wallet;
  onEdit: () => void;
  onDelete: () => void;
}

const getCurrencySymbol = (currency: string): string => {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    default: return '$';
  }
};

const WalletItem = ({ wallet, onEdit, onDelete }: WalletItemProps) => {
  const { _id, name, balance, currency, maskedBankAccount } = wallet;
  const currencySymbol = getCurrencySymbol(currency);
  const isNegative = balance < 0;

  return (
    <div className="wallet-item">
      <div className="wallet-header">
        <h3>{name}</h3>
        <div className="wallet-actions">
          <button className="action-btn edit" onClick={onEdit}>
            <i className="fas fa-edit"></i>
          </button>
          <button className="action-btn delete" onClick={onDelete}>
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div className={`wallet-balance ${isNegative ? 'negative' : 'positive'}`}>
        <span className="balance-text">Balance</span>
        <span className="balance-amount">
          {currencySymbol}{Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      
      {maskedBankAccount && (
        <div className="wallet-bank-account">
          <span className="bank-account-label">Bank Account:</span>
          <span className="bank-account-number">{maskedBankAccount}</span>
        </div>
      )}
      
      <div className="wallet-footer">
        <Link to={`/wallet/${_id}`} className="btn-view-transactions">
          Manage Transactions
        </Link>
      </div>
    </div>
  );
};

export default WalletItem; 
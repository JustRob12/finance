interface Transaction {
  _id: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}

const getCategoryIcon = (category: string, type: string): string => {
  switch (category) {
    case 'food': return '🍔';
    case 'transportation': return '🚗';
    case 'housing': return '🏠';
    case 'utilities': return '💡';
    case 'entertainment': return '🎬';
    case 'healthcare': return '🏥';
    case 'shopping': return '🛍️';
    case 'personal': return '👤';
    case 'education': return '📚';
    case 'travel': return '✈️';
    case 'debt': return '💰';
    case 'salary': return '💼';
    case 'freelance': return '💻';
    case 'investment': return '📈';
    case 'gift': return '🎁';
    default: return type === 'income' ? '💲' : '🧾';
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const TransactionItem = ({ transaction, onEdit, onDelete }: TransactionItemProps) => {
  const { type, category, amount, description, date } = transaction;
  const isIncome = type === 'income';
  const icon = getCategoryIcon(category, type);

  return (
    <div className={`transaction-item ${type}-type`}>
      <div className="transaction-icon">
        {icon}
      </div>
      <div className="transaction-content">
        <div className="transaction-details">
          <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
          <p className="transaction-description">{description || 'No description'}</p>
          <p className="transaction-date">{formatDate(date)}</p>
        </div>
        <div className="transaction-amount-container">
          <span className={`transaction-amount ${isIncome ? 'positive' : 'negative'}`}>
            {isIncome ? '+' : '-'} ₱{Math.abs(amount).toFixed(2)}
          </span>
          <div className="transaction-actions">
            <button className="action-btn edit" onClick={onEdit}>
              <i className="fas fa-edit"></i>
            </button>
            <button className="action-btn delete" onClick={onDelete}>
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem; 
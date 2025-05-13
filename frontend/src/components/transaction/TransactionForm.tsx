import { useState, useEffect } from 'react';

interface Transaction {
  _id: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface TransactionFormProps {
  transaction: Transaction | null;
  onSubmit: (id: string, data: any) => void;
  onCancel: () => void;
}

const TransactionForm = ({ transaction, onSubmit, onCancel }: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'general',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description,
        date: new Date(transaction.date).toISOString().split('T')[0]
      });
    }
  }, [transaction]);

  const { type, category, amount, description, date } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === 'amount' 
        ? parseFloat(e.target.value) 
        : e.target.value
    });
  };

  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (transaction) {
      onSubmit(transaction._id, formData);
    } else {
      onSubmit('', formData);
    }
  };

  return (
    <div className="transaction-form-container">
      <h3>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
      <form onSubmit={onSubmitForm}>
        <div className="form-group">
          <label htmlFor="type">Transaction Type</label>
          <select
            name="type"
            value={type}
            onChange={onChange}
            required
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            name="category"
            value={category}
            onChange={onChange}
            required
          >
            {type === 'income' ? (
              <>
                <option value="salary">Salary</option>
                <option value="freelance">Freelance</option>
                <option value="investment">Investment</option>
                <option value="gift">Gift</option>
                <option value="other">Other Income</option>
              </>
            ) : (
              <>
                <option value="food">Food & Dining</option>
                <option value="transportation">Transportation</option>
                <option value="housing">Housing & Rent</option>
                <option value="utilities">Utilities</option>
                <option value="entertainment">Entertainment</option>
                <option value="healthcare">Healthcare</option>
                <option value="shopping">Shopping</option>
                <option value="personal">Personal Care</option>
                <option value="education">Education</option>
                <option value="travel">Travel</option>
                <option value="debt">Debt Payments</option>
                <option value="other">Other Expense</option>
              </>
            )}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            name="amount"
            value={amount}
            onChange={onChange}
            min="0.01"
            step="0.01"
            required
            placeholder="0.00"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            value={description}
            onChange={onChange}
            placeholder="Enter a description"
            rows={2}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            name="date"
            value={date}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {transaction ? 'Update Transaction' : 'Add Transaction'}
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

export default TransactionForm; 
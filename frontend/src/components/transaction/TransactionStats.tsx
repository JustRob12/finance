import React from 'react';

interface StatsProps {
  stats: {
    income: number;
    expenses: number;
    balance: number;
    savings: number;
  };
}

const TransactionStats: React.FC<StatsProps> = ({ stats }) => {
  const { income, expenses, balance, savings } = stats;
  
  return (
    <div className="transaction-stats">
      <div className="stat-card income">
        <h4>Income</h4>
        <p>₱{income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
      
      <div className="stat-card expenses">
        <h4>Expenses</h4>
        <p>₱{expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
      
      <div className="stat-card balance">
        <h4>Balance</h4>
        <p className={balance < 0 ? 'negative' : 'positive'}>
          ₱{Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
      
      <div className="stat-card savings">
        <h4>Savings Rate</h4>
        <p className={savings < 0 ? 'negative' : 'positive'}>
          ₱{Math.abs(savings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

export default TransactionStats; 
import { useNavigate } from 'react-router-dom';
import NewTransactionForm from '../components/transaction/NewTransactionForm';

const NewTransaction = () => {
  const navigate = useNavigate();
  
  return (
    <div className="new-transaction-page">
      <div className="transaction-page-header">
        <button 
          className="back-button" 
          onClick={() => navigate('/finance-dashboard')}
        >
          ← Back
        </button>
        <h1>New Transaction</h1>
      </div>
      
      <NewTransactionForm 
        onSuccess={() => {
          // Show a success notification or do something else
          console.log('Transaction added successfully');
        }}
      />
    </div>
  );
};

export default NewTransaction; 
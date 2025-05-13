import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import TransactionList from './components/transaction/TransactionList';
import WalletFormPage from './pages/WalletForm';
import TransactionForm from './pages/TransactionForm';
import BankAccounts from './pages/BankAccounts';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/finance-dashboard" element={<FinanceDashboard />} />
              <Route path="/wallet/:walletId" element={<TransactionList />} />
              <Route path="/wallet/new" element={<WalletFormPage />} />
              <Route path="/wallet/edit/:walletId" element={<WalletFormPage />} />
              <Route path="/transactions/new" element={<TransactionForm />} />
              <Route path="/bank-accounts" element={<BankAccounts />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

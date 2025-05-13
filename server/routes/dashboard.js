const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const GoogleUser = require('../models/GoogleUser');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// Get user dashboard data (protected route)
router.get('/', auth, async (req, res) => {
  try {
    // Get user from regular Users collection
    const user = await User.findById(req.user.id).select('-password');
    
    // Check if there's a matching Google user
    let googleUser = null;
    if (req.user.googleId) {
      googleUser = await GoogleUser.findOne({ googleId: req.user.googleId });
    }
    
    // Prioritize Google user data if available
    const userData = {
      id: user._id,
      name: googleUser ? googleUser.name : user.name,
      email: googleUser ? googleUser.email : user.email,
      photoURL: googleUser ? googleUser.photoURL : (user.photoURL || '')
    };
    
    // Get real transactions data
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(5);
    
    // Format transactions
    const formattedTransactions = transactions.map(tx => ({
      id: tx._id,
      description: tx.description,
      amount: tx.amount,
      date: tx.date,
      type: tx.amount < 0 ? 'expense' : 'income',
      category: tx.category || 'Uncategorized'
    }));
    
    // Calculate income, expenses and savings
    const allTransactions = await Transaction.find({ user: req.user.id });
    let income = 0;
    let expenses = 0;
    
    allTransactions.forEach(tx => {
      if (tx.amount > 0) {
        income += tx.amount;
      } else {
        expenses += Math.abs(tx.amount);
      }
    });
    
    const savings = income - expenses;
    
    res.json({
      user: userData,
      dashboardData: {
        totalBalance: await calculateTotalBalance(req.user.id),
        recentTransactions: formattedTransactions,
        analytics: {
          income,
          expenses,
          savings
        }
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get finance dashboard data (protected route)
router.get('/finance-dashboard', auth, async (req, res) => {
  try {
    // Get user from regular Users collection
    const user = await User.findById(req.user.id).select('-password');
    
    // Check if there's a matching Google user
    let googleUser = null;
    if (req.user.googleId) {
      googleUser = await GoogleUser.findOne({ googleId: req.user.googleId });
    }
    
    // Prioritize Google user data if available
    const userData = {
      id: user._id,
      name: googleUser ? googleUser.name : user.name,
      email: googleUser ? googleUser.email : user.email,
      photoURL: googleUser ? googleUser.photoURL : (user.photoURL || '')
    };
    
    // Get user's wallets
    const wallets = await Wallet.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    // Calculate total balance
    const totalBalance = wallets.reduce((total, wallet) => total + wallet.balance, 0);
    
    // Get recent transactions 
    const recentTransactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(5);
    
    // Process transactions into the required format
    const formattedTransactions = recentTransactions.map(tx => ({
      id: tx._id,
      description: tx.description || '',
      amount: tx.amount,
      date: tx.date,
      type: tx.amount < 0 ? 'expense' : 'income',
      category: tx.category || 'Uncategorized'
    }));
    
    // Calculate expense breakdown by category from actual transactions
    // Get expense transactions for category calculation
    const expenseTransactions = await Transaction.find({ 
      user: req.user.id,
      amount: { $lt: 0 } // Only negative amounts (expenses)
    });
    
    // Group expenses by category
    const categoryTotals = {};
    let totalExpenses = 0;
    
    expenseTransactions.forEach(tx => {
      const category = tx.category || 'Uncategorized';
      const amount = Math.abs(tx.amount);
      
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      
      categoryTotals[category] += amount;
      totalExpenses += amount;
    });
    
    // Format expense breakdown with percentages
    const expensesByCategory = Object.keys(categoryTotals).map(category => {
      const total = categoryTotals[category];
      const percentage = totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0;
      
      return {
        category,
        total,
        percentage
      };
    });
    
    // Sort by highest amount first
    expensesByCategory.sort((a, b) => b.total - a.total);
    
    res.json({
      user: userData,
      dashboardData: {
        totalBalance,
        wallets,
        recentTransactions: formattedTransactions,
        expensesByCategory
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Helper function to calculate total balance across all wallets
async function calculateTotalBalance(userId) {
  const wallets = await Wallet.find({ user: userId });
  return wallets.reduce((total, wallet) => total + wallet.balance, 0);
}

module.exports = router; 
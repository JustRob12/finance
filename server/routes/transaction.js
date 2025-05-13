const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// @route   GET api/transaction/wallet/:walletId
// @desc    Get all transactions for a wallet
// @access  Private
router.get('/wallet/:walletId', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.walletId);
    if (!wallet) {
      return res.status(404).json({ msg: 'Wallet not found' });
    }

    // Make sure user owns wallet
    if (wallet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const transactions = await Transaction.find({
      wallet: req.params.walletId
    }).sort({ date: -1 });

    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/transaction
// @desc    Add transaction
// @access  Private
router.post('/', auth, async (req, res) => {
  const { walletId, type, category, amount, description, date } = req.body;

  // Validate transaction data
  if (!['income', 'expense', 'transfer'].includes(type)) {
    return res.status(400).json({ msg: 'Invalid transaction type' });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: 'Amount must be greater than 0' });
  }

  try {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ msg: 'Wallet not found' });
    }

    // Make sure user owns wallet
    if (wallet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // For expense transactions, check if wallet has enough balance
    if (type === 'expense' && wallet.balance < amount) {
      return res.status(400).json({ 
        msg: 'Insufficient funds in wallet',
        currentBalance: wallet.balance
      });
    }

    // Create new transaction
    const newTransaction = new Transaction({
      wallet: walletId,
      user: req.user.id,
      type,
      category,
      amount,
      description: description || '',
      date: date || Date.now()
    });

    // Update wallet balance based on transaction type
    const transactionMultiplier = type === 'income' ? 1 : -1;
    wallet.balance = wallet.balance + (amount * transactionMultiplier);
    
    await wallet.save();
    const transaction = await newTransaction.save();

    res.json({
      transaction,
      wallet: {
        id: wallet._id,
        balance: wallet.balance,
        name: wallet.name,
        currency: wallet.currency
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/transaction/:id
// @desc    Update transaction
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { type, category, amount, description, date } = req.body;

  try {
    let transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const wallet = await Wallet.findById(transaction.wallet);
    if (!wallet) {
      return res.status(404).json({ msg: 'Wallet not found' });
    }

    // Reverse the original transaction's effect on the balance
    const oldTransactionMultiplier = transaction.type === 'income' ? 1 : -1;
    wallet.balance = wallet.balance - (transaction.amount * oldTransactionMultiplier);

    // Validate new transaction type if provided
    if (type && !['income', 'expense', 'transfer'].includes(type)) {
      return res.status(400).json({ msg: 'Invalid transaction type' });
    }

    // For expense transactions, check if wallet will have enough balance after update
    const newType = type || transaction.type;
    const newAmount = amount || transaction.amount;
    
    if (newType === 'expense' && wallet.balance < newAmount) {
      // Restore original balance before returning error
      wallet.balance = wallet.balance + (transaction.amount * oldTransactionMultiplier);
      
      return res.status(400).json({ 
        msg: 'Insufficient funds in wallet for this update',
        currentBalance: wallet.balance
      });
    }

    // Update the transaction
    const transactionFields = {};
    if (type) transactionFields.type = type;
    if (category) transactionFields.category = category;
    if (amount) transactionFields.amount = amount;
    if (description !== undefined) transactionFields.description = description;
    if (date) transactionFields.date = date;

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: transactionFields },
      { new: true }
    );

    // Apply the new transaction's effect on the balance
    const newTransactionMultiplier = transaction.type === 'income' ? 1 : -1;
    wallet.balance = wallet.balance + (transaction.amount * newTransactionMultiplier);
    
    await wallet.save();

    res.json({
      transaction,
      wallet: {
        id: wallet._id,
        balance: wallet.balance,
        name: wallet.name,
        currency: wallet.currency
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/transaction/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const wallet = await Wallet.findById(transaction.wallet);
    if (!wallet) {
      return res.status(404).json({ msg: 'Wallet not found' });
    }

    // Reverse the transaction's effect on the balance
    const transactionMultiplier = transaction.type === 'income' ? 1 : -1;
    wallet.balance = wallet.balance - (transaction.amount * transactionMultiplier);
    
    await wallet.save();
    await Transaction.findByIdAndRemove(req.params.id);

    res.json({
      msg: 'Transaction removed',
      wallet: {
        id: wallet._id,
        balance: wallet.balance,
        name: wallet.name,
        currency: wallet.currency
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/transaction/stats/wallet/:walletId
// @desc    Get transaction statistics for a wallet
// @access  Private
router.get('/stats/wallet/:walletId', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.walletId);
    if (!wallet) {
      return res.status(404).json({ msg: 'Wallet not found' });
    }

    // Make sure user owns wallet
    if (wallet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const transactions = await Transaction.find({
      wallet: req.params.walletId
    });

    // Calculate total income and expenses
    const stats = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount;
        } else if (transaction.type === 'expense') {
          acc.expenses += transaction.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );

    stats.balance = wallet.balance;
    stats.savings = stats.income - stats.expenses;

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/transaction/user
// @desc    Get recent transactions for a user (across all wallets)
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(10);

    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 
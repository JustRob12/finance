const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { tokenize, detokenize, maskData } = require('../utils/tokenizer');

// @route   GET api/wallet
// @desc    Get all wallets for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const wallets = await Wallet.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    // For each wallet, provide a masked version of the bank account number
    const processedWallets = wallets.map(wallet => {
      const walletObj = wallet.toObject();
      
      // If wallet has a bank account, mask it for display
      if (walletObj.bankAccount) {
        try {
          const originalAccount = detokenize(walletObj.bankAccount);
          walletObj.maskedBankAccount = maskData(originalAccount);
        } catch (error) {
          console.error('Error detokenizing bank account:', error);
          walletObj.maskedBankAccount = '****';
        }
      }
      
      return walletObj;
    });
    
    res.json(processedWallets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/wallet
// @desc    Create a wallet
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, balance, currency, bankAccount } = req.body;

  try {
    // Tokenize bank account if provided
    const tokenizedBankAccount = bankAccount ? tokenize(bankAccount) : '';
    
    const newWallet = new Wallet({
      user: req.user.id,
      name: name || 'My Wallet',
      balance: balance || 0,
      currency: currency || 'USD',
      bankAccount: tokenizedBankAccount
    });

    const wallet = await newWallet.save();
    
    // Return a response with the masked bank account for UI display
    const response = wallet.toObject();
    if (bankAccount) {
      response.maskedBankAccount = maskData(bankAccount);
    }
    
    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/wallet/:id
// @desc    Get wallet by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.id);

    // Check if wallet exists
    if (!wallet) return res.status(404).json({ msg: 'Wallet not found' });

    // Make sure user owns wallet
    if (wallet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Convert to object for manipulation
    const walletObj = wallet.toObject();
    
    // If wallet has a bank account, provide a masked version for UI display
    if (walletObj.bankAccount) {
      try {
        const originalAccount = detokenize(walletObj.bankAccount);
        walletObj.maskedBankAccount = maskData(originalAccount);
      } catch (error) {
        console.error('Error detokenizing bank account:', error);
        walletObj.maskedBankAccount = '****';
      }
    }

    res.json(walletObj);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Wallet not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/wallet/:id
// @desc    Update wallet
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, currency, bankAccount } = req.body;

  // Build wallet object
  const walletFields = {};
  if (name) walletFields.name = name;
  if (currency) walletFields.currency = currency;
  if (bankAccount !== undefined) {
    walletFields.bankAccount = bankAccount ? tokenize(bankAccount) : '';
  }

  try {
    let wallet = await Wallet.findById(req.params.id);

    // Check if wallet exists
    if (!wallet) return res.status(404).json({ msg: 'Wallet not found' });

    // Make sure user owns wallet
    if (wallet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    wallet = await Wallet.findByIdAndUpdate(
      req.params.id,
      { $set: walletFields },
      { new: true }
    );

    // Convert to object for manipulation
    const walletObj = wallet.toObject();
    
    // If wallet has a bank account, provide a masked version for UI display
    if (walletObj.bankAccount) {
      try {
        const originalAccount = detokenize(walletObj.bankAccount);
        walletObj.maskedBankAccount = maskData(originalAccount);
      } catch (error) {
        console.error('Error detokenizing bank account:', error);
        walletObj.maskedBankAccount = '****';
      }
    }

    res.json(walletObj);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/wallet/:id
// @desc    Delete wallet
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let wallet = await Wallet.findById(req.params.id);

    // Check if wallet exists
    if (!wallet) return res.status(404).json({ msg: 'Wallet not found' });

    // Make sure user owns wallet
    if (wallet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Delete all transactions associated with this wallet
    await Transaction.deleteMany({ wallet: req.params.id });

    // Delete the wallet
    await Wallet.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Wallet and associated transactions removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const plaidClient = require('../config/plaidConfig');
const { Products } = require('plaid');

// Models
const User = require('../models/User');
const BankAccount = require('../models/BankAccount');

// @route   POST api/plaid/create-link-token
// @desc    Create a link token to initialize Plaid Link
// @access  Private
router.post('/create-link-token', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Create a link token with configs
    const tokenResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: req.user.id,
      },
      client_name: 'Finance App',
      products: [Products.Transactions],
      country_codes: ['US'],
      language: 'en',
    });

    return res.json(tokenResponse.data);
  } catch (err) {
    console.error('Error creating link token:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/plaid/exchange-token
// @desc    Exchange public token for access token and store bank account info
// @access  Private
router.post('/exchange-token', auth, async (req, res) => {
  try {
    const { public_token, metadata } = req.body;

    // Exchange the public token for an access token
    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    
    const access_token = tokenResponse.data.access_token;
    const item_id = tokenResponse.data.item_id;
    
    // Get information about the bank account
    const accountsResponse = await plaidClient.accountsGet({
      access_token,
    });
    
    const accounts = accountsResponse.data.accounts;
    const institution_id = metadata.institution.id;
    
    // Get details about the institution
    const instResponse = await plaidClient.institutionsGetById({
      institution_id,
      country_codes: ['US'],
    });

    const institution_name = instResponse.data.institution.name;
    
    // Store the access token and account info in your database
    for (const account of accounts) {
      // Check if account already exists
      let existingAccount = await BankAccount.findOne({
        user: req.user.id,
        plaidAccountId: account.account_id,
      });
      
      if (existingAccount) {
        // Update existing account
        existingAccount.accessToken = access_token;
        existingAccount.itemId = item_id;
        existingAccount.institutionId = institution_id;
        existingAccount.institutionName = institution_name;
        existingAccount.accountName = account.name;
        existingAccount.accountType = account.type;
        existingAccount.accountSubtype = account.subtype;
        existingAccount.mask = account.mask;
        await existingAccount.save();
      } else {
        // Create new account
        const newAccount = new BankAccount({
          user: req.user.id,
          accessToken: access_token,
          itemId: item_id,
          plaidAccountId: account.account_id,
          institutionId: institution_id,
          institutionName: institution_name,
          accountName: account.name,
          accountType: account.type,
          accountSubtype: account.subtype,
          mask: account.mask,
        });
        
        await newAccount.save();
      }
    }
    
    return res.status(200).json({ msg: 'Bank account linked successfully' });
  } catch (err) {
    console.error('Error exchanging token:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/plaid/accounts
// @desc    Get all linked bank accounts for user
// @access  Private
router.get('/accounts', auth, async (req, res) => {
  try {
    const accounts = await BankAccount.find({ user: req.user.id });
    
    const formattedAccounts = accounts.map(account => ({
      id: account._id,
      bankName: account.institutionName,
      accountName: account.accountName,
      accountNumber: account.mask,
      accountType: account.accountType,
      createdAt: account.createdAt,
    }));
    
    return res.json(formattedAccounts);
  } catch (err) {
    console.error('Error fetching accounts:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE api/plaid/accounts/:id
// @desc    Remove a bank account
// @access  Private
router.delete('/accounts/:id', auth, async (req, res) => {
  try {
    const account = await BankAccount.findById(req.params.id);
    
    if (!account) {
      return res.status(404).json({ msg: 'Account not found' });
    }
    
    // Make sure account belongs to user
    if (account.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await account.deleteOne();
    
    return res.json({ msg: 'Account removed' });
  } catch (err) {
    console.error('Error removing account:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 
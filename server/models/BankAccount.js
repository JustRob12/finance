const mongoose = require('mongoose');

const BankAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  plaidAccountId: {
    type: String,
    required: true
  },
  institutionId: {
    type: String,
    required: true
  },
  institutionName: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    required: true
  },
  accountSubtype: {
    type: String
  },
  mask: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('bankAccount', BankAccountSchema); 
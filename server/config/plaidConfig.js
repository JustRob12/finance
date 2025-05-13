const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

// Initialize the Plaid client
// NOTE: These should be environment variables in production
const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': '6822e1fce7c0ba00230a1447',
      'PLAID-SECRET': 'ee659abfc85b20ea6bf0c9595e4486',
    },
  },
});

const plaidClient = new PlaidApi(configuration);

module.exports = plaidClient; 
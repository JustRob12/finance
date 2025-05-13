const crypto = require('crypto');

// Encryption key and initialization vector should be stored securely in environment variables
// For demonstration purposes, we're hardcoding them here
// Make sure the key is exactly 32 bytes (256 bits) for AES-256
const ENCRYPTION_KEY = crypto.scryptSync('your-secure-password', 'salt', 32);
const IV_LENGTH = 16; // For AES, this is always 16 bytes

/**
 * Tokenize sensitive data (e.g., bank account numbers)
 * @param {string} data - The sensitive data to tokenize
 * @returns {string} - The tokenized data
 */
const tokenize = (data) => {
  if (!data) return '';
  
  try {
    // Create a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher using the encryption key and iv
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    
    // Encrypt the data
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Return iv + encrypted data as base64 string (this is the token)
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Tokenization error:', error);
    return '';
  }
};

/**
 * Detokenize data back to its original form
 * @param {string} token - The tokenized data
 * @returns {string} - The original sensitive data
 */
const detokenize = (token) => {
  if (!token) return '';
  
  try {
    // Split the token into iv and encrypted data
    const parts = token.split(':');
    if (parts.length !== 2) return '';
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    
    // Create decipher using the encryption key and iv
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error('Detokenization error:', error);
    return '';
  }
};

/**
 * Create a masked version of the sensitive data for display
 * @param {string} data - The sensitive data to mask
 * @returns {string} - The masked data
 */
const maskData = (data) => {
  if (!data || data.length < 4) return '';
  
  // Only show the last 4 characters, mask the rest
  const lastFour = data.slice(-4);
  const maskedPart = '*'.repeat(data.length - 4);
  
  return maskedPart + lastFour;
};

module.exports = {
  tokenize,
  detokenize,
  maskData
}; 
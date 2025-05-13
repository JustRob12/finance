import { useState, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';

interface PlaidLinkButtonProps {
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit?: (error: any, metadata: any) => void;
  className?: string;
}

const PlaidLinkButton = ({ onSuccess, onExit, className = '' }: PlaidLinkButtonProps) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get a link token from the server when the component mounts
  const generateToken = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/plaid/create-link-token');
      setLinkToken(response.data.link_token);
      setLoading(false);
    } catch (error) {
      console.error('Error creating link token:', error);
      setError('Failed to connect to bank service. Please try again later.');
      setLoading(false);
    }
  }, []);

  // Configure the Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkToken || '',
    onSuccess: (public_token, metadata) => {
      onSuccess(public_token, metadata);
      setLinkToken(null); // Reset the token after success
    },
    onExit: (err, metadata) => {
      setLinkToken(null); // Reset the token after exit
      if (onExit) {
        onExit(err, metadata);
      }
    },
  });

  // Open Plaid Link when the button is clicked
  const handleClick = () => {
    if (linkToken) {
      open();
    } else {
      generateToken();
    }
  };

  return (
    <div>
      <button 
        onClick={handleClick} 
        disabled={loading || (!!linkToken && !ready)} 
        className={`plaid-link-button ${className}`}
      >
        {loading ? 'Connecting...' : 'Connect Bank Account'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default PlaidLinkButton; 
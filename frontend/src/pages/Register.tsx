import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import GoogleSignIn from '../components/GoogleSignIn';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const { name, email, password, passwordConfirm } = formData;
  const { register, isAuthenticated, error } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== passwordConfirm) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setPasswordError('');
    await register(name, email, password);
  };

  return (
    <div className="register-container">
      <h1>Register</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            minLength={6}
          />
        </div>
        <div className="form-group">
          <label htmlFor="passwordConfirm">Confirm Password</label>
          <input
            type="password"
            name="passwordConfirm"
            value={passwordConfirm}
            onChange={onChange}
            required
            minLength={6}
          />
        </div>
        {passwordError && <div className="error-message">{passwordError}</div>}
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="btn-primary">
          Register
        </button>
      </form>
      
      <div className="or-divider">
        <span>OR</span>
      </div>
      
      <div className="social-login">
        <GoogleSignIn />
      </div>
      
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register; 
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
const GoogleUser = require('../models/GoogleUser');

// Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Google Sign-In
router.post('/google', async (req, res) => {
  const { userData } = req.body;
  
  if (!userData || !userData.id) {
    return res.status(400).json({ message: 'Invalid user data provided' });
  }
  
  try {
    console.log('Received Google user data:', JSON.stringify(userData));
    
    // Check if Google user already exists
    let googleUser = await GoogleUser.findOne({ googleId: userData.id });
    
    if (googleUser) {
      // Update last login time
      googleUser.lastLogin = Date.now();
      await googleUser.save();
    } else {
      // Create a new Google user
      googleUser = new GoogleUser({
        googleId: userData.id,
        name: userData.name || 'Google User',
        email: userData.email || '',
        photoURL: userData.photoURL || ''
      });
      
      await googleUser.save();
      console.log('New Google user saved:', googleUser);
    }
    
    // Also check if user exists in the regular User collection
    let user = await User.findOne({ email: userData.email });
    
    if (!user) {
      // Create a regular user too with a random password
      const randomPassword = '!GoogleAuth!' + Math.random().toString(36).slice(-8);
      
      user = new User({
        name: userData.name || 'Google User',
        email: userData.email || '',
        password: randomPassword,
        photoURL: userData.photoURL || ''
      });
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(randomPassword, salt);
      
      await user.save();
    }
    
    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        googleId: googleUser.googleId
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: googleUser.name,
            email: googleUser.email,
            photoURL: googleUser.photoURL
          }
        });
      }
    );
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(500).send('Server error');
  }
});

// Get Google user data
router.get('/google-user/:id', auth, async (req, res) => {
  try {
    const googleUser = await GoogleUser.findOne({ googleId: req.params.id });
    
    if (!googleUser) {
      return res.status(404).json({ message: 'Google user not found' });
    }
    
    res.json({
      googleUser: {
        id: googleUser.googleId,
        name: googleUser.name,
        email: googleUser.email,
        photoURL: googleUser.photoURL,
        lastLogin: googleUser.lastLogin,
        createdAt: googleUser.createdAt
      }
    });
  } catch (err) {
    console.error('Error fetching Google user:', err.message);
    res.status(500).send('Server error');
  }
});

// Get all Google users (admin only - for demonstration)
router.get('/google-users', auth, async (req, res) => {
  try {
    const googleUsers = await GoogleUser.find().sort({ lastLogin: -1 });
    
    res.json({
      count: googleUsers.length,
      googleUsers: googleUsers.map(user => ({
        id: user.googleId,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }))
    });
  } catch (err) {
    console.error('Error fetching Google users:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 
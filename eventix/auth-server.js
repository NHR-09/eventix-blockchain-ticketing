const express = require('express');
const cors = require('cors');
const { db, bcrypt } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.query(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }
        res.json({ success: true, userId: result.insertId });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = results[0];
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          wallet_address: user.wallet_address,
          city: user.city
        }
      });
    }
  );
});

// Update user profile
app.put('/api/user/:id', (req, res) => {
  const { id } = req.params;
  const { wallet_address, city } = req.body;
  
  db.query(
    'UPDATE users SET wallet_address = ?, city = ? WHERE id = ?',
    [wallet_address, city, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Update failed' });
      }
      res.json({ success: true });
    }
  );
});

app.listen(3000, () => {
  console.log('Auth server running on port 3000');
});
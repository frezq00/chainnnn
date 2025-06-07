const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Favorites table
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_address TEXT NOT NULL,
      chain_id TEXT NOT NULL,
      token_name TEXT,
      token_symbol TEXT,
      token_logo TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(user_id, token_address, chain_id)
    )
  `);

  // Create default admin user
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`
    INSERT OR IGNORE INTO users (username, email, password, role)
    VALUES ('admin', 'admin@dexterminal.com', ?, 'admin')
  `, [adminPassword]);
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Username or email already exists' });
          }
          return res.status(500).json({ message: 'Error creating user' });
        }

        const token = jwt.sign(
          { id: this.lastID, username, email, role: 'user' },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.status(201).json({
          token,
          user: { id: this.lastID, username, email, role: 'user' }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ message: 'Server error' });
        }

        if (!user) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: user.id, username: user.username, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({
          token,
          user: { 
            id: user.id, 
            username: user.username, 
            email: user.email, 
            role: user.role 
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json(req.user);
});

// Favorites routes
app.get('/api/favorites', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, favorites) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching favorites' });
      }
      res.json(favorites);
    }
  );
});

app.post('/api/favorites/add', authenticateToken, (req, res) => {
  const { tokenAddress, chainId, tokenName, tokenSymbol, tokenLogo } = req.body;

  db.run(
    `INSERT OR IGNORE INTO favorites 
     (user_id, token_address, chain_id, token_name, token_symbol, token_logo) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, tokenAddress, chainId, tokenName, tokenSymbol, tokenLogo],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error adding favorite' });
      }
      res.json({ message: 'Added to favorites', id: this.lastID });
    }
  );
});

app.post('/api/favorites/remove', authenticateToken, (req, res) => {
  const { tokenAddress, chainId } = req.body;

  db.run(
    'DELETE FROM favorites WHERE user_id = ? AND token_address = ? AND chain_id = ?',
    [req.user.id, tokenAddress, chainId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error removing favorite' });
      }
      res.json({ message: 'Removed from favorites' });
    }
  );
});

app.post('/api/favorites/check', authenticateToken, (req, res) => {
  const { tokenAddress, chainId } = req.body;

  db.get(
    'SELECT id FROM favorites WHERE user_id = ? AND token_address = ? AND chain_id = ?',
    [req.user.id, tokenAddress, chainId],
    (err, favorite) => {
      if (err) {
        return res.status(500).json({ message: 'Error checking favorite' });
      }
      res.json({ isFavorite: !!favorite });
    }
  );
});

// Admin routes
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  db.all(
    'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC',
    (err, users) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching users' });
      }
      res.json(users);
    }
  );
});

app.get('/api/admin/favorites', authenticateToken, requireAdmin, (req, res) => {
  db.all(
    `SELECT f.*, u.username 
     FROM favorites f 
     JOIN users u ON f.user_id = u.id 
     ORDER BY f.created_at DESC`,
    (err, favorites) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching favorites' });
      }
      res.json(favorites);
    }
  );
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const userId = req.params.id;

  if (userId == req.user.id) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }

  db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting user' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

app.put('/api/admin/users/:id/role', authenticateToken, requireAdmin, (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  if (userId == req.user.id) {
    return res.status(400).json({ message: 'Cannot change your own role' });
  }

  db.run('UPDATE users SET role = ? WHERE id = ?', [role, userId], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error updating user role' });
    }
    res.json({ message: 'User role updated successfully' });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${dbPath}`);
  console.log('Default admin credentials: admin@dexterminal.com / admin123');
});
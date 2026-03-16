'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || '*',
    methods: ['GET', 'POST'],
  })
);

app.use(express.json({ limit: '10kb' })); // Limit payload size

// ── Static Files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Database Setup ────────────────────────────────────────────────────────────
const db = new sqlite3.Database(
  path.join(__dirname, 'leaderboard.db'),
  (err) => {
    if (err) {
      console.error('Failed to connect to database:', err.message);
    } else {
      console.log('Connected to SQLite database.');
    }
  }
);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      name    TEXT    NOT NULL,
      score   INTEGER NOT NULL,
      rolls   INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// ── Input Validators ─────────────────────────────────────────────────────────
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>"']/g, '').slice(0, 30);
}

function isValidScore(n) {
  return Number.isInteger(n) && n >= 0 && n <= 10000;
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/leaderboard — top 10 scores
app.get('/api/leaderboard', (req, res) => {
  db.all(
    'SELECT name, score, rolls FROM leaderboard ORDER BY score DESC, rolls ASC LIMIT 10',
    [],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Failed to retrieve leaderboard.' });
      }
      res.json(rows);
    }
  );
});

// POST /api/leaderboard — submit a new score
app.post('/api/leaderboard', (req, res) => {
  const name = sanitizeString(req.body.name) || 'Anonymous';
  const score = req.body.score;
  const rolls = req.body.rolls;

  if (!isValidScore(score) || !isValidScore(rolls)) {
    return res.status(400).json({ error: 'Invalid score or roll count.' });
  }

  // Parameterized query — prevents SQL Injection
  db.run(
    'INSERT INTO leaderboard (name, score, rolls) VALUES (?, ?, ?)',
    [name, score, rolls],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Failed to save score.' });
      }
      res.status(201).json({ id: this.lastID, name, score, rolls });
    }
  );
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🎲 Pig Game server running on http://localhost:${PORT}`);
});

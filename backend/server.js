import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Low, JSONFile } from 'lowdb';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Low(new JSONFile(path.resolve(__dirname, '../db.json')));
await db.read();
db.data = db.data || { fighters: [] };

const app = express();
app.use(bodyParser.json());

// Simple JWT Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// GET all fighters
app.get('/api/fighters', async (req, res) => {
  await db.read();
  res.json(db.data.fighters);
});

// GET a single fighter
app.get('/api/fighters/:id', async (req, res) => {
  await db.read();
  const fighter = db.data.fighters.find(f => f.id == req.params.id);
  if (fighter) res.json(fighter);
  else res.sendStatus(404);
});

// CREATE a fighter (auth required)
app.post('/api/fighters', authenticateToken, async (req, res) => {
  await db.read();
  db.data.fighters.push(req.body);
  await db.write();
  res.status(201).json(req.body);
});

// UPDATE a fighter (auth required)
app.put('/api/fighters/:id', authenticateToken, async (req, res) => {
  await db.read();
  const idx = db.data.fighters.findIndex(f => f.id == req.params.id);
  if (idx === -1) return res.sendStatus(404);
  db.data.fighters[idx] = { ...db.data.fighters[idx], ...req.body };
  await db.write();
  res.json(db.data.fighters[idx]);
});

// DELETE a fighter (auth required)
app.delete('/api/fighters/:id', authenticateToken, async (req, res) => {
  await db.read();
  const idx = db.data.fighters.findIndex(f => f.id == req.params.id);
  if (idx === -1) return res.sendStatus(404);
  db.data.fighters.splice(idx, 1);
  await db.write();
  res.sendStatus(204);
});

// Simple login endpoint for demo (returns JWT)
app.post('/api/login', (req, res) => {
  const { username } = req.body;
  // In production, check password and user DB!
  const user = { name: username };
  const token = jwt.sign(user, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  res.json({ token });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

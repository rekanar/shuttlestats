'use strict';

const express = require('express');
const cors = require('cors');
const fixturesRouter = require('./routes/fixtures');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:5175', 'http://127.0.0.1:5175', 'http://localhost:5176', 'http://127.0.0.1:5176', 'http://192.168.0.148:5173', 'http://192.168.0.148:5175', 'http://192.168.0.148:5176'] }));
app.use(express.json());

app.use('/api/fixtures', fixturesRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'ShuttleIQ API' }));

// Error handler
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ShuttleIQ API running on http://localhost:${PORT}`);
  console.log(`Network access: http://192.168.0.148:${PORT}`);
});

module.exports = app;

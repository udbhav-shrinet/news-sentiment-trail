// server.js
// Express development & production server

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// API Routes (wrapping serverless handlers)
const analyzeHandler = require('./api/analyze');
const trailHandler = require('./api/trail');
const batchHandler = require('./api/batch');
const compareHandler = require('./api/compare');

app.all('/api/analyze', (req, res) => analyzeHandler(req, res));
app.all('/api/trail', (req, res) => trailHandler(req, res));
app.all('/api/batch', (req, res) => batchHandler(req, res));
app.all('/api/compare', (req, res) => compareHandler(req, res));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Fallback to index.html for SPA routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`News Sentiment & Trail platform running on http://localhost:${PORT}`);
  });
}

module.exports = app;

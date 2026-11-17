// api/trail.js
// Serverless handler for live topic/entity news trails

const { getLiveNewsTrail } = require('../shared/newsTrailFetcher');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let query = '';
    let limit = 8;

    if (req.method === 'POST') {
      query = req.body?.query || req.body?.topic || req.body?.q || '';
      limit = parseInt(req.body?.limit, 10) || 8;
    } else {
      query = req.query?.query || req.query?.topic || req.query?.q || '';
      limit = parseInt(req.query?.limit, 10) || 8;
    }

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Please provide a query or entity to search news trail.' });
    }

    const trail = await getLiveNewsTrail(query.trim(), limit);

    // Compute trail aggregates
    const total = trail.length;
    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;
    let avgScore = 0;

    trail.forEach(item => {
      if (item.sentiment === 'POS') posCount++;
      else if (item.sentiment === 'NEG') negCount++;
      else neuCount++;
      avgScore += item.score;
    });

    const summary = {
      total,
      breakdown: {
        POS: total ? Math.round((posCount / total) * 100) : 0,
        NEU: total ? Math.round((neuCount / total) * 100) : 0,
        NEG: total ? Math.round((negCount / total) * 100) : 0
      },
      counts: { POS: posCount, NEU: neuCount, NEG: negCount },
      avgConfidence: total ? Math.round((avgScore / total) * 100) / 100 : 0,
      dominantSentiment: posCount > negCount && posCount > neuCount ? 'POS' : (negCount > posCount && negCount > neuCount ? 'NEG' : 'NEU')
    };

    return res.status(200).json({
      success: true,
      query: query.trim(),
      summary,
      trail
    });
  } catch (error) {
    console.error('API trail error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

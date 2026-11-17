// api/batch.js
// Batch sentiment analysis for multiple news titles (mimicking the notebook's Excel column processing)

const { analyzeHeadlineSentiment } = require('../shared/sentimentEngine');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const headlines = req.body?.headlines || req.body?.texts || [];

    if (!Array.isArray(headlines) || headlines.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of headlines under "headlines".' });
    }

    // Limit to 500 items per batch for responsiveness
    const clamped = headlines.slice(0, 500);

    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;
    let totalScore = 0;

    const results = clamped.map((item, index) => {
      const text = typeof item === 'string' ? item : (item.title || item.Title || '');
      const s = analyzeHeadlineSentiment(text);

      if (s.label === 'POS') posCount++;
      else if (s.label === 'NEG') negCount++;
      else neuCount++;
      totalScore += s.score;

      return {
        id: index + 1,
        title: text,
        sentiment: s.label,
        score: s.score,
        probabilities: s.probabilities,
        market_impact: s.market_impact,
        polarity: s.polarity,
        entities: s.entities
      };
    });

    const total = results.length;
    const summary = {
      total,
      counts: { POS: posCount, NEU: neuCount, NEG: negCount },
      distribution: {
        POS: total ? Math.round((posCount / total) * 100) : 0,
        NEU: total ? Math.round((neuCount / total) * 100) : 0,
        NEG: total ? Math.round((negCount / total) * 100) : 0
      },
      avgScore: total ? Math.round((totalScore / total) * 1000) / 1000 : 0
    };

    return res.status(200).json({
      success: true,
      summary,
      results
    });
  } catch (error) {
    console.error('API batch error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

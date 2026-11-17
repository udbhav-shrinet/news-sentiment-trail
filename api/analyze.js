// api/analyze.js
// Serverless handler for single headline analysis + narrative ripple trail generation

const { analyzeHeadlineSentiment, generateRippleTrail } = require('../shared/sentimentEngine');
const { getLiveNewsTrail } = require('../shared/newsTrailFetcher');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let headline = '';
    if (req.method === 'POST') {
      headline = req.body?.headline || req.body?.title || '';
    } else {
      headline = req.query?.headline || req.query?.q || '';
    }

    if (!headline || !headline.trim()) {
      return res.status(400).json({ error: 'Please provide a news headline or title to analyze.' });
    }

    const cleanHeadline = headline.trim();
    const sentiment = analyzeHeadlineSentiment(cleanHeadline);
    const rippleTrail = generateRippleTrail(cleanHeadline, sentiment);

    // Find main entity for live related search
    let searchEntity = '';
    const org = sentiment.entities.find(e => e.type === 'Organization');
    const subj = sentiment.entities.find(e => e.type === 'Subject/Entity');
    if (org) searchEntity = org.text;
    else if (subj) searchEntity = subj.text;
    else {
      // Pick first 3-4 significant words
      searchEntity = cleanHeadline.split(/\s+/).slice(0, 3).join(' ');
    }

    let liveRelated = [];
    if (searchEntity && searchEntity.length > 2) {
      try {
        liveRelated = await getLiveNewsTrail(searchEntity, 6);
      } catch (e) {
        liveRelated = [];
      }
    }

    return res.status(200).json({
      success: true,
      headline: cleanHeadline,
      sentiment,
      rippleTrail,
      liveRelatedTrail: liveRelated,
      searchEntity
    });
  } catch (error) {
    console.error('API analyze error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

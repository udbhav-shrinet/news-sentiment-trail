// api/compare.js
// Headline Battle: Side-by-side comparison of 2 headlines

const { analyzeHeadlineSentiment } = require('../shared/sentimentEngine');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const headlineA = req.body?.headlineA || req.query?.headlineA || '';
    const headlineB = req.body?.headlineB || req.query?.headlineB || '';

    if (!headlineA || !headlineB) {
      return res.status(400).json({ error: 'Please provide both headlineA and headlineB to compare.' });
    }

    const sentimentA = analyzeHeadlineSentiment(headlineA);
    const sentimentB = analyzeHeadlineSentiment(headlineB);

    const deltaPolarity = Math.round((sentimentA.polarity - sentimentB.polarity) * 100) / 100;
    const deltaConfidence = Math.round((sentimentA.score - sentimentB.score) * 100) / 100;

    let slantAssessment = 'Both headlines share similar sentiment and tone.';
    if (sentimentA.label !== sentimentB.label) {
      slantAssessment = `Significant editorial divergence: Headline A is classified as ${sentimentA.label} (${sentimentA.market_impact}) while Headline B is ${sentimentB.label} (${sentimentB.market_impact}).`;
    } else if (Math.abs(deltaPolarity) > 0.25) {
      slantAssessment = `Headlines share ${sentimentA.label} classification but diverge substantially in emotional intensity and vocabulary stance.`;
    }

    return res.status(200).json({
      success: true,
      analysisA: {
        headline: headlineA,
        sentiment: sentimentA
      },
      analysisB: {
        headline: headlineB,
        sentiment: sentimentB
      },
      comparison: {
        deltaPolarity,
        deltaConfidence,
        slantAssessment,
        higherConfidence: sentimentA.score >= sentimentB.score ? 'A' : 'B'
      }
    });
  } catch (error) {
    console.error('API compare error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

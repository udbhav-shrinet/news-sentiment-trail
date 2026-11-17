// shared/newsTrailFetcher.js
// Fetches real live news trails via Google News RSS and classifies every item in the trail.

const https = require('https');
const { analyzeHeadlineSentiment } = require('./sentimentEngine');

function fetchUrl(url, timeoutMs = 7000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: timeoutMs
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        return fetchUrl(res.headers.location, timeoutMs).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function parseRssXml(xmlText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemBlock = match[1];

    const titleMatch = itemBlock.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = itemBlock.match(/<link>([\s\S]*?)<\/link>/i);
    const pubDateMatch = itemBlock.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const sourceMatch = itemBlock.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

    let title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : '';
    let link = linkMatch ? linkMatch[1].trim() : '';
    let pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';
    let source = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : '';

    // If source isn't separated, extract from "Headline - Publisher Name"
    if (!source && title.includes(' - ')) {
      const parts = title.split(' - ');
      source = parts.pop().trim();
      title = parts.join(' - ').trim();
    }

    // Decode HTML entities
    title = title
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    if (title && title.length > 5) {
      items.push({ title, link, pubDate, source: source || 'News Desk' });
    }
  }

  return items;
}

async function getLiveNewsTrail(query, limit = 8) {
  if (!query) return [];

  const cleanQ = query.replace(/[^\w\s$]/gi, ' ').trim();
  const encoded = encodeURIComponent(cleanQ);
  const rssUrl = `https://news.google.com/rss/search?q=${encoded}&hl=en-IN&gl=IN&ceid=IN:en`;

  try {
    const xml = await fetchUrl(rssUrl);
    const rawItems = parseRssXml(xml);

    // Deduplicate similar titles
    const seenTitles = new Set();
    const uniqueItems = [];
    for (const item of rawItems) {
      const norm = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenTitles.has(norm)) {
        seenTitles.add(norm);
        uniqueItems.push(item);
      }
      if (uniqueItems.length >= limit) break;
    }

    // Classify each news item
    const classified = uniqueItems.map((item, idx) => {
      const sentiment = analyzeHeadlineSentiment(item.title);
      return {
        id: idx + 1,
        title: item.title,
        source: item.source,
        link: item.link,
        pubDate: item.pubDate,
        sentiment: sentiment.label,
        score: sentiment.score,
        probabilities: sentiment.probabilities,
        market_impact: sentiment.market_impact,
        polarity: sentiment.polarity,
        entities: sentiment.entities
      };
    });

    return classified;
  } catch (err) {
    console.warn('Could not fetch live RSS trail:', err.message);
    return [];
  }
}

module.exports = {
  getLiveNewsTrail,
  parseRssXml
};

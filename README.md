# NewsPulse Trail ⚡

> Real-Time News Headline Sentiment Classifier & Narrative Ripple Tracker based on Hugging Face BERTweet (`finiteautomata/bertweet-base-sentiment-analysis`).

Derived from the Jupyter Notebook `Final_sentiment_classification(hf).ipynb` that classified 1,996 climate/tech news headlines.

---

## 🌟 Key Capabilities

1. **Single Headline Sentiment & Diagnostics:**
   - Input any news headline or breaking story.
   - Computes **POS** (Positive), **NEU** (Neutral), **NEG** (Negative) classifications.
   - Outputs confidence score + full softmax probability spectrum (`POS %`, `NEU %`, `NEG %`).
   - Diagnostic metrics: Polarity (-1.0 to +1.0), Subjectivity, Market Momentum (Bullish/Bearish/Sideways), and Corporate Entity Extraction.

2. **The Signature "News Trail with Sentiment" (Core Feature):**
   - **Narrative Ripple Timeline:** Models the 5-phase ripple effect that follows any news event:
     1. Breaking Catalyst (Day 0)
     2. Market & Investor Absorption (+12h-24h)
     3. Due Diligence & Counter-Scrutiny (+3d-5d)
     4. Competitive & Ecosystem Ripple (+1w-2w)
     5. Institutional Consensus (+1 Month)
   - **Live Authentic News Trail:** Dynamically queries Google News RSS for the detected entities, retrieves actual related articles, and runs the sentiment pipeline on every item in the trail with source links and publication dates.
   - **Interactive Waveform Trajectory:** Dynamic SVG curve mapping sentiment momentum across all trail nodes.

3. **Colab Notebook Batch Processor:**
   - Paste hundreds of headlines or load pre-extracted samples from `Final_sentiment_classification(hf).ipynb`.
   - Generates interactive data tables with search, filter, and distribution statistics.
   - One-click CSV export with `Sentiment` and `Sentiment_Score` columns.

4. **Headline Slant Battle:**
   - Compare two competing headlines side-by-side to expose editorial bias and sentiment divergence.

---

## 🚀 Local Development

```bash
npm install
npm start
# Opens on http://localhost:3000
```

---

## ☁️ Vercel Deployment

Deployable instantly on Vercel:

```bash
vercel deploy --prod
```

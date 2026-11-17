// public/app.js - NewsPulse Trail Client Application

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Tab 1
  const headlineInput = document.getElementById('headline-input');
  const btnAnalyze = document.getElementById('btn-analyze');
  const loadingState = document.getElementById('loading-state');
  const resultsView = document.getElementById('results-view');
  const cardHeadlineText = document.getElementById('card-headline-text');
  const cardBadge = document.getElementById('card-badge');
  const cardBadgeText = document.getElementById('card-badge-text');
  const cardScoreNum = document.getElementById('card-score-num');
  
  const probPosVal = document.getElementById('prob-pos-val');
  const probPosBar = document.getElementById('prob-pos-bar');
  const probNeuVal = document.getElementById('prob-neu-val');
  const probNeuBar = document.getElementById('prob-neu-bar');
  const probNegVal = document.getElementById('prob-neg-val');
  const probNegBar = document.getElementById('prob-neg-bar');

  const diagMarket = document.getElementById('diag-market');
  const diagPolarity = document.getElementById('diag-polarity');
  const diagTone = document.getElementById('diag-tone');
  const diagSubj = document.getElementById('diag-subj');
  const entitiesContainer = document.getElementById('entities-container');

  const trailNodesWrap = document.getElementById('trail-nodes-wrap');
  const btnModeRipple = document.getElementById('btn-mode-ripple');
  const btnModeLive = document.getElementById('btn-mode-live');
  const wavePath = document.getElementById('wave-path');

  // DOM Elements - Tab 2 (Live Search)
  const liveQueryInput = document.getElementById('live-query-input');
  const btnSearchLive = document.getElementById('btn-search-live');
  const liveSummaryBar = document.getElementById('live-summary-bar');
  const liveResultsWrap = document.getElementById('live-results-wrap');
  const liveSumTotal = document.getElementById('live-sum-total');
  const liveSumPos = document.getElementById('live-sum-pos');
  const liveSumNeu = document.getElementById('live-sum-neu');
  const liveSumNeg = document.getElementById('live-sum-neg');

  // DOM Elements - Tab 3 (Batch)
  const batchTextarea = document.getElementById('batch-textarea');
  const btnRunBatch = document.getElementById('btn-run-batch');
  const btnLoadColabSample = document.getElementById('btn-load-colab-sample');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnClearBatch = document.getElementById('btn-clear-batch');
  const batchResultsWrap = document.getElementById('batch-results-wrap');
  const batchTableBody = document.getElementById('batch-table-body');
  const batchCountBadge = document.getElementById('batch-count-badge');
  const batchStatPos = document.getElementById('batch-stat-pos');
  const batchStatNeu = document.getElementById('batch-stat-neu');
  const batchStatNeg = document.getElementById('batch-stat-neg');

  // DOM Elements - Tab 4 (Compare)
  const compareInputA = document.getElementById('compare-input-a');
  const compareInputB = document.getElementById('compare-input-b');
  const btnRunCompare = document.getElementById('btn-run-compare');
  const compareResultsView = document.getElementById('compare-results-view');
  const compareVerdictText = document.getElementById('compare-verdict-text');
  const compareDetailsGrid = document.getElementById('compare-details-grid');

  // State
  let currentAnalysisData = null;
  let currentTrailMode = 'ripple'; // 'ripple' | 'live'
  let currentBatchData = [];

  // Sample headlines directly extracted from the user's notebook
  const COLAB_NOTEBOOK_SAMPLES = [
    "Alt Carbon scores $12M seed to scale carbon removal",
    "Alt Carbon",
    "India-Based Climate Tech Startup Alt Carbon Raises Seed Round",
    "Alt Carbon Raises $12 Mn To Fuel Carbon Removal Technology",
    "Mitsubishi Corporation And Alt Carbon To Scale Carbon Removal",
    "Startup, Alt Carbon: Accelerated Weathering Challenges Ahead",
    "Microsoft taps Alt Carbon in sign of India’s growing role in carbon removal",
    "Microsoft to purchase 36,920 tons of carbon removal credits from Alt Carbon",
    "Mati Carbon: Empowering Smallholder Farmers Through ERW",
    "Mati Carbon Wins $50 Million Prize for Boosting Yields",
    "JPMorgan Backs Mati Carbon to Scale ERW Carbon Removal",
    "Varaha Raises Project Investment from UK-Based Climate Fund",
    "Varaha signs major offtake agreement with Microsoft",
    "Microsoft Partners with Varaha for Carbon Removal Offtake",
    "Varaha locks in a $30M investment from Mirova to expand projects"
  ];

  // Tab Navigation Handling
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.style.display = 'none');

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.style.display = 'block';
      }
    });
  });

  // Preset Chips
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-text');
      headlineInput.value = text;
      runAnalysis(text);
    });
  });

  // Analyze Headline Action
  btnAnalyze.addEventListener('click', () => {
    const text = headlineInput.value.trim();
    if (text) {
      runAnalysis(text);
    }
  });

  headlineInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const text = headlineInput.value.trim();
      if (text) runAnalysis(text);
    }
  });

  async function runAnalysis(headline) {
    loadingState.style.display = 'block';
    resultsView.style.opacity = '0.4';

    try {
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline })
      });

      if (!resp.ok) {
        throw new Error(`Server returned HTTP ${resp.status}`);
      }

      const data = await resp.json();
      currentAnalysisData = data;
      renderAnalysis(data);
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Analysis request failed. Please check network connection.');
    } finally {
      loadingState.style.display = 'none';
      resultsView.style.opacity = '1';
    }
  }

  function renderAnalysis(data) {
    const { headline, sentiment, rippleTrail, liveRelatedTrail } = data;

    // Display Headline
    cardHeadlineText.textContent = `"${headline}"`;

    // Sentiment Badge & Score
    const label = sentiment.label; // 'POS' | 'NEU' | 'NEG'
    cardBadge.className = `sentiment-badge ${label}`;
    cardBadgeText.textContent = label === 'POS' ? 'POSITIVE' : (label === 'NEG' ? 'NEGATIVE' : 'NEUTRAL');
    cardScoreNum.textContent = `${(sentiment.score * 100).toFixed(1)}%`;

    // Softmax probabilities
    const probs = sentiment.probabilities;
    probPosVal.textContent = `${(probs.POS * 100).toFixed(1)}%`;
    probPosBar.style.width = `${(probs.POS * 100).toFixed(1)}%`;

    probNeuVal.textContent = `${(probs.NEU * 100).toFixed(1)}%`;
    probNeuBar.style.width = `${(probs.NEU * 100).toFixed(1)}%`;

    probNegVal.textContent = `${(probs.NEG * 100).toFixed(1)}%`;
    probNegBar.style.width = `${(probs.NEG * 100).toFixed(1)}%`;

    // Diagnostics
    diagMarket.textContent = sentiment.market_impact;
    if (label === 'POS') diagMarket.style.color = 'var(--pos-color)';
    else if (label === 'NEG') diagMarket.style.color = 'var(--neg-color)';
    else diagMarket.style.color = 'var(--neu-color)';

    diagPolarity.textContent = (sentiment.polarity >= 0 ? '+' : '') + sentiment.polarity.toFixed(2);
    diagTone.textContent = sentiment.tone;
    diagSubj.textContent = sentiment.subjectivity.toFixed(2);

    // Entities
    entitiesContainer.innerHTML = '';
    if (sentiment.entities && sentiment.entities.length > 0) {
      sentiment.entities.forEach(ent => {
        const pill = document.createElement('span');
        pill.className = 'entity-pill';
        let icon = '🏷️';
        if (ent.type === 'Organization') icon = '🏢';
        else if (ent.type === 'Metric/Capital') icon = '💰';
        else if (ent.type === 'Subject/Entity') icon = '📌';
        pill.textContent = `${icon} ${ent.text}`;
        entitiesContainer.appendChild(pill);
      });
    } else {
      entitiesContainer.innerHTML = '<span style="font-size: 0.75rem; color: var(--text-muted);">Standard descriptive text (no specific corporate entities isolated)</span>';
    }

    // Render Trail
    renderTrailNodes();
  }

  // Trail Switcher
  btnModeRipple.addEventListener('click', () => {
    btnModeRipple.classList.add('active');
    btnModeLive.classList.remove('active');
    currentTrailMode = 'ripple';
    renderTrailNodes();
  });

  btnModeLive.addEventListener('click', () => {
    btnModeLive.classList.add('active');
    btnModeRipple.classList.remove('active');
    currentTrailMode = 'live';
    renderTrailNodes();
  });

  function renderTrailNodes() {
    if (!currentAnalysisData) return;

    trailNodesWrap.innerHTML = '';

    if (currentTrailMode === 'ripple') {
      const trail = currentAnalysisData.rippleTrail || [];
      updateWaveform(trail);

      trail.forEach((node, index) => {
        const card = document.createElement('div');
        card.className = `trail-node ${node.sentiment}`;

        const scorePct = (node.score * 100).toFixed(0);
        card.innerHTML = `
          <div class="node-top">
            <span class="node-time">${node.timeframe}</span>
            <span class="node-pill ${node.sentiment}">${node.sentiment} • ${scorePct}%</span>
          </div>
          <div class="node-title">${escapeHtml(node.headline)}</div>
          <div class="node-desc">${escapeHtml(node.description)}</div>
          <div class="node-foot">
            <span>🏷️ ${escapeHtml(node.impactType)}</span>
            <span>📡 ${escapeHtml(node.source)}</span>
          </div>
        `;
        trailNodesWrap.appendChild(card);
      });
    } else {
      // Live News Mode
      const live = currentAnalysisData.liveRelatedTrail || [];
      if (live.length === 0) {
        trailNodesWrap.innerHTML = `
          <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
            No live Google News RSS items found for this exact entity. Switch back to "Narrative Ripple" view to see the projected narrative timeline.
          </div>
        `;
        return;
      }

      updateWaveform(live);

      live.forEach(item => {
        const card = document.createElement('div');
        card.className = `trail-node ${item.sentiment}`;

        const scorePct = (item.score * 100).toFixed(0);
        card.innerHTML = `
          <div class="node-top">
            <span class="node-time">${item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Recent Wire'}</span>
            <span class="node-pill ${item.sentiment}">${item.sentiment} • ${scorePct}%</span>
          </div>
          <div class="node-title">${escapeHtml(item.title)}</div>
          <div class="node-foot">
            <span>📡 ${escapeHtml(item.source)}</span>
            ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener">Open Source ➔</a>` : ''}
          </div>
        `;
        trailNodesWrap.appendChild(card);
      });
    }
  }

  function updateWaveform(nodes) {
    if (!nodes || nodes.length < 2) {
      wavePath.setAttribute('d', 'M 0,35 L 600,35');
      return;
    }

    // Map sentiments to Y values: POS = 15, NEU = 35, NEG = 55
    const stepX = 600 / (nodes.length - 1);
    const coords = nodes.map((n, i) => {
      const x = i * stepX;
      let y = 35;
      if (n.sentiment === 'POS') y = 15;
      else if (n.sentiment === 'NEG') y = 55;
      return { x, y };
    });

    let d = `M ${coords[0].x},${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx},${prev.y} ${cx},${curr.y} ${curr.x},${curr.y}`;
    }

    wavePath.setAttribute('d', d);
  }

  // TAB 2: Live Search Handler
  btnSearchLive.addEventListener('click', () => {
    const q = liveQueryInput.value.trim();
    if (q) performLiveSearch(q);
  });

  liveQueryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = liveQueryInput.value.trim();
      if (q) performLiveSearch(q);
    }
  });

  async function performLiveSearch(query) {
    liveResultsWrap.innerHTML = `
      <div style="text-align: center; padding: 30px;">
        <div class="spinner"></div>
        <p style="margin-top: 8px; color: var(--text-muted); font-size: 0.85rem;">Querying Google News RSS & running BERTweet sentiment engine...</p>
      </div>
    `;

    try {
      const resp = await fetch(`/api/trail?query=${encodeURIComponent(query)}&limit=10`);
      const data = await resp.json();

      if (!data.success || !data.trail || data.trail.length === 0) {
        liveResultsWrap.innerHTML = `<p style="color: var(--text-muted); padding: 20px;">No recent live articles returned for "${escapeHtml(query)}". Try another company or topic keyword.</p>`;
        liveSummaryBar.style.display = 'none';
        return;
      }

      // Show summary bar
      liveSummaryBar.style.display = 'block';
      liveSumTotal.textContent = data.summary.total;
      liveSumPos.textContent = `${data.summary.breakdown.POS}% (${data.summary.counts.POS})`;
      liveSumNeu.textContent = `${data.summary.breakdown.NEU}% (${data.summary.counts.NEU})`;
      liveSumNeg.textContent = `${data.summary.breakdown.NEG}% (${data.summary.counts.NEG})`;

      // Render cards
      let html = '<div class="trail-timeline">';
      data.trail.forEach(item => {
        const scorePct = (item.score * 100).toFixed(0);
        html += `
          <div class="trail-node ${item.sentiment}">
            <div class="node-top">
              <span class="node-time">${item.pubDate ? new Date(item.pubDate).toLocaleString() : 'Recent'}</span>
              <span class="node-pill ${item.sentiment}">${item.sentiment} • ${scorePct}%</span>
            </div>
            <div class="node-title">${escapeHtml(item.title)}</div>
            <div class="node-foot">
              <span>📡 ${escapeHtml(item.source)}</span>
              ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener">Read Article ➔</a>` : ''}
            </div>
          </div>
        `;
      });
      html += '</div>';
      liveResultsWrap.innerHTML = html;

    } catch (err) {
      console.error(err);
      liveResultsWrap.innerHTML = `<p style="color: var(--neg-color); padding: 20px;">Failed to fetch live search: ${err.message}</p>`;
    }
  }

  // TAB 3: Batch Processor
  btnLoadColabSample.addEventListener('click', () => {
    batchTextarea.value = COLAB_NOTEBOOK_SAMPLES.join('\n');
  });

  btnClearBatch.addEventListener('click', () => {
    batchTextarea.value = '';
    batchResultsWrap.style.display = 'none';
  });

  btnRunBatch.addEventListener('click', async () => {
    const raw = batchTextarea.value.trim();
    if (!raw) {
      alert('Please enter or paste at least one headline.');
      return;
    }

    const headlines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (headlines.length === 0) return;

    btnRunBatch.disabled = true;
    btnRunBatch.innerHTML = `<div class="spinner"></div> Classifying ${headlines.length} items...`;

    try {
      const resp = await fetch('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headlines })
      });

      const data = await resp.json();
      currentBatchData = data.results || [];

      // Render Summary
      batchCountBadge.textContent = `${data.summary.total} Processed`;
      batchStatPos.textContent = `${data.summary.counts.POS} (${data.summary.distribution.POS}%)`;
      batchStatNeu.textContent = `${data.summary.counts.NEU} (${data.summary.distribution.NEU}%)`;
      batchStatNeg.textContent = `${data.summary.counts.NEG} (${data.summary.distribution.NEG}%)`;

      // Render Table
      batchTableBody.innerHTML = '';
      data.results.forEach((row, i) => {
        const tr = document.createElement('tr');
        const scorePct = (row.score * 100).toFixed(1);
        tr.innerHTML = `
          <td style="color: var(--text-muted); font-family: var(--font-mono);">${i + 1}</td>
          <td><strong>${escapeHtml(row.title)}</strong></td>
          <td><span class="node-pill ${row.sentiment}">${row.sentiment}</span></td>
          <td style="font-family: var(--font-mono);">${scorePct}%</td>
          <td style="font-size: 0.8rem; color: var(--text-secondary);">${row.market_impact}</td>
        `;
        batchTableBody.appendChild(tr);
      });

      batchResultsWrap.style.display = 'block';
      btnExportCsv.style.display = 'inline-flex';
    } catch (err) {
      console.error(err);
      alert('Batch classification failed: ' + err.message);
    } finally {
      btnRunBatch.disabled = false;
      btnRunBatch.innerHTML = `<span>Process Batch (BERTweet)</span> ➔`;
    }
  });

  // Export CSV
  btnExportCsv.addEventListener('click', () => {
    if (!currentBatchData || currentBatchData.length === 0) return;

    let csv = "ID,Title,Sentiment,Sentiment_Score,Market_Impact\n";
    currentBatchData.forEach(r => {
      const cleanTitle = `"${r.title.replace(/"/g, '""')}"`;
      csv += `${r.id},${cleanTitle},${r.sentiment},${r.score.toFixed(6)},"${r.market_impact}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rockfeller-sentiment-classified.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  // TAB 4: Headline Battle
  btnRunCompare.addEventListener('click', async () => {
    const a = compareInputA.value.trim();
    const b = compareInputB.value.trim();

    if (!a || !b) {
      alert('Please enter both Headline A and Headline B.');
      return;
    }

    btnRunCompare.disabled = true;
    btnRunCompare.innerHTML = '<div class="spinner"></div> Comparing...';

    try {
      const resp = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headlineA: a, headlineB: b })
      });

      const data = await resp.json();
      compareVerdictText.textContent = data.comparison.slantAssessment;

      const sa = data.analysisA.sentiment;
      const sb = data.analysisB.sentiment;

      compareDetailsGrid.innerHTML = `
        <div class="battle-col" style="border-left: 3px solid ${sa.label === 'POS' ? 'var(--pos-color)' : (sa.label === 'NEG' ? 'var(--neg-color)' : 'var(--neu-color)')};">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">Variant A Outcome</div>
          <div style="font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 8px;">"${escapeHtml(a)}"</div>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px;">
            <span class="sentiment-badge ${sa.label}" style="font-size: 0.85rem; padding: 4px 10px;">${sa.label}</span>
            <span style="font-family: var(--font-mono); font-size: 0.9rem;">${(sa.score * 100).toFixed(1)}% Confidence</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">Market Tone: <strong>${sa.market_impact}</strong></div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Polarity: <strong>${sa.polarity}</strong></div>
        </div>

        <div class="battle-col" style="border-left: 3px solid ${sb.label === 'POS' ? 'var(--pos-color)' : (sb.label === 'NEG' ? 'var(--neg-color)' : 'var(--neu-color)')};">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">Variant B Outcome</div>
          <div style="font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 8px;">"${escapeHtml(b)}"</div>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px;">
            <span class="sentiment-badge ${sb.label}" style="font-size: 0.85rem; padding: 4px 10px;">${sb.label}</span>
            <span style="font-family: var(--font-mono); font-size: 0.9rem;">${(sb.score * 100).toFixed(1)}% Confidence</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">Market Tone: <strong>${sb.market_impact}</strong></div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Polarity: <strong>${sb.polarity}</strong></div>
        </div>
      `;

      compareResultsView.style.display = 'block';
    } catch (err) {
      console.error(err);
      alert('Comparison failed: ' + err.message);
    } finally {
      btnRunCompare.disabled = false;
      btnRunCompare.innerHTML = '<span>Run Battle Comparison</span> ➔';
    }
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Auto-run initial analysis on load
  runAnalysis(headlineInput.value);
});

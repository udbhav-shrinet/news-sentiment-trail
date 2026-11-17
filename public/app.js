// public/app.js - NewsPulse Trail Client Application (Editorial Redesign)

document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Management (Light / Dark)
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  function getPreferredTheme() {
    const saved = localStorage.getItem('np_theme');
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('np_theme', theme);
    if (themeIcon) {
      if (theme === 'dark') {
        themeIcon.innerHTML = `
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
      } else {
        themeIcon.innerHTML = `
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
      }
    }
  }

  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  // DOM Elements - Tab 1
  const headlineInput = document.getElementById('headline-input');
  const btnAnalyze = document.getElementById('btn-analyze');
  const loadingState = document.getElementById('loading-state');
  const resultsView = document.getElementById('results-view');
  const cardHeadlineText = document.getElementById('card-headline-text');
  const cardBadge = document.getElementById('card-badge');
  const cardBadgeDot = document.getElementById('card-badge-dot');
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
  const diagConfidenceLabel = document.getElementById('diag-confidence-label');
  const divergingBarFill = document.getElementById('diverging-bar-fill');
  const entitiesContainer = document.getElementById('entities-container');
  const btnCopyResult = document.getElementById('btn-copy-result');
  const copyBtnText = document.getElementById('copy-btn-text');

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
  const livePropPos = document.getElementById('live-prop-pos');
  const livePropNeu = document.getElementById('live-prop-neu');
  const livePropNeg = document.getElementById('live-prop-neg');

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
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabContents.forEach(c => c.style.display = 'none');

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
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

  // Keyboard shortcut: Enter or Cmd/Ctrl+Enter on headline input
  headlineInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const text = headlineInput.value.trim();
      if (text) runAnalysis(text);
    }
  });

  // Keyboard shortcut: Cmd/Ctrl+Enter on batch textarea
  if (batchTextarea) {
    batchTextarea.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        btnRunBatch.click();
      }
    });
  }

  // Copy Analysis Summary to Clipboard
  if (btnCopyResult) {
    btnCopyResult.addEventListener('click', () => {
      if (!currentAnalysisData) return;
      const s = currentAnalysisData.sentiment;
      const summaryText = `[NewsPulse] Headline: "${currentAnalysisData.headline}"\nSentiment: ${s.label} (${(s.score * 100).toFixed(1)}%)\nPolarity: ${(s.polarity >= 0 ? '+' : '') + s.polarity.toFixed(2)} | Market Momentum: ${s.market_impact}\nTone: ${s.tone}`;

      navigator.clipboard.writeText(summaryText).then(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copied to Clipboard!';
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy Summary';
        }, 2200);
      }).catch(err => {
        console.warn('Clipboard write failed:', err);
      });
    });
  }

  async function runAnalysis(headline) {
    if (loadingState) loadingState.style.display = 'grid';
    if (resultsView) resultsView.style.opacity = '0.3';
    btnAnalyze.disabled = true;

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
      if (loadingState) loadingState.style.display = 'none';
      if (resultsView) resultsView.style.opacity = '1';
      btnAnalyze.disabled = false;
    }
  }

  function renderAnalysis(data) {
    const { headline, sentiment, rippleTrail, liveRelatedTrail } = data;

    // Display Headline
    cardHeadlineText.textContent = `"${headline}"`;

    // Sentiment Badge & Score
    const label = sentiment.label; // 'POS' | 'NEU' | 'NEG'
    cardBadge.className = `sentiment-badge ${label}`;
    if (cardBadgeDot) cardBadgeDot.textContent = '●';
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
    if (label === 'POS') diagMarket.style.color = 'var(--pos-fg)';
    else if (label === 'NEG') diagMarket.style.color = 'var(--neg-fg)';
    else diagMarket.style.color = 'var(--neu-fg)';

    diagPolarity.textContent = (sentiment.polarity >= 0 ? '+' : '') + sentiment.polarity.toFixed(2);
    diagTone.textContent = sentiment.tone;
    diagSubj.textContent = sentiment.subjectivity.toFixed(2);

    if (diagConfidenceLabel) {
      const confLevel = sentiment.score >= 0.85 ? 'High' : (sentiment.score >= 0.65 ? 'Moderate' : 'Low');
      diagConfidenceLabel.textContent = `${confLevel} (${sentiment.score.toFixed(2)})`;
    }

    // Diverging Polarity Bar (-1.00 to +1.00 centered at 50%)
    if (divergingBarFill) {
      const pol = sentiment.polarity; // -1 to +1
      if (pol >= 0) {
        const widthPct = Math.min(50, pol * 50);
        divergingBarFill.style.left = '50%';
        divergingBarFill.style.width = `${widthPct}%`;
        divergingBarFill.style.background = 'var(--pos-bar)';
      } else {
        const widthPct = Math.min(50, Math.abs(pol) * 50);
        divergingBarFill.style.left = `${50 - widthPct}%`;
        divergingBarFill.style.width = `${widthPct}%`;
        divergingBarFill.style.background = 'var(--neg-bar)';
      }
    }

    // Entities
    entitiesContainer.innerHTML = '';
    if (sentiment.entities && sentiment.entities.length > 0) {
      sentiment.entities.forEach(ent => {
        const pill = document.createElement('span');
        pill.className = 'entity-pill';
        let prefix = '';
        if (ent.type === 'Organization') prefix = 'Org: ';
        else if (ent.type === 'Metric/Capital') prefix = 'Val: ';
        pill.textContent = `${prefix}${ent.text}`;
        entitiesContainer.appendChild(pill);
      });
    } else {
      entitiesContainer.innerHTML = '<span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">No specific corporate entities isolated</span>';
    }

    // Render Trail
    renderTrailNodes();
  }

  // Trail Switcher
  btnModeRipple.addEventListener('click', () => {
    btnModeRipple.classList.add('active');
    btnModeRipple.setAttribute('aria-selected', 'true');
    btnModeLive.classList.remove('active');
    btnModeLive.setAttribute('aria-selected', 'false');
    currentTrailMode = 'ripple';
    renderTrailNodes();
  });

  btnModeLive.addEventListener('click', () => {
    btnModeLive.classList.add('active');
    btnModeLive.setAttribute('aria-selected', 'true');
    btnModeRipple.classList.remove('active');
    btnModeRipple.setAttribute('aria-selected', 'false');
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
            <span>Stage: ${escapeHtml(node.impactType)}</span>
            <span>Source: ${escapeHtml(node.source)}</span>
          </div>
        `;
        trailNodesWrap.appendChild(card);
      });
    } else {
      // Live News Mode
      const live = currentAnalysisData.liveRelatedTrail || [];
      if (live.length === 0) {
        trailNodesWrap.innerHTML = `
          <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.82rem; font-family: var(--font-mono);">
            No recent live Google News items returned for this entity. Switch back to "Ripple Projection" to view the narrative timeline.
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
            <span>Publisher: ${escapeHtml(item.source)}</span>
            ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener">Read Source ↗</a>` : ''}
          </div>
        `;
        trailNodesWrap.appendChild(card);
      });
    }
  }

  function updateWaveform(nodes) {
    if (!nodes || nodes.length < 2) {
      wavePath.setAttribute('d', 'M 0,24 L 600,24');
      return;
    }

    // Map sentiments to Y values: POS = 10, NEU = 24, NEG = 38
    const stepX = 600 / (nodes.length - 1);
    const coords = nodes.map((n, i) => {
      const x = i * stepX;
      let y = 24;
      if (n.sentiment === 'POS') y = 10;
      else if (n.sentiment === 'NEG') y = 38;
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
      <div style="text-align: center; padding: 28px;">
        <div class="spinner"></div>
        <p style="margin-top: 8px; color: var(--text-muted); font-size: 0.82rem; font-family: var(--font-mono);">Retrieving Google News RSS stream & running BERTweet inference...</p>
      </div>
    `;

    try {
      const resp = await fetch(`/api/trail?query=${encodeURIComponent(query)}&limit=10`);
      const data = await resp.json();

      if (!data.success || !data.trail || data.trail.length === 0) {
        liveResultsWrap.innerHTML = `<p style="color: var(--text-muted); padding: 20px; font-family: var(--font-mono);">No recent live articles returned for "${escapeHtml(query)}". Try another company or sector keyword.</p>`;
        liveSummaryBar.style.display = 'none';
        return;
      }

      // Show summary bar
      liveSummaryBar.style.display = 'block';
      liveSumTotal.textContent = data.summary.total;
      liveSumPos.textContent = `${data.summary.breakdown.POS}% (${data.summary.counts.POS})`;
      liveSumNeu.textContent = `${data.summary.breakdown.NEU}% (${data.summary.counts.NEU})`;
      liveSumNeg.textContent = `${data.summary.breakdown.NEG}% (${data.summary.counts.NEG})`;

      // Update stacked proportion bar
      if (livePropPos && livePropNeu && livePropNeg) {
        livePropPos.style.width = `${data.summary.breakdown.POS}%`;
        livePropNeu.style.width = `${data.summary.breakdown.NEU}%`;
        livePropNeg.style.width = `${data.summary.breakdown.NEG}%`;
      }

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
              <span>Publisher: ${escapeHtml(item.source)}</span>
              ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener">Read Source ↗</a>` : ''}
            </div>
          </div>
        `;
      });
      html += '</div>';
      liveResultsWrap.innerHTML = html;

    } catch (err) {
      console.error(err);
      liveResultsWrap.innerHTML = `<p style="color: var(--neg-fg); padding: 20px; font-family: var(--font-mono);">Failed to fetch live stream: ${err.message}</p>`;
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
          <td><strong style="font-family: var(--font-serif);">${escapeHtml(row.title)}</strong></td>
          <td><span class="node-pill ${row.sentiment}">${row.sentiment}</span></td>
          <td class="mono-nums">${scorePct}%</td>
          <td style="font-size: 0.78rem; color: var(--text-secondary);">${row.market_impact}</td>
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
      btnRunBatch.innerHTML = `<span>Run Batch Pipeline</span> <span class="kbd-shortcut">⌘↵</span>`;
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
    btnRunCompare.innerHTML = '<div class="spinner"></div> Comparing Editorial Tone...';

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

      const polDelta = (sa.polarity - sb.polarity).toFixed(2);
      const confDelta = ((sa.score - sb.score) * 100).toFixed(1);

      compareDetailsGrid.innerHTML = `
        <div class="battle-col" style="border-left: 3px solid ${sa.label === 'POS' ? 'var(--pos-bar)' : (sa.label === 'NEG' ? 'var(--neg-bar)' : 'var(--neu-bar)')};">
          <div style="font-size: 0.68rem; font-family: var(--font-mono); text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">Variant A Breakdown</div>
          <div style="font-size: 1rem; font-family: var(--font-serif); font-weight: 600; color: var(--text-hero); margin-bottom: 8px;">"${escapeHtml(a)}"</div>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
            <span class="sentiment-badge ${sa.label}">${sa.label}</span>
            <span class="mono-nums" style="font-size: 0.85rem; font-weight: 600;">${(sa.score * 100).toFixed(1)}% Confidence</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">Market Tone: <strong>${sa.market_impact}</strong></div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Polarity: <strong class="mono-nums">${sa.polarity}</strong></div>
        </div>

        <div class="battle-col" style="border-left: 3px solid ${sb.label === 'POS' ? 'var(--pos-bar)' : (sb.label === 'NEG' ? 'var(--neg-bar)' : 'var(--neu-bar)')};">
          <div style="font-size: 0.68rem; font-family: var(--font-mono); text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">Variant B Breakdown</div>
          <div style="font-size: 1rem; font-family: var(--font-serif); font-weight: 600; color: var(--text-hero); margin-bottom: 8px;">"${escapeHtml(b)}"</div>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
            <span class="sentiment-badge ${sb.label}">${sb.label}</span>
            <span class="mono-nums" style="font-size: 0.85rem; font-weight: 600;">${(sb.score * 100).toFixed(1)}% Confidence</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">Market Tone: <strong>${sb.market_impact}</strong></div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Polarity: <strong class="mono-nums">${sb.polarity}</strong></div>
        </div>
      `;

      compareResultsView.style.display = 'block';
    } catch (err) {
      console.error(err);
      alert('Comparison failed: ' + err.message);
    } finally {
      btnRunCompare.disabled = false;
      btnRunCompare.innerHTML = '<span>Run Slant Battle</span> ➔';
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

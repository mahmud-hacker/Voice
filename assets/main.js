/* ── HERO GRID ── */
  const heroGrid = document.getElementById('hero-grid');
  for (let i = 0; i < 36; i++) heroGrid.innerHTML += '<span></span>';

  /* ── PROGRESS BAR ── */
  const bar = document.getElementById('progress-bar');
  window.addEventListener('scroll', () => {
    bar.style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100) + '%';
  });

  /* ── BACK TO TOP ── */
  const btt = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => btt.classList.toggle('show', window.scrollY > 400));
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── TOAST ── */
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  /* ── THEME TOGGLE ── */
  const toggle = document.getElementById('theme-toggle');
  if (localStorage.getItem('voice-theme') === 'light') { document.body.classList.add('light'); toggle.textContent = '🌙'; }
  toggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    toggle.textContent = isLight ? '🌙' : '☀️';
    localStorage.setItem('voice-theme', isLight ? 'light' : 'dark');
  });

  /* ── MOBILE MENU ── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');
  function openMobileMenu() {
    mobileMenu.classList.add('open');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
  }
  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  hamburger.addEventListener('click', () => mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu());
  mobileClose.addEventListener('click', closeMobileMenu);
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));

  /* ── SCROLL REVEAL ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── SEARCH ── */
  const searchInput = document.getElementById('search-input');
  const noResults = document.getElementById('no-results');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    let visible = 0;
    document.querySelectorAll('.post-card').forEach(card => {
      if (card.id === 'load-more-btn') return;
      const text = card.textContent.toLowerCase();
      const show = !q || text.includes(q);
      card.style.display = show ? '' : 'none';
      if (show && !card.classList.contains('hidden-card')) visible++;
    });
    noResults.style.display = (q && visible === 0) ? 'block' : 'none';
  });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (e.key === 'Escape') { searchInput.blur(); closeMobileMenu(); }
  });

  /* ── TOPIC PILLS ── */
  document.querySelectorAll('.topic-pill').forEach(pill => {
    pill.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.topic-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const topic = pill.dataset.topic;
      if (topic === 'all') {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
      } else {
        searchInput.value = topic;
        searchInput.dispatchEvent(new Event('input'));
        document.getElementById('posts-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast('Filtering: ' + topic);
      }
    });
  });

  /* ── LOAD MORE ── */
  const loadMoreBtn = document.getElementById('load-more-btn');
  loadMoreBtn.addEventListener('click', () => {
    const hidden = document.querySelectorAll('.post-card.hidden-card');
    hidden.forEach(c => {
      c.classList.add('shown');
      c.classList.remove('hidden-card');
      revealObserver.observe(c);
    });
    loadMoreBtn.classList.add('hidden');
    showToast('✓ All articles loaded');
  });

  /* ── ANIMATED COUNTERS ── */
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || (target >= 100 ? '' : target > 10 ? '+' : '');
      let current = 0;
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current + suffix;
        if (current >= target) clearInterval(timer);
      }, 35);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(c => counterObserver.observe(c));

  /* ── READING LIST ── */
  let readingList = JSON.parse(localStorage.getItem('voice-rl') || '[]');
  const rlToggleBtn = document.getElementById('rl-toggle-btn');
  const rlBadge = document.getElementById('rl-count-badge');
  const drawer = document.getElementById('reading-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const rlBody = document.getElementById('rl-body');
  const rlEmpty = document.getElementById('rl-empty');

  function updateRLBadge() {
    rlBadge.textContent = readingList.length;
    rlBadge.classList.toggle('has-items', readingList.length > 0);
  }

  function renderRL() {
    rlEmpty.style.display = readingList.length === 0 ? 'flex' : 'none';
    rlBody.querySelectorAll('.rl-item').forEach(el => el.remove());
    readingList.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'rl-item';
      div.innerHTML = `
        <div class="rl-item-title">${item.title}</div>
        <div class="rl-item-meta">${item.meta}</div>
        <button class="rl-remove" title="Remove" onclick="removeRL(${idx})">✕</button>`;
      rlBody.appendChild(div);
    });
  }

  function removeRL(idx) {
    const title = readingList[idx].title;
    readingList.splice(idx, 1);
    localStorage.setItem('voice-rl', JSON.stringify(readingList));
    updateRLBadge();
    renderRL();
    // un-bookmark the card
    document.querySelectorAll('.post-card').forEach(card => {
      if (card.dataset.title === title) {
        const btn = card.querySelector('.bookmark-btn');
        if (btn) { btn.classList.remove('bookmarked'); btn.title = 'Save to reading list'; }
      }
    });
    showToast('Removed from reading list');
  }

  rlToggleBtn.addEventListener('click', () => {
    drawer.classList.toggle('open');
    backdrop.classList.toggle('open');
    renderRL();
  });
  document.getElementById('drawer-close-btn').addEventListener('click', () => {
    drawer.classList.remove('open'); backdrop.classList.remove('open');
  });
  backdrop.addEventListener('click', () => {
    drawer.classList.remove('open'); backdrop.classList.remove('open');
  });

  function handleBookmark(e, btn) {
    e.preventDefault(); e.stopPropagation();
    const card = btn.closest('.post-card');
    const title = card.dataset.title;
    const meta = card.dataset.meta || '';
    const existing = readingList.findIndex(i => i.title === title);
    if (existing > -1) {
      readingList.splice(existing, 1);
      btn.classList.remove('bookmarked');
      showToast('Removed from reading list');
    } else {
      readingList.push({ title, meta });
      btn.classList.add('bookmarked');
      showToast('✓ Saved to reading list');
    }
    localStorage.setItem('voice-rl', JSON.stringify(readingList));
    updateRLBadge();
  }

  function handleShare(e, btn) {
    e.preventDefault(); e.stopPropagation();
    const card = btn.closest('.post-card');
    const title = card.dataset.title;
    navigator.clipboard?.writeText(window.location.href + '#' + encodeURIComponent(title)).catch(() => {});
    showToast('🔗 Link copied to clipboard');
  }

  // Restore bookmark states
  readingList.forEach(item => {
    document.querySelectorAll('.post-card').forEach(card => {
      if (card.dataset.title === item.title) {
        const btn = card.querySelector('.bookmark-btn');
        if (btn) btn.classList.add('bookmarked');
      }
    });
  });
  updateRLBadge();

  /* ── AI SUMMARY ── */
  const ARTICLE_DESCRIPTIONS = {
    "The First 60 Seconds That Make or Break Your Video": "An article about how the opening minute of a YouTube video determines viewer retention, covering hook strategies, thumbnail consistency, and pattern interrupts that keep audiences watching.",
    "Why Your Engagement Dropped (And How to Fix It)": "An analysis of common reasons for engagement drops on social media, including posting frequency mistakes, audience mismatch, and how to diagnose and recover your content performance.",
    "How to Land Your First Brand Deal Without an Agent": "A step-by-step guide for content creators on pitching brands directly, building a media kit, finding brand contact emails, and negotiating fair rates for sponsorships.",
    "Reels vs. Carousels: What's Actually Getting Reach in 2025": "A data-driven comparison of Instagram Reels and carousel posts, examining which formats the algorithm favors in 2025, with practical advice on when to use each.",
    "Burnout Is Real — Here's How I Kept Creating Through It": "A personal essay on creator burnout, exploring sustainable content habits, creative boundaries, and mental health practices that help creators stay consistent long-term.",
    "Going Viral Means Nothing Without This One Thing": "A piece arguing that community-building matters more than viral moments, with tactics for converting spike traffic into loyal subscribers and long-term audience relationships.",
    "The Email List Every Creator Needs (But Nobody Builds)": "A guide explaining why email lists are the most valuable creator asset, how to start one from scratch, and the best lead magnet strategies for growing a list fast.",
    "Storytelling Frameworks That Turn Viewers Into Fans": "A breakdown of narrative structures borrowed from screenwriting — the hero's journey, three-act structure, and conflict loops — applied to content creation for deeper audience connection.",
    "How to Batch-Create 30 Days of Content in One Weekend": "A practical system for batching content production, including theme days, scripting templates, filming setups, and scheduling tools that allow creators to stay weeks ahead."
  };

  async function handleSummarize(e, btn) {
    e.preventDefault(); e.stopPropagation();
    const card = btn.closest('.post-card');
    const panel = card.querySelector('.ai-summary-panel');
    const summaryText = panel.querySelector('.ai-summary-text');
    const title = card.dataset.title;
    const description = ARTICLE_DESCRIPTIONS[title] || An article titled "${title}" from the Voice content creator blog.;

    if (panel.classList.contains('visible')) return;
    panel.classList.add('visible');
    summaryText.textContent = 'Generating summary…';
    btn.disabled = true;
    btn.textContent = '✦ Loading…';

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: You are a helpful assistant summarizing blog articles for content creators. Write a 2-sentence summary of this article: ${description}. Be concise, specific, and insightful. Return only the summary, no labels or preamble.
          }]
        })
      });
      const data = await resp.json();
      const text = data?.content?.[0]?.text || 'Could not generate summary.';
      summaryText.textContent = text;
    } catch {
      summaryText.textContent = 'Summary unavailable — please try again later.';
    }
    btn.disabled = false;
    btn.textContent = '✦ AI Summary';
  }

  function closeSummary(e, btn) {
    e.preventDefault(); e.stopPropagation();
    btn.closest('.ai-summary-panel').classList.remove('visible');
  }

  /* ── STORY WALL ── */
  const AVATAR_COLORS = [
    ['#C9A24A','#080C14'],['#1B3A6B','#F0EAD6'],['#E8C46A','#080C14'],
    ['#2A5299','#F0EAD6'],['#A07830','#F0EAD6'],['#152E55','#C9A24A']
  ];
  const PLATFORM_LABELS = { YouTube:'▶️ YouTube', Instagram:'◈ Instagram', TikTok:'♪ TikTok', Facebook:'f Facebook', Website:'🌐 Website' };

  const seedStories = [
    { name:'Maria G.', platform:'Instagram', text:"I've been following Voice for 6 months and you literally helped me land my first brand deal. Thank you for showing us it's possible.", time:'2h ago', likes:24 },
    { name:'Dayo K.', platform:'YouTube', text:"The way you break down content strategy makes everything feel achievable. Keep going — we're here for all of it 🙌", time:'5h ago', likes:17 },
    { name:'Priya S.', platform:'TikTok', text:"Your last video inspired me to finally start my own channel. I was scared for years. Posted my first video today!", time:'1d ago', likes:41 },
    { name:'James O.', platform:'Facebook', text:"Not just content — you give people their confidence back. That's rare. This community is something special.", time:'2d ago', likes:33 },
  ];
  const storyWall = document.getElementById('story-wall');

  function avatarColor(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
  }

  function buildStoryCard(s, prepend = false) {
    const [bg, fg] = avatarColor(s.name);
    const card = document.createElement('div');
    card.className = 'story-card';
    card.innerHTML = `
      <div class="story-card-header">
        <div class="story-avatar" style="background:${bg};color:${fg}">${s.name.charAt(0)}</div>
        <div class="story-meta">
          <div class="story-name">${s.name}</div>
          <div class="story-platform">${PLATFORM_LABELS[s.platform] || s.platform}</div>
        </div>
        <span class="story-time">${s.time || 'just now'}</span>
      </div>
      <div class="story-text">${s.text}</div>
      <div class="story-likes" data-likes="${s.likes || 0}">
        <span>♥️</span> <span class="like-count">${s.likes || 0}</span> resonated
      </div>`;
    card.querySelector('.story-likes').addEventListener('click', function() {
      if (this.classList.contains('liked')) return;
      this.classList.add('liked');
      const lc = this.querySelector('.like-count');
      lc.textContent = parseInt(lc.textContent) + 1;
    });
    if (prepend && storyWall.firstChild) storyWall.insertBefore(card, storyWall.firstChild);
    else storyWall.appendChild(card);
  }

  seedStories.forEach(s => buildStoryCard(s));

  const storyNameEl  = document.getElementById('story-name');
  const storyPlatEl  = document.getElementById('story-platform');
  const storyTextEl  = document.getElementById('story-text');
  const storyChars   = document.getElementById('story-chars');
  const storySubmit  = document.getElementById('story-submit-btn');

  storyTextEl.addEventListener('input', () => {
    const len = storyTextEl.value.length;
    storyChars.textContent = len;
    storyChars.style.color = len > 260 ? 'var(--gold)' : 'var(--muted)';
  });

  storySubmit.addEventListener('click', () => {
    const name = storyNameEl.value.trim();
    const text = storyTextEl.value.trim();
    if (!name) { storyNameEl.focus(); showToast('Please enter your name.'); return; }
    if (text.length < 10) { storyTextEl.focus(); showToast('Story is too short!'); return; }
    buildStoryCard({ name, platform: storyPlatEl.value, text, likes: 0 }, true);
    storyNameEl.value = ''; storyTextEl.value = '';
    storyChars.textContent = '0';
    storyWall.scrollTop = 0;
    showToast('✨ Your story has been shared!');
  });

  /* ── LIVE CHAT ── */
  const chatMessages = document.getElementById('chat-messages');
  const chatInput    = document.getElementById('chat-input');
  const chatNameEl   = document.getElementById('chat-name');
  const chatSendBtn  = document.getElementById('chat-send');
  const onlineCount  = document.getElementById('online-count');

  let online = 12 + Math.floor(Math.random() * 20);
  onlineCount.textContent = online + ' online';
  setInterval(() => {
    online += Math.floor(Math.random() * 3) - 1;
    online = Math.max(8, Math.min(60, online));
    onlineCount.textContent = online + ' online';
  }, 8000);

  const seedMessages = [
    { name:'Tolu', text:'Hey everyone! First time here 👋' },
    { name:'Sasha', text:'Love what Voice is doing for this community 🔥' },
    { name:'Ren', text:'Just watched the latest video — so good!' },
    { name:'Mia', text:"Can't wait to see what content comes next 🚀" },
  ];

  function addChatMsg(name, text, own = false) {
    const [bg, fg] = avatarColor(name);
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg' + (own ? ' own' : '');
    const now = new Date();
    const time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    wrap.innerHTML = `
      <div class="chat-avatar" style="background:${bg};color:${fg}">${name.charAt(0).toUpperCase()}</div>
      <div>
        <div class="chat-bubble-meta">${own ? 'You' : name} · ${time}</div>
        <div class="chat-bubble">${text}</div>
      </div>`;
    chatMessages.appendChild(wrap);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  seedMessages.forEach((m, i) => setTimeout(() => addChatMsg(m.name, m.text), i * 350));

  const botReplies = ['Welcome to the Voice community! 🙌','So glad you\'re here!','That\'s so true 💯','Keep going — this community has your back!','Voice really speaks for all of us ✨','Amazing to see the community growing!','💡 Great point!','Dropped a comment on the latest video too 🔥'];
  const botNames = ['Aiko','Liam','Zara','Carlos','Priya','Sam','Noor','Felix'];
  let botIndex = 0;
  function botReply() {
    setTimeout(() => {
      addChatMsg(botNames[Math.floor(Math.random() * botNames.length)], botReplies[botIndex % botReplies.length]);
      botIndex++;
      botReply();
    }, 5000 + Math.random() * 10000);
  }
  botReply();

  function sendChat() {
    const name = chatNameEl.value.trim() || 'You';
    const text = chatInput.value.trim();
    if (!text) return;
    addChatMsg(name, text, true);
    chatInput.value = '';
    chatInput.focus();
  }
  chatSendBtn.addEventListener('click', sendChat);
  chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
  document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => { chatInput.value += btn.dataset.emoji; chatInput.focus(); });
  });

  /* ── NEWSLETTER — real form submission ── */
  const newsletterForm = document.getElementById('newsletter-form');
  const subInput  = document.getElementById('sub-input');
  const subBtn    = document.getElementById('sub-btn');
  const subFeedback = document.getElementById('sub-feedback');

  function showSubFeedback(msg, color) {
    subFeedback.textContent = msg;
    subFeedback.style.color = color;
    subFeedback.style.display = 'block';
    setTimeout(() => { subFeedback.style.display = 'none'; }, 4000);
  }

  // Live validation: enable/disable button as user types
  if (subInput && subBtn) {
    subInput.addEventListener('input', () => {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subInput.value);
      subBtn.style.opacity = valid ? '1' : '0.6';
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = subInput.value.trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showSubFeedback('⚠️ Please enter a valid email address.', 'var(--gold)');
        subInput.focus();
        return;
      }

      const action = newsletterForm.action;

      // If no real action URL set yet, show a ready-state message
      if (!action || action === '#' || action === window.location.href) {
        showSubFeedback('✓ Ready to subscribe! Connect your email service to go live.', 'var(--gold-light)');
        showToast('🎉 You\'re on the list! Welcome to Voice.');
        subInput.value = '';
        subBtn.style.opacity = '0.6';
        return;
      }

      // Real submission (Mailchimp / ConvertKit / custom endpoint)
      subBtn.disabled = true;
      subBtn.textContent = '…';
      try {
        const formData = new FormData(newsletterForm);
        // Mailchimp requires a jsonp-style request for cross-origin;
        // for custom or ConvertKit endpoints, a standard POST works fine.
        const isMailchimp = action.includes('list-manage.com');
        if (isMailchimp) {
          // Convert Mailchimp action to jsonp endpoint
          const jsonpUrl = action.replace('/post?', '/post-json?') + '&c=?';
          const script = document.createElement('script');
          window._mcCallback = function(resp) {
            if (resp.result === 'success') {
              showSubFeedback('🎉 You\'re subscribed! Welcome to Voice.', 'var(--gold-light)');
              showToast('🎉 Subscribed! Welcome to Voice.');
              subInput.value = '';
            } else {
              showSubFeedback('⚠️ ' + (resp.msg || 'Something went wrong. Try again.'), 'var(--gold)');
            }
            script.remove();
            subBtn.disabled = false;
            subBtn.textContent = 'Subscribe';
          };
          script.src = jsonpUrl + '&EMAIL=' + encodeURIComponent(email) + '&callback=_mcCallback';
          document.head.appendChild(script);
        } else {
          const resp = await fetch(action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
            body: new URLSearchParams(formData).toString()
          });
          if (resp.ok) {
            showSubFeedback('🎉 You\'re subscribed! Welcome to Voice.', 'var(--gold-light)');
            showToast('🎉 Subscribed! Welcome to Voice.');
            subInput.value = '';
          } else {
            showSubFeedback('⚠️ Something went wrong. Please try again.', 'var(--gold)');
          }
          subBtn.disabled = false;
          subBtn.textContent = 'Subscribe';
        }
      } catch {
        showSubFeedback('⚠️ Could not subscribe right now. Try again shortly.', 'var(--gold)');
        subBtn.disabled = false;
        subBtn.textContent = 'Subscribe';
      }
    });

    // Also support pressing Enter in the input
    subInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); newsletterForm.requestSubmit(); }
    });
  }


<!-- SOCIAL LINK CONFIG BUTTON -->
<button id="social-cfg-btn" title="Update social links"><i class="fa-solid fa-link"></i></button>

<!-- SOCIAL LINK CONFIG PANEL -->
<div id="social-cfg-panel" role="dialog" aria-label="Update social links">
  <h4>Update Your Links</h4>
  <p>Paste your real social URLs below</p>
  <div class="cfg-field">
    <label><i class="fa-brands fa-youtube"></i> YouTube</label>
    <input id="cfg-yt" type="url" placeholder="https://youtube.com/@yourhandle" />
  </div>
  <div class="cfg-field">
    <label><i class="fa-brands fa-instagram"></i> Instagram</label>
    <input id="cfg-ig" type="url" placeholder="https://instagram.com/yourhandle" />
  </div>
  <div class="cfg-field">
    <label><i class="fa-brands fa-tiktok"></i> TikTok</label>
    <input id="cfg-tt" type="url" placeholder="https://tiktok.com/@yourhandle" />
  </div>
  <div class="cfg-field">
    <label><i class="fa-brands fa-facebook-f"></i> Facebook</label>
    <input id="cfg-fb" type="url" placeholder="https://facebook.com/yourpage" />
  </div>
  <button id="cfg-save-btn"><i class="fa-solid fa-floppy-disk"></i> Save Links</button>
</div>

<!-- SEARCH OVERLAY (Cmd+K) -->
<div id="search-overlay" role="dialog" aria-label="Search">
  <div id="search-modal">
    <input id="search-modal-input" placeholder="Search articles, topics, tips..." autocomplete="off" />
    <div id="search-results-list"></div>
    <div id="search-empty" style="display:none;">No results found — try a different keyword</div>
    <div id="search-shortcuts">
      <span><kbd class="kbd">↑↓</kbd> navigate</span>
      <span><kbd class="kbd">↵</kbd> open</span>
      <span><kbd class="kbd">Esc</kbd> close</span>
    </div>
  </div>
</div>

<!-- ── BRAND ANIMATIONS & CURSOR ── -->
  /* Custom cursor */
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mx = -100, my = -100, rx = -100, ry = -100;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function animCursor() {
    if (dot)  { dot.style.left  = mx + 'px'; dot.style.top  = my + 'px'; }
    rx += (mx - rx) * 0.14; ry += (my - ry) * 0.14;
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    requestAnimationFrame(animCursor);
  })();

  /* Spotlight follow */
  const spotlight = document.getElementById('spotlight');
  if (spotlight) {
    document.addEventListener('mousemove', e => {
      spotlight.style.left = e.clientX + 'px';
      spotlight.style.top  = e.clientY + 'px';
    });
  }

  /* ── PARTICLE CANVAS ── */
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2;opacity:0.6;';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const GOLD = ['rgba(201,162,74,', 'rgba(232,196,106,', 'rgba(160,120,48,'];

  function Particle() {
    this.reset = function() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = -Math.random() * 0.4 - 0.1;
      this.r  = Math.random() * 1.5 + 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.life  = 0;
      this.maxLife = Math.random() * 300 + 200;
      this.color = GOLD[Math.floor(Math.random() * GOLD.length)];
    };
    this.reset();
    this.y = Math.random() * H; // scatter initial positions
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.life++;
      p.x += p.vx; p.y += p.vy;
      const progress = p.life / p.maxLife;
      const alpha = p.alpha * (progress < 0.2 ? progress / 0.2 : progress > 0.8 ? (1 - progress) / 0.2 : 1);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + alpha + ')';
      ctx.fill();
      if (p.life >= p.maxLife || p.y < -10) p.reset();
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* ── ANIMATED COUNTER ── */
  function animateCounter(el, target, duration = 1800) {
    const start = performance.now();
    const isFloat = target % 1 !== 0;
    (function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      const val = target * ease;
      el.textContent = isFloat ? val.toFixed(1) + 'M' : Math.round(val).toLocaleString() + (el.dataset.suffix || '');
      if (t < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  /* ── GLITCH TEXT EFFECT on hero ── */
  const heroH1 = document.querySelector('.hero h1');
  if (heroH1) {
    heroH1.style.position = 'relative';
    setInterval(() => {
      if (Math.random() > 0.97) {
        heroH1.style.textShadow = 2px 0 rgba(27,58,107,0.5), -2px 0 rgba(201,162,74,0.4);
        setTimeout(() => heroH1.style.textShadow = '', 80);
        setTimeout(() => {
          heroH1.style.textShadow = -2px 0 rgba(27,58,107,0.5), 2px 0 rgba(201,162,74,0.4);
          setTimeout(() => heroH1.style.textShadow = '', 60);
        }, 100);
      }
    }, 800);
  }

  /* ── MAGNETIC BUTTONS ── */
  document.querySelectorAll('.btn-primary, .btn-ghost, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      btn.style.transform = translate(${dx * 0.18}px, ${dy * 0.18}px);
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  /* ── STAGGER REVEAL CARDS ── */
  const cards = document.querySelectorAll('.post-card, .social-card, .about-card');
  const cardObs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        cardObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  cards.forEach(c => cardObs.observe(c));

  /* ── TYPEWRITER for hero subtitle ── */
  const heroSub = document.querySelector('.hero-sub');
  if (heroSub) {
    const original = heroSub.textContent;
    heroSub.textContent = '';
    let i = 0;
    setTimeout(() => {
      const type = setInterval(() => {
        heroSub.textContent += original[i++];
        if (i >= original.length) clearInterval(type);
      }, 22);
    }, 900);
  }

  const statNums = document.querySelectorAll('.hero-stat-num');
  const statTargets = [2.4, 380, 12];
  const statSuffixes = ['M', 'K+', 'K'];
  const statObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNums.forEach((el, i) => {
          const target = statTargets[i];
          const suffix = statSuffixes[i];
          const isFloat = target % 1 !== 0;
          const start = performance.now();
          const duration = 1800;
          (function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 4);
            const val = target * ease;
            el.textContent = (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
            if (t < 1) requestAnimationFrame(tick);
          })(performance.now());
        });
        statObs.disconnect();
      }
    });
  }, { threshold: 0.5 });
  if (statNums[0]) statObs.observe(statNums[0]);

  /* ── HEADER GOLD LINE on scroll ── */
  const hdr = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      hdr.style.boxShadow = '0 4px 40px rgba(0,0,0,0.6), 0 0 1px rgba(201,162,74,0.3)';
    } else {
      hdr.style.boxShadow = '0 4px 40px rgba(0,0,0,0.4), 0 0 1px rgba(201,162,74,0.1)';
    }
  });

  /* ══════════════════════════════════════════
     SOCIAL LINK CONFIG PANEL
  ══════════════════════════════════════════ */
  const cfgBtn   = document.getElementById('social-cfg-btn');
  const cfgPanel = document.getElementById('social-cfg-panel');

  // Load saved links from localStorage
  const SOCIAL_LINKS = {
    yt: localStorage.getItem('voice_yt') || 'https://youtube.com/@voice',
    ig: localStorage.getItem('voice_ig') || 'https://instagram.com/voice',
    tt: localStorage.getItem('voice_tt') || 'https://tiktok.com/@voice',
    fb: localStorage.getItem('voice_fb') || 'https://facebook.com/voiceblog'
  };

  function applyAllLinks() {
    // Nav socials
    document.querySelectorAll('a.yt').forEach(a => a.href = SOCIAL_LINKS.yt);
    document.querySelectorAll('a.ig').forEach(a => a.href = SOCIAL_LINKS.ig);
    document.querySelectorAll('a.tt').forEach(a => a.href = SOCIAL_LINKS.tt);
    document.querySelectorAll('a.fb').forEach(a => a.href = SOCIAL_LINKS.fb);
    // Social cards
    const scYt = document.getElementById('sc-yt-link');
    const scIg = document.getElementById('sc-ig-link');
    const scTt = document.getElementById('sc-tt-link');
    const scFb = document.getElementById('sc-fb-link');
    if (scYt) scYt.href = SOCIAL_LINKS.yt;
    if (scIg) scIg.href = SOCIAL_LINKS.ig;
    if (scTt) scTt.href = SOCIAL_LINKS.tt;
    if (scFb) scFb.href = SOCIAL_LINKS.fb;
    // Inputs
    const ytIn = document.getElementById('cfg-yt');
    const igIn = document.getElementById('cfg-ig');
    const ttIn = document.getElementById('cfg-tt');
    const fbIn = document.getElementById('cfg-fb');
    if (ytIn) ytIn.value = SOCIAL_LINKS.yt;
    if (igIn) igIn.value = SOCIAL_LINKS.ig;
    if (ttIn) ttIn.value = SOCIAL_LINKS.tt;
    if (fbIn) fbIn.value = SOCIAL_LINKS.fb;
  }
  applyAllLinks();

  cfgBtn.addEventListener('click', e => {
    e.stopPropagation();
    cfgPanel.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!cfgPanel.contains(e.target) && e.target !== cfgBtn) {
      cfgPanel.classList.remove('open');
    }
  });

  document.getElementById('cfg-save-btn').addEventListener('click', () => {
    const yt = document.getElementById('cfg-yt').value.trim();
    const ig = document.getElementById('cfg-ig').value.trim();
    const tt = document.getElementById('cfg-tt').value.trim();
    const fb = document.getElementById('cfg-fb').value.trim();
    if (yt) { SOCIAL_LINKS.yt = yt; localStorage.setItem('voice_yt', yt); }
    if (ig) { SOCIAL_LINKS.ig = ig; localStorage.setItem('voice_ig', ig); }
    if (tt) { SOCIAL_LINKS.tt = tt; localStorage.setItem('voice_tt', tt); }
    if (fb) { SOCIAL_LINKS.fb = fb; localStorage.setItem('voice_fb', fb); }
    applyAllLinks();
    cfgPanel.classList.remove('open');
    showToast('✅ Social links updated!');
  });

  /* ══════════════════════════════════════════
     FULL-FEATURED SEARCH MODAL (Cmd/Ctrl+K)
  ══════════════════════════════════════════ */
  const searchOverlay = document.getElementById('search-overlay');
  const searchModalInput = document.getElementById('search-modal-input');
  const searchResultsList = document.getElementById('search-results-list');
  const searchEmpty = document.getElementById('search-empty');

  // Collect all articles from the page
  const allArticles = [];
  document.querySelectorAll('.post-card').forEach(card => {
    const title = card.querySelector('h3')?.textContent || '';
    const excerpt = card.querySelector('p')?.textContent || '';
    const tag = card.querySelector('.tag')?.textContent || '';
    const meta = card.querySelector('.post-meta')?.textContent?.trim() || '';
    if (title) allArticles.push({ title, excerpt, tag, meta, el: card });
  });

  function openSearchModal() {
    searchOverlay.classList.add('open');
    setTimeout(() => searchModalInput.focus(), 50);
    renderSearchResults('');
  }
  function closeSearchModal() {
    searchOverlay.classList.remove('open');
    searchModalInput.value = '';
  }

  // Keyboard shortcut
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchOverlay.classList.contains('open') ? closeSearchModal() : openSearchModal();
    }
    if (e.key === 'Escape') closeSearchModal();
    // Arrow navigation in results
    if (searchOverlay.classList.contains('open')) {
      const items = searchResultsList.querySelectorAll('.sr-item');
      const active = searchResultsList.querySelector('.sr-item.sr-active');
      const idx = Array.from(items).indexOf(active);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = items[idx + 1] || items[0];
        items.forEach(i => i.classList.remove('sr-active'));
        if (next) { next.classList.add('sr-active'); next.scrollIntoView({ block: 'nearest' }); }
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = items[idx - 1] || items[items.length - 1];
        items.forEach(i => i.classList.remove('sr-active'));
        if (prev) { prev.classList.add('sr-active'); prev.scrollIntoView({ block: 'nearest' }); }
      }
      if (e.key === 'Enter') {
        const act = searchResultsList.querySelector('.sr-item.sr-active');
        if (act) act.click();
      }
    }
  });

  // Click outside closes
  searchOverlay.addEventListener('click', e => {
    if (e.target === searchOverlay) closeSearchModal();
  });

  // Search box in header also opens modal
  const oldSearchInput = document.getElementById('search-input');
  if (oldSearchInput) {
    oldSearchInput.addEventListener('focus', () => { oldSearchInput.blur(); openSearchModal(); });
    oldSearchInput.addEventListener('click', openSearchModal);
  }

  function renderSearchResults(query) {
    const q = query.toLowerCase().trim();
    const filtered = q ? allArticles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tag.toLowerCase().includes(q)
    ) : allArticles;

    searchResultsList.innerHTML = '';
    if (!filtered.length) {
      searchEmpty.style.display = 'block';
      return;
    }
    searchEmpty.style.display = 'none';
    filtered.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'sr-item' + (i === 0 ? ' sr-active' : '');
      div.style.background = 'var(--surface2)';
      div.innerHTML = `
        <span class="sr-tag">${item.tag || 'Article'}</span>
        <div>
          <div class="sr-title">${item.title}</div>
          <div class="sr-meta">${item.meta}</div>
        </div>
      `;
      div.addEventListener('click', () => {
        closeSearchModal();
        item.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        item.el.style.transition = 'box-shadow 0.4s';
        item.el.style.boxShadow = '0 0 0 2px var(--gold), 0 0 40px rgba(201,162,74,0.3)';
        setTimeout(() => { item.el.style.boxShadow = ''; }, 1800);
      });
      div.addEventListener('mouseover', () => {
        searchResultsList.querySelectorAll('.sr-item').forEach(i => i.classList.remove('sr-active'));
        div.classList.add('sr-active');
      });
      searchResultsList.appendChild(div);
    });
  }

  // Add active styles
  const srStyle = document.createElement('style');
  srStyle.textContent = '.sr-item.sr-active { background: var(--surface2) !important; }';
  document.head.appendChild(srStyle);

  searchModalInput.addEventListener('input', e => renderSearchResults(e.target.value));

  // Update search kbd shortcut display
  const searchKbd = document.querySelector('.search-kbd');
  if (searchKbd) {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    searchKbd.textContent = isMac ? '⌘K' : 'Ctrl+K';
  }

  /* ══════════════════════════════════════════
     TOPIC FILTER — duplicate block removed (handled above)
  ══════════════════════════════════════════ */

  /* newsletter validation handled in main newsletter form handler above */

  /* ══════════════════════════════════════════
     SMOOTH SCROLL for all anchor links
  ══════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ══════════════════════════════════════════
     READING TIME estimator on post cards
  ══════════════════════════════════════════ */
  document.querySelectorAll('.post-card').forEach(card => {
    const text = card.querySelector('p')?.textContent || '';
    const words = text.split(' ').length;
    const mins = Math.max(1, Math.round(words / 200));
    const metaEl = card.querySelector('.post-meta');
    if (metaEl && !metaEl.textContent.includes('min')) {
      const rt = document.createElement('span');
      rt.innerHTML = <span class="meta-sep">·</span> ${mins} min read;
      metaEl.appendChild(rt);
    }
  });

  /* ══════════════════════════════════════════
     LOGO ANIMATION on page load
  ══════════════════════════════════════════ */
  const logoImg = document.querySelector('.logo img');
  if (logoImg) {
    logoImg.style.animation = 'goldGlow 3s ease-in-out infinite';
  }

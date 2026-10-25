(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav: solid on scroll + mobile menu ---------- */
  var nav = document.querySelector('[data-nav]');
  var burger = document.querySelector('[data-nav-burger]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  // The homepage nav starts transparent over the hero video and turns solid on
  // scroll. Pages without a hero have no dark backdrop, so white nav text over
  // the translucent gradient would be unreadable — keep those solid always.
  var navAlwaysSolid = document.body.classList.contains('uc-page');
  function setSolid() {
    nav.classList.toggle('is-solid', navAlwaysSolid || window.scrollY > 40);
  }
  window.addEventListener('scroll', setSolid, { passive: true });
  setSolid();

  function closeMenu() {
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    nav.classList.remove('menu-open');
  }
  burger.addEventListener('click', function () {
    var open = !burger.classList.contains('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenu.classList.toggle('is-open', open);
    nav.classList.toggle('menu-open', open);
  });
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ---------- Hero video ---------- */
  /* Skipped on narrow viewports, when reduced motion is requested, and on
     metered or slow connections — the poster carries the hero on its own. */
  var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var frugalNetwork = !!conn && (conn.saveData === true ||
    /(^|-)(slow-)?2g$|^3g$/.test(conn.effectiveType || ''));
  var heroVideo = document.querySelector('[data-hero-video]');
  var wantsVideo = !reduceMotion && !frugalNetwork &&
    !(window.matchMedia && window.matchMedia('(max-width: 860px)').matches);
  if (heroVideo && wantsVideo) {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    var src = document.createElement('source');
    // Full HD only where the screen can show it; a lighter 1280px cut otherwise.
    var px = window.innerWidth * (window.devicePixelRatio || 1);
    src.src = px > 1600 ? 'assets/hero-video.mp4' : 'assets/hero-video-1280.mp4';
    src.type = 'video/mp4';
    heroVideo.appendChild(src);
    heroVideo.load();
    var tryPlay = function () {
      heroVideo.muted = true;
      var p = heroVideo.play();
      if (p && p.then) {
        p.then(function () { heroVideo.classList.add('is-playing'); }).catch(function () {});
      } else {
        heroVideo.classList.add('is-playing');
      }
    };
    heroVideo.addEventListener('canplay', tryPlay, { once: true });
    heroVideo.addEventListener('pause', function () {
      if (heroVideo.isConnected) setTimeout(function () { if (heroVideo.paused) tryPlay(); }, 300);
    });
  }

  /* ---------- Scroll reveal ---------- */
  if (!reduceMotion) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.92) {
        el.classList.add('pre-reveal');
        revealIO.observe(el);
      }
    });
  }

  /* ---------- Tabs ---------- */
  var tabbar = document.querySelector('[data-tabbar]');
  if (tabbar) {
    var tabButtons = Array.prototype.slice.call(tabbar.querySelectorAll('[data-tab]'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-panel]'));
    function selectTab(i) {
      tabButtons.forEach(function (btn, idx) {
        var active = idx === i;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
        // Roving tabindex: only the selected tab sits in the tab order.
        btn.setAttribute('tabindex', active ? '0' : '-1');
      });
      panels.forEach(function (panel) {
        panel.classList.toggle('is-active', +panel.getAttribute('data-panel') === i);
      });
    }
    tabButtons.forEach(function (btn, idx) {
      btn.addEventListener('click', function () { selectTab(idx); });
    });
    tabbar.addEventListener('keydown', function (e) {
      var idx = tabButtons.findIndex(function (b) { return b.classList.contains('is-active'); });
      if (e.key === 'ArrowRight') { selectTab((idx + 1) % tabButtons.length); tabButtons[(idx + 1) % tabButtons.length].focus(); }
      if (e.key === 'ArrowLeft') { selectTab((idx - 1 + tabButtons.length) % tabButtons.length); tabButtons[(idx - 1 + tabButtons.length) % tabButtons.length].focus(); }
    });
  }

  /* ---------- Company page: timeline ---------- */
  /* A tablist of years drives one visible panel. Arrow keys move between
     years (roving tabindex); the orange rail fill grows to the active year. */
  var tlRail = document.querySelector('[data-timeline]');
  if (tlRail) {
    var tlYears = Array.prototype.slice.call(tlRail.querySelectorAll('[role="tab"]'));
    var tlPanels = Array.prototype.slice.call(document.querySelectorAll('[data-tl-panel]'));
    var tlFill = tlRail.querySelector('.tl-line-fill');
    function selectYear(i, focus) {
      tlYears.forEach(function (btn, idx) {
        var on = idx === i;
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
        btn.setAttribute('tabindex', on ? '0' : '-1');
        if (on && focus) btn.focus();
        if (on && typeof btn.scrollIntoView === 'function' && window.innerWidth <= 960) {
          btn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      });
      tlPanels.forEach(function (panel, idx) {
        if (idx === i) panel.setAttribute('data-active', ''); else panel.removeAttribute('data-active');
        panel.hidden = idx !== i;
      });
      if (tlFill && tlYears.length > 1) {
        tlFill.style.height = (i / (tlYears.length - 1) * 100) + '%';
      }
    }
    tlYears.forEach(function (btn, idx) {
      btn.addEventListener('click', function () { selectYear(idx, false); });
    });
    tlRail.addEventListener('keydown', function (e) {
      var cur = tlYears.findIndex(function (b) { return b.getAttribute('aria-selected') === 'true'; });
      var next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (cur + 1) % tlYears.length;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (cur - 1 + tlYears.length) % tlYears.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tlYears.length - 1;
      if (next !== null) { e.preventDefault(); selectYear(next, true); }
    });
    selectYear(0, false);
  }

  /* ---------- Company page: hero parallax ---------- */
  /* The background layer scrolls at a third of page speed. Off on narrow
     viewports (the CSS also pins it) and for reduced-motion visitors. */
  var pxBg = document.querySelector('[data-parallax]');
  if (pxBg && !reduceMotion && window.innerWidth > 860) {
    var pxTicking = false;
    var pxHero = pxBg.parentElement;
    function parallax() {
      pxTicking = false;
      var r = pxHero.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      pxBg.style.transform = 'translate3d(0,' + (-r.top * 0.35).toFixed(1) + 'px,0)';
    }
    window.addEventListener('scroll', function () {
      if (!pxTicking) { pxTicking = true; requestAnimationFrame(parallax); }
    }, { passive: true });
    parallax();
  }

  /* ---------- Client logo rail ---------- */
  /* The rail scrolls by CSS transform, so loading="lazy" never fires for the
     chips sitting off-screen and they would scroll in blank. Load the whole
     set once the band comes into view instead, so the bytes stay off the
     critical path without leaving gaps. */
  var logoImgs = document.querySelectorAll('img[data-src]');
  if (logoImgs.length) {
    var loadLogos = function () {
      logoImgs.forEach(function (img) {
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      });
    };
    var band = document.querySelector('.marquee-mask');
    if (band && 'IntersectionObserver' in window) {
      var logoIO = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
          loadLogos();
          logoIO.disconnect();
        }
      }, { rootMargin: '400px' });
      logoIO.observe(band);
    } else {
      loadLogos();
    }
  }

  /* ---------- Footprint: category filter + map ---------- */
  /* Order must match the baked points array in js/libya-geo.js. */
  var SITES = [
    { cat: 'hq',   name: 'Tripoli',          d: 'Headquarters on Ibne Batuta St., Siyahiya, Tripoli — corporate leadership, engineering, procurement and project management for nationwide operations.' },
    { cat: 'hq',   name: 'Benghazi',         d: 'Regional branch office serving Eastern Libya — client liaison, logistics coordination and rapid mobilisation for the Sirte Basin and eastern concessions.' },
    { cat: 'camp', name: 'Shararah Camp',    d: 'Fully equipped operational camp at the Shararah Oilfield supporting long-term rehabilitation and construction works in the southwest.' },
    { cat: 'camp', name: 'Gialo Camp',       d: 'Remote camp at the Gialo Oilfield housing deployed technical teams serving the eastern producing fields.' },
    { cat: 'camp', name: 'Srir-Msella Camp', d: 'Southeastern camp serving the Srir and Messla fields — deep-desert logistics and multi-year maintenance support.' },
    { cat: 'site', name: 'Mellitah',         d: 'Measurement and automation works at the Mellitah complex, including the integration of international metering systems through local execution.' },
    { cat: 'site', name: 'Tobruk',           d: 'Export-terminal support at Marsa el-Harige near Tobruk, at Libya\u2019s eastern gateway.' },
    { cat: 'site', name: 'Dahra',            d: 'Maintenance and production-support works at the Dahra Oilfield in central Libya.' },
    { cat: 'site', name: 'Ras Lanuf',        d: 'Works at the Ras Lanuf refinery and petrochemical complex — turnaround support, fabrication and coastal logistics.' },
    { cat: 'site', name: 'Nafoora',          d: 'Operations and maintenance support at the Nafoora Oilfield in the eastern Sirte Basin.' },
    { cat: 'site', name: 'Zelten',           d: 'Field works at the Zelten (Nasser) Oilfield, one of the Sirte Basin\u2019s long-established producing areas.' }
  ];

  var CATS = [
    { key: 'hq',   label: 'Headquarters & Branches' },
    { key: 'camp', label: 'Operational Camps' },
    { key: 'site', label: 'Project Sites' }
  ];

  var filterBar = document.querySelector('[data-map-filters]');
  var mapPanel = document.querySelector('[data-map-panel]');
  var mapDetail = document.querySelector('[data-map-detail]');
  var activeCat = 'hq';
  var activeSite = 0;
  var geo = null; // { path, pts: [[x,y], ...] } — indexes align with SITES

  function catLabel(key) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].key === key) return CATS[i].label;
    return '';
  }

  function indexesFor(cat) {
    var out = [];
    SITES.forEach(function (site, i) { if (site.cat === cat) out.push(i); });
    return out;
  }

  function renderFilters() {
    if (!filterBar) return;
    filterBar.innerHTML = '';
    CATS.forEach(function (cat) {
      var btn = document.createElement('button');
      btn.type = 'button';
      var on = cat.key === activeCat;
      btn.className = on ? 'is-active' : '';
      // A filter group, not a tablist: these control the map, not a panel.
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.innerHTML = cat.label + '<span class="n">' + indexesFor(cat.key).length + '</span>';
      btn.addEventListener('click', function () { setActiveCat(cat.key); });
      filterBar.appendChild(btn);
    });
  }

  function renderDetail() {
    if (!mapDetail) return;
    var site = SITES[activeSite];
    mapDetail.innerHTML =
      '<div class="cat">' + catLabel(site.cat) + '</div>' +
      '<h3>' + site.name + '</h3>' +
      '<p></p>';
    mapDetail.querySelector('p').textContent = site.d;
  }

  function renderMap() {
    if (!mapPanel) return;
    if (!geo) { mapPanel.innerHTML = ''; return; }

    var shown = indexesFor(activeCat);
    var pins = geo.pts;

    // Dashed arcs run from Tripoli (the HQ, index 0) out to each shown site.
    var links = shown.filter(function (i) { return i !== 0; }).map(function (i) {
      var x0 = pins[0][0], y0 = pins[0][1], x1 = pins[i][0], y1 = pins[i][1];
      var mx = (x0 + x1) / 2;
      var my = (y0 + y1) / 2 - Math.min(60, Math.hypot(x1 - x0, y1 - y0) * 0.18);
      return 'M' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + x1.toFixed(1) + ',' + y1.toFixed(1);
    });

    mapPanel.innerHTML = [
      '<svg viewBox="0 0 800 640" aria-hidden="true">',
      '<path d="' + geo.path + '" fill="#dbe3e6" stroke="#b6c2c6" stroke-width="1.5" stroke-linejoin="round"></path>',
      links.map(function (d) {
        return '<path d="' + d + '" fill="none" stroke="#f26522" stroke-width="1.5" stroke-dasharray="3 8" stroke-linecap="round" opacity="0.45" style="animation:' + (reduceMotion ? 'none' : 'wzDash 1.6s linear infinite') + '"></path>';
      }).join(''),
      '</svg>'
    ].join('');

    shown.forEach(function (i) {
      var pt = pins[i];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'map-pin' + (i === activeSite ? ' is-active' : '');
      btn.style.left = (pt[0] / 8).toFixed(2) + '%';
      btn.style.top = (pt[1] / 6.4).toFixed(2) + '%';
      btn.setAttribute('aria-label', SITES[i].name);
      btn.title = SITES[i].name;
      btn.innerHTML = '<span class="dot"></span><span class="pin-name">' + SITES[i].name + '</span>';
      btn.addEventListener('click', function () { setActiveSite(i); });
      mapPanel.appendChild(btn);
    });
  }

  function setActiveSite(i) {
    activeSite = i;
    renderMap();
    renderDetail();
  }

  function setActiveCat(key) {
    activeCat = key;
    var first = indexesFor(key)[0];
    if (typeof first === 'number') activeSite = first;
    renderFilters();
    renderMap();
    renderDetail();
  }

  renderFilters();
  renderDetail();

  // Geometry is pre-projected at build time (see js/libya-geo.js), so the map
  // draws immediately with no network request and no mapping library. If that
  // file is ever missing the section degrades to the filter and detail panel.
  /* ---------- Capabilities page: sticky console ---------- */
  /* The index item for the block nearest the top of the viewport is marked
     current; clicking an item scrolls to its block. */
  var capIndex = document.querySelector('[data-cap-index]');
  if (capIndex) {
    var capLinks = Array.prototype.slice.call(capIndex.querySelectorAll('[data-cap-link]'));
    var capBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-cap-block]'));
    function setCapCurrent(id) {
      capLinks.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        if (on) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); }
        if (on && window.innerWidth <= 960) {
          a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      });
    }
    var capTicking = false;
    function capTrack() {
      capTicking = false;
      // Current = the last block whose top has crossed the reading line.
      var line = window.innerHeight * 0.4, best = capBlocks[0];
      capBlocks.forEach(function (b) {
        if (b.getBoundingClientRect().top <= line) best = b;
      });
      if (best) setCapCurrent(best.id);
    }
    window.addEventListener('scroll', function () {
      if (!capTicking) { capTicking = true; requestAnimationFrame(capTrack); }
    }, { passive: true });
    capLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.getElementById(a.getAttribute('href').slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
        history.replaceState(null, '', '#' + target.id);
        setCapCurrent(target.id);
      });
    });
    capTrack();
  }

  if (window.WAZEN_LIBYA && window.WAZEN_LIBYA.outline) {
    geo = { path: window.WAZEN_LIBYA.outline, pts: window.WAZEN_LIBYA.points };
    renderMap();
  }
})();

/* Track Record: filter project cards by lifecycle stage. A link such as
   track-record.html#build opens the page pre-filtered. */
(function () {
  var bar = document.querySelector('[data-project-filters]');
  if (!bar) return;
  var buttons = Array.prototype.slice.call(bar.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-project]'));
  function apply(key) {
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === key ? 'true' : 'false'); });
    cards.forEach(function (c) { c.hidden = !(key === 'all' || c.getAttribute('data-cat') === key); });
  }
  buttons.forEach(function (b) {
    b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); });
  });
  var hash = (location.hash || '').replace('#', '');
  if (['build', 'integrate', 'operate'].indexOf(hash) !== -1) apply(hash);
})();

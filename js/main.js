(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav: solid on scroll + mobile menu ---------- */
  var nav = document.querySelector('[data-nav]');
  var burger = document.querySelector('[data-nav-burger]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  function setSolid() {
    var solid = window.scrollY > 40;
    nav.classList.toggle('is-solid', solid);
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

  /* ---------- Hero video (skipped on narrow / mobile viewports) ---------- */
  var heroVideo = document.querySelector('[data-hero-video]');
  if (heroVideo && !(window.matchMedia && window.matchMedia('(max-width: 860px)').matches)) {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    var src = document.createElement('source');
    src.src = 'assets/hero-video.mp4';
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

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.target._done) return;
        entry.target._done = true;
        var target = +entry.target.getAttribute('data-count');
        if (reduceMotion) { entry.target.textContent = target; return; }
        var t0 = performance.now(), dur = 1400;
        function tick(t) {
          var p = Math.min(1, (t - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          entry.target.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { counterIO.observe(c); });
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

  /* ---------- Footprint: locations list + map ---------- */
  var LOCS = [
    { name: 'Wazen HQ — Tripoli / Zawiya', lat: 32.88, lon: 13.19, d: 'Headquarters on Ibne Batuta St., Siyahiya, Tripoli — corporate leadership, engineering, procurement and project management for nationwide operations.' },
    { name: 'Benghazi Office', lat: 32.12, lon: 20.07, d: 'Regional branch serving Eastern Libya — client liaison, logistics coordination and rapid mobilization for the Sirte Basin and eastern concessions.' },
    { name: 'Shararah Camp', lat: 26.6, lon: 12.1, d: 'Fully equipped remote camp at the Shararah Oilfield supporting long-term rehabilitation and construction operations in the southwest.' },
    { name: 'Dahra Camp', lat: 29.5, lon: 17.8, d: 'Field camp at the Dahra Oilfield sustaining maintenance and production-support crews in central Libya.' },
    { name: 'Ras Lanuf Camp', lat: 30.5, lon: 18.53, d: 'Coastal camp serving the Ras Lanuf Refinery — turnaround support, fabrication and marine-adjacent logistics.' },
    { name: 'Gialo 59 Camp', lat: 28.7, lon: 21.5, d: 'Remote camp at the Gialo Oilfield housing deployed technical teams for the eastern producing fields.' },
    { name: 'Nafoora Camp', lat: 29.25, lon: 21.35, d: 'Camp at the Nafoora Oilfield supporting continuous operations and maintenance crews.' },
    { name: 'Srir / Messla Camp', lat: 27.65, lon: 22.42, d: 'Southeastern camp serving the Srir Refinery and Messla field — deep-desert logistics and multi-year maintenance support.' },
    { name: 'Marsa Camp', lat: 32.07, lon: 24.0, d: 'Camp at Marsa el-Harige near Tobruk — export-terminal support at Libya’s eastern gateway.' }
  ];

  var locList = document.querySelector('[data-loc-list]');
  var mapPanel = document.querySelector('[data-map-panel]');
  var activeLoc = 0;
  var geo = null; // { path, pts: [[x,y], ...] }

  function renderLocList() {
    if (!locList) return;
    locList.innerHTML = '';
    LOCS.forEach(function (loc, i) {
      var row = document.createElement('div');
      row.className = 'loc-row' + (i === activeLoc ? ' is-active' : '');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-expanded', i === activeLoc ? 'true' : 'false');
      btn.innerHTML =
        '<span class="idx">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="name">' + loc.name + '</span>' +
        '<span class="chev">&rsaquo;</span>';
      btn.addEventListener('click', function () { setActiveLoc(i); });
      row.appendChild(btn);
      if (i === activeLoc) {
        var p = document.createElement('p');
        p.className = 'desc';
        p.textContent = loc.d;
        row.appendChild(p);
      }
      locList.appendChild(row);
    });
  }

  function renderMap() {
    if (!mapPanel) return;
    if (!geo) { mapPanel.innerHTML = ''; return; }
    var pins = geo.pts;
    var links = pins.slice(1).map(function (pt) {
      var x0 = pins[0][0], y0 = pins[0][1], x1 = pt[0], y1 = pt[1];
      var mx = (x0 + x1) / 2;
      var my = (y0 + y1) / 2 - Math.min(60, Math.hypot(x1 - x0, y1 - y0) * 0.18);
      return 'M' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + x1.toFixed(1) + ',' + y1.toFixed(1);
    });

    var svgParts = [
      '<svg viewBox="0 0 800 640" aria-hidden="true">',
      '<path d="' + geo.path + '" fill="#f5efe7" stroke="#dcd1c3" stroke-width="1.5" stroke-linejoin="round"></path>',
      links.map(function (d) {
        return '<path d="' + d + '" fill="none" stroke="#f26522" stroke-width="1.5" stroke-dasharray="3 8" stroke-linecap="round" opacity="0.45" style="animation:' + (reduceMotion ? 'none' : 'wzDash 1.6s linear infinite') + '"></path>';
      }).join(''),
      '</svg>'
    ].join('');

    mapPanel.innerHTML = svgParts;

    LOCS.forEach(function (loc, i) {
      var pt = pins[i];
      var x = +(pt[0] / 8).toFixed(2), y = +(pt[1] / 6.4).toFixed(2);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'map-pin' + (i === activeLoc ? ' is-active' : '');
      btn.style.left = x + '%';
      btn.style.top = y + '%';
      btn.setAttribute('aria-label', loc.name);
      btn.title = loc.name;
      btn.innerHTML = '<span class="dot"></span>';
      btn.addEventListener('click', function () { setActiveLoc(i); });
      mapPanel.appendChild(btn);
    });
  }

  function setActiveLoc(i) {
    activeLoc = i;
    renderLocList();
    renderMap();
  }

  renderLocList();

  // Geometry is pre-projected at build time (see js/libya-geo.js), so the map
  // draws immediately with no network request and no mapping library. If that
  // file is ever missing the section degrades to the location list alone.
  if (window.WAZEN_LIBYA && window.WAZEN_LIBYA.outline) {
    geo = { path: window.WAZEN_LIBYA.outline, pts: window.WAZEN_LIBYA.points };
    renderMap();
  }
})();

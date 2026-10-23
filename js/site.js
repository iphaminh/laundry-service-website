/* Southern Star Coin Laundry — site.js
   Dependency-free. Handles: sticky header shadow, mobile nav, pricing tabs,
   reviews prev/next, the pickup form (builds a mailto: link), and the hero
   background video. */
(function () {
  'use strict';

  var doc = document;
  var html = doc.documentElement;
  html.classList.add('js');

  // iOS Safari only applies :active press feedback when a touch listener exists.
  doc.addEventListener('touchstart', function () {}, { passive: true });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* 1. Header: shadow once the page has scrolled -------------------------- */
  var header = doc.querySelector('.site-header');

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  if (header) {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* 2. Mobile navigation --------------------------------------------------- */
  var toggle = doc.querySelector('.nav__toggle');
  var panel = toggle && doc.getElementById(toggle.getAttribute('aria-controls'));

  function setNav(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  function navIsOpen() {
    return header.classList.contains('is-open');
  }

  if (header && toggle && panel) {
    toggle.addEventListener('click', function () {
      setNav(!navIsOpen());
    });

    // Close after choosing a link
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navIsOpen()) {
        setNav(false);
        toggle.focus();
      }
    });

    doc.addEventListener('click', function (e) {
      if (navIsOpen() && !header.contains(e.target)) setNav(false);
    });

    var desktop = window.matchMedia('(min-width: 62em)');
    var onDesktop = function (e) { if (e.matches) setNav(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onDesktop);
    else desktop.addListener(onDesktop);
  }

  /* 3. Tabs (pricing.html) ------------------------------------------------- */
  doc.querySelectorAll('[data-tabs]').forEach(function (tabs) {
    var buttons = Array.prototype.slice.call(tabs.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(tabs.querySelectorAll('[role="tabpanel"]'));
    if (!buttons.length || buttons.length !== panels.length) return;

    function select(index, focus) {
      buttons.forEach(function (button, i) {
        var on = i === index;
        button.setAttribute('aria-selected', on ? 'true' : 'false');
        button.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
        if (on && focus) button.focus();
      });
    }

    buttons.forEach(function (button, i) {
      button.addEventListener('click', function () { select(i, false); });
      button.addEventListener('keydown', function (e) {
        var next = i;
        if (e.key === 'ArrowRight') next = (i + 1) % buttons.length;
        else if (e.key === 'ArrowLeft') next = (i - 1 + buttons.length) % buttons.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = buttons.length - 1;
        else return;
        e.preventDefault();
        select(next, true);
      });
    });

    // Open the panel named in the URL hash (e.g. pricing.html#coats), else the first
    var start = 0;
    panels.forEach(function (p, i) { if (location.hash && '#' + p.id === location.hash) start = i; });
    select(start, false);
  });

  /* 4. Reviews: prev / next scroll the snap row ---------------------------- */
  doc.querySelectorAll('[data-scroller]').forEach(function (scroller) {
    var track = scroller.querySelector('[data-track]');
    var prev = scroller.querySelector('[data-prev]');
    var next = scroller.querySelector('[data-next]');
    if (!track || !prev || !next) return;

    function step() {
      var card = track.firstElementChild;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 24;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    }

    function go(direction) {
      track.scrollBy({ left: direction * step(), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }

    function update() {
      var max = track.scrollWidth - track.clientWidth - 1;
      prev.disabled = track.scrollLeft <= 0;
      next.disabled = track.scrollLeft >= max;
    }

    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* 5. Pickup request form: build a mailto: link and open it --------------- */
  var form = doc.getElementById('pickup-form');

  if (form) {
    var EMAIL = 'southernstarcoinlaundry@gmail.com';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;

      var value = function (name) {
        var field = form.elements[name];
        return field && field.value ? field.value.trim() : '';
      };

      function build(notes) {
        var lines = [
          'Pickup request from the website',
          '',
          'Name: ' + value('name'),
          'Phone: ' + value('phone'),
          'Pickup address: ' + value('address'),
          'Service: ' + value('service'),
          'Preferred day: ' + (value('day') || '-'),
          'Notes: ' + (notes || '-')
        ];
        return 'mailto:' + EMAIL +
          '?subject=' + encodeURIComponent('Pickup request') +
          '&body=' + encodeURIComponent(lines.join('\r\n'));
      }

      // Some mail apps (Outlook on Windows) cut off mailto: links over ~2,000
      // characters, so shorten the notes until the link fits and say so.
      var MAX_HREF = 1800;
      var notes = value('notes');
      var href = build(notes);
      var trimmed = false;
      while (href.length > MAX_HREF && notes.length > 1) {
        notes = notes.slice(0, Math.floor(notes.length * 0.9));
        trimmed = true;
        href = build(notes + ' […]');
      }

      // Keep a visible link in case the email app does not open
      var fallback = doc.getElementById('pickup-fallback');
      var link = doc.getElementById('pickup-mailto');
      var trimNote = doc.getElementById('pickup-trimmed');
      if (link) link.href = href;
      if (fallback) fallback.hidden = false;
      if (trimNote) trimNote.hidden = !trimmed;
      form.setAttribute('data-mailto', href);

      window.location.href = href;
    });
  }

  /* 6. Hero video ----------------------------------------------------------
     The still photo is the page's first paint. The loop only loads after the
     page has loaded, never with reduced motion or Data Saver on, pauses while
     scrolled out of view, and has a pause button (WCAG 2.2.2). */
  var video = doc.querySelector('.hero__video');
  var pauseBtn = doc.querySelector('.hero__pause');

  if (video) {
    var conn = navigator.connection || {};
    var saveData = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
    var userPaused = false;
    var inView = true;

    var tryPlay = function () {
      if (userPaused || !inView || reduceMotion.matches) return;
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    };

    var setPaused = function (paused) {
      userPaused = paused;
      pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      pauseBtn.querySelector('.visually-hidden').textContent =
        paused ? 'Play background video' : 'Pause background video';
      if (paused) video.pause(); else tryPlay();
    };

    // Files: img/hero-loop-{854|1280}.{mp4|webm}. MP4 (H.264) where supported,
    // else WebM (VP9); the smaller size on phones.
    var start = function () {
      if (reduceMotion.matches || saveData || video.getAttribute('src')) return;
      var ext = video.canPlayType('video/mp4; codecs="avc1.4D401F"') ? 'mp4'
        : video.canPlayType('video/webm; codecs="vp9"') ? 'webm' : '';
      if (!ext) return;
      var size = window.matchMedia('(max-width: 47.999em)').matches ? 854 : 1280;
      video.src = video.getAttribute('data-src') + '-' + size + '.' + ext;
      tryPlay();
    };

    video.addEventListener('playing', function () {
      video.classList.add('is-playing');
      if (pauseBtn) pauseBtn.hidden = false;
    });

    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () { setPaused(!userPaused); });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (!video.getAttribute('src')) return;
        if (inView) tryPlay(); else video.pause();
      }).observe(video);
    }

    var onMotion = function () {
      if (reduceMotion.matches) {
        video.pause();
        video.classList.remove('is-playing');
        if (pauseBtn) pauseBtn.hidden = true;
      } else if (video.getAttribute('src')) {
        tryPlay();
      } else {
        start();
      }
    };
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onMotion);
    else if (reduceMotion.addListener) reduceMotion.addListener(onMotion);

    if (doc.readyState === 'complete') start();
    else window.addEventListener('load', start);
  }
})();

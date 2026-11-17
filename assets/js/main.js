/* Priyanka Sharma — site interactions.
   Plain JavaScript, no dependencies. Every feature is optional: the pages
   remain fully readable if this file fails to load or stops part-way. */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  // Older Safari only has addListener on media queries.
  const onMediaChange = (query, handler) => {
    if (query.addEventListener) query.addEventListener('change', handler);
    else if (query.addListener) query.addListener(handler);
  };

  /* ---- Fade sections in as they scroll into view -------------------------- */

  const revealItems = $$('.reveal');
  const showAll = () => revealItems.forEach((item) => item.classList.add('is-in'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -7% 0px', threshold: 0 }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    showAll();
  }
  window.addEventListener('beforeprint', showAll);

  /* ---- Header: hairline once the page is scrolled ------------------------- */

  const header = $('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile menu -------------------------------------------------------- */

  const navToggle = $('.nav-toggle');
  const nav = $('#site-nav');
  if (navToggle && nav) {
    const isOpen = () => nav.classList.contains('is-open');
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    navToggle.addEventListener('click', () => setOpen(!isOpen()));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        navToggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (isOpen() && header && !header.contains(event.target)) setOpen(false);
    });

    // tabbing out of the header closes the menu, so focus never ends up hidden behind it
    if (header) {
      header.addEventListener('focusout', (event) => {
        if (isOpen() && event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
      });
    }

    // a page restored from the back/forward cache should not come back with the menu open
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) setOpen(false);
    });

    // keep in step with the menu breakpoint in style.css (60em)
    onMediaChange(window.matchMedia('(min-width: 60.01em)'), (event) => {
      if (event.matches) setOpen(false);
    });
  }

  /* ---- Image viewer (lightbox) --------------------------------------------
     Any link with data-lightbox="group" opens its image in a viewer.
     Links that share a group name can be stepped through with the arrows. */

  const triggers = $$('a[data-lightbox]');
  if (triggers.length && typeof HTMLDialogElement === 'function') {
    const icon = (paths) =>
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

    const dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', 'Image viewer');
    dialog.innerHTML = `
      <div class="lightbox__inner">
        <div class="lightbox__stage"><img class="lightbox__img" alt=""></div>
        <div class="lightbox__bar">
          <p class="lightbox__caption" aria-live="polite"></p>
          <div class="lightbox__controls">
            <button type="button" class="lightbox__btn" data-lb="prev" aria-label="Previous image">${icon('<path d="m15 18-6-6 6-6"/>')}</button>
            <span class="lightbox__count"></span>
            <button type="button" class="lightbox__btn" data-lb="next" aria-label="Next image">${icon('<path d="m9 18 6-6-6-6"/>')}</button>
            <button type="button" class="lightbox__btn" data-lb="close" aria-label="Close image viewer">${icon('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')}</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(dialog);

    const stage = $('.lightbox__stage', dialog);
    const image = $('.lightbox__img', dialog);
    const caption = $('.lightbox__caption', dialog);
    const count = $('.lightbox__count', dialog);
    const prev = $('[data-lb="prev"]', dialog);
    const next = $('[data-lb="next"]', dialog);
    const close = $('[data-lb="close"]', dialog);

    // a large image can take a moment: say so instead of showing an empty screen
    const doneLoading = () => stage.classList.remove('is-loading');
    image.addEventListener('load', doneLoading);
    image.addEventListener('error', doneLoading);

    let group = [];
    let index = 0;
    let opener = null;

    const show = (position) => {
      index = (position + group.length) % group.length;
      const link = group[index];
      const thumb = $('img', link);
      const text = link.dataset.caption || (thumb && thumb.alt) || '';
      image.src = link.href;
      stage.classList.toggle('is-loading', !image.complete);
      image.alt = (thumb && thumb.alt) || text;
      const many = group.length > 1;
      prev.hidden = next.hidden = count.hidden = !many;
      count.textContent = many ? `${index + 1} / ${group.length}` : '';
      caption.textContent = text;
    };

    triggers.forEach((link) => {
      link.addEventListener('click', (event) => {
        // leave modified clicks alone so "open in new tab" still works
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        opener = link;
        group = triggers.filter((item) => item.dataset.lightbox === link.dataset.lightbox);
        show(group.indexOf(link));
        dialog.showModal();
        close.focus();
      });
    });

    prev.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    close.addEventListener('click', () => dialog.close());

    // clicking the area around the image closes the viewer
    dialog.addEventListener('click', (event) => {
      const target = event.target;
      if (target === dialog || target.classList.contains('lightbox__inner') || target.classList.contains('lightbox__stage')) {
        dialog.close();
      }
    });

    dialog.addEventListener('keydown', (event) => {
      if (group.length < 2) return;
      if (event.key === 'ArrowLeft') show(index - 1);
      if (event.key === 'ArrowRight') show(index + 1);
    });

    dialog.addEventListener('close', () => {
      image.removeAttribute('src');
      doneLoading();
      if (opener) opener.focus();
    });
  }

  /* ---- Document previews (Industry page) -----------------------------------
     The Google Slides / Drive viewer is only loaded when a visitor asks for
     it, which keeps the page fast and avoids third-party requests up front. */

  $$('.sample').forEach((sample) => {
    const box = $('.embed[data-embed-src]', sample);
    if (!box) return;
    const buttons = $$('[data-embed-load]', sample);

    const load = () => {
      if (box.dataset.loaded) return;
      box.dataset.loaded = 'true';
      const frame = document.createElement('iframe');
      frame.src = box.dataset.embedSrc;
      frame.title = box.dataset.embedTitle || 'Document preview';
      frame.allowFullscreen = true;
      box.replaceChildren(frame);
      // the button that was pressed is gone now: hand keyboard focus to the preview
      frame.focus();
      buttons.forEach((button) => {
        if (!box.contains(button)) button.hidden = true;
      });
    };

    buttons.forEach((button) => button.addEventListener('click', load));
  });

  /* ---- Small helpers ------------------------------------------------------ */

  // "Copy" buttons: <button data-copy="text to copy">
  $$('[data-copy]').forEach((button) => {
    const original = button.textContent;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.textContent = 'Copied';
      } catch (error) {
        // select the address so that the keyboard shortcut has something to copy
        const address = button.previousElementSibling;
        if (address) window.getSelection().selectAllChildren(address);
        button.textContent = 'Address selected';
      }
      setTimeout(() => {
        button.textContent = original;
      }, 2200);
    });
  });

  // Print buttons: <button data-print>
  $$('[data-print]').forEach((button) => button.addEventListener('click', () => window.print()));

  // Keeps the footer year current.
  $$('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  // Tells the inline script in <head> that this file ran to the end (see the safety net there).
  // It is set last on purpose: if anything above throws, the safety net still restores the plain
  // layout. "js" is added again in case the safety net had already removed it on a slow connection.
  root.classList.add('js', 'js-ready');
})();

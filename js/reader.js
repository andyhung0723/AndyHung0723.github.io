'use strict';

const sidebar = document.getElementById('sidebar');
const scrim = document.querySelector('.scrim');
const menuButton = document.querySelector('.menu-btn');

const isTyping = (target) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

const safeStorage = (storage, action) => {
  try {
    return action(storage);
  } catch {
    return null;
  }
};

/* ---------- Sidebar: tabs, scroll memory, active item ---------- */
function selectStream(streamId) {
  sidebar.querySelectorAll('[data-stream-tab]').forEach((tab) => {
    tab.setAttribute('aria-selected', String(tab.dataset.streamTab === streamId));
  });
  sidebar.querySelectorAll('.stream-panel').forEach((panel) => {
    panel.hidden = panel.dataset.stream !== streamId;
  });
}

function revealActivePost() {
  const active = sidebar.querySelector('.post-link[aria-current="page"]');
  if (!active) return;
  const { top, bottom } = active.getBoundingClientRect();
  const bounds = sidebar.getBoundingClientRect();
  if (top < bounds.top + 120 || bottom > bounds.bottom - 24) {
    sidebar.scrollTop += top - bounds.top - sidebar.clientHeight / 3;
  }
}

sidebar.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-stream-tab]');
  if (!tab || event.metaKey || event.ctrlKey || event.shiftKey) return;
  event.preventDefault();
  selectStream(tab.dataset.streamTab);
});

window.addEventListener('pagehide', () => {
  safeStorage(sessionStorage, (s) => s.setItem('sidebar-scroll', String(sidebar.scrollTop)));
});

revealActivePost();

/* ---------- Mobile drawer ---------- */
function setDrawer(open) {
  sidebar.classList.toggle('is-open', open);
  scrim.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  if (open) {
    revealActivePost();
    (sidebar.querySelector('.post-link[aria-current="page"]') ?? sidebar.querySelector('a'))?.focus({
      preventScroll: true,
    });
  } else if (sidebar.contains(document.activeElement)) {
    menuButton.focus();
  }
}

menuButton.addEventListener('click', () => setDrawer(!sidebar.classList.contains('is-open')));
scrim.addEventListener('click', () => setDrawer(false));

/* ---------- Theme ---------- */
document.querySelector('.theme-btn').addEventListener('click', () => {
  const isDark =
    document.documentElement.dataset.theme === 'dark' ||
    (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  const next = isDark ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  safeStorage(localStorage, (s) => s.setItem('theme', next));
});

/* ---------- TOC scrollspy ---------- */
const tocLinks = [...document.querySelectorAll('.toc-rail .toc-link')];
if (tocLinks.length) {
  const linkById = new Map(tocLinks.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
  const headings = [...document.querySelectorAll('.prose :is(h2, h3, h4)[id]')].filter((h) =>
    linkById.has(h.id),
  );
  let currentLink = null;
  let frame = 0;

  const markCurrent = () => {
    frame = 0;
    const threshold = innerHeight * 0.3;
    const passed = headings.filter((h) => h.getBoundingClientRect().top <= threshold);
    const link = linkById.get((passed.at(-1) ?? headings[0])?.id);
    if (link === currentLink) return;
    currentLink?.removeAttribute('aria-current');
    link?.setAttribute('aria-current', 'true');
    currentLink = link;
  };

  addEventListener('scroll', () => (frame ||= requestAnimationFrame(markCurrent)), { passive: true });
  markCurrent();
}

/* ---------- Code copy ---------- */
document.querySelectorAll('.prose pre').forEach((pre) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'copy-btn';
  button.textContent = '複製';
  button.addEventListener('click', async () => {
    const code = pre.querySelector('code') ?? pre;
    try {
      await navigator.clipboard.writeText(code.innerText);
      button.textContent = '已複製';
    } catch {
      button.textContent = '無法複製';
    }
    setTimeout(() => (button.textContent = '複製'), 1600);
  });
  pre.append(button);
});

/* ---------- Search (content.json, loaded on first focus) ---------- */
const searchInput = document.getElementById('search');
const searchResults = document.getElementById('search-results');
let searchIndex = null;
let selectedHit = -1;

const decodeEntities = (value) =>
  new DOMParser().parseFromString(value, 'text/html').documentElement.textContent;

const loadSearchIndex = () =>
  (searchIndex ??= fetch('/content.json')
    .then((response) => response.json())
    .then((data) =>
      (Array.isArray(data) ? data : data.posts).map((post) => ({
        title: post.title,
        url: `/${post.path}`.replace(/\/{2,}/g, '/'),
        text: decodeEntities(post.text ?? ''),
        haystack: `${post.title}\n${decodeEntities(post.text ?? '')}`.toLocaleLowerCase(),
      })),
    ));

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const highlight = (text, query) => {
  const index = text.toLocaleLowerCase().indexOf(query);
  if (index < 0) return escapeHtml(text);
  return (
    escapeHtml(text.slice(0, index)) +
    `<mark>${escapeHtml(text.slice(index, index + query.length))}</mark>` +
    escapeHtml(text.slice(index + query.length))
  );
};

const snippet = (text, query) => {
  const index = text.toLocaleLowerCase().indexOf(query);
  if (index < 0) return text.slice(0, 80);
  const start = Math.max(0, index - 30);
  return (start > 0 ? '…' : '') + text.slice(start, index + query.length + 50).replace(/\s+/g, ' ');
};

function closeSearch() {
  searchResults.hidden = true;
  searchInput.setAttribute('aria-expanded', 'false');
  selectedHit = -1;
}

async function runSearch() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  if (!query) return closeSearch();

  const posts = await loadSearchIndex();
  const hits = posts
    .filter((post) => post.haystack.includes(query))
    .sort((a, b) => b.title.toLocaleLowerCase().includes(query) - a.title.toLocaleLowerCase().includes(query))
    .slice(0, 8);

  selectedHit = -1;
  searchResults.innerHTML = hits.length
    ? hits
        .map(
          (hit) =>
            `<a class="search-hit" href="${hit.url}"><span class="search-hit-title">${highlight(hit.title, query)}</span>` +
            `<span class="search-hit-snippet">${highlight(snippet(hit.text, query), query)}</span></a>`,
        )
        .join('')
    : '<p class="search-empty">找不到相關文章</p>';
  searchResults.hidden = false;
  searchInput.setAttribute('aria-expanded', 'true');
}

function moveSelection(step) {
  const hits = [...searchResults.querySelectorAll('.search-hit')];
  if (!hits.length) return;
  selectedHit = (selectedHit + step + hits.length) % hits.length;
  hits.forEach((hit, index) => hit.setAttribute('aria-selected', String(index === selectedHit)));
  hits[selectedHit].scrollIntoView({ block: 'nearest' });
}

searchInput.addEventListener('focus', loadSearchIndex, { once: true });
searchInput.addEventListener('input', runSearch);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    moveSelection(event.key === 'ArrowDown' ? 1 : -1);
  } else if (event.key === 'Enter') {
    const hits = searchResults.querySelectorAll('.search-hit');
    const target = hits[Math.max(selectedHit, 0)];
    if (target) location.href = target.href;
  } else if (event.key === 'Escape') {
    searchInput.value = '';
    closeSearch();
    searchInput.blur();
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.search')) closeSearch();
});

/* ---------- Keyboard: j / k walk the current stream, / focuses search ---------- */
document.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;

  if (event.key === '/') {
    event.preventDefault();
    searchInput.focus();
  } else if (event.key === 'Escape') {
    setDrawer(false);
  } else if (event.key === 'j' || event.key === 'k') {
    const direction = event.key === 'j' ? 'older' : 'newer';
    const link = document.querySelector(`.pager:not(.pager--dock) [data-nav="${direction}"]`);
    if (link) location.href = link.href;
  }
});

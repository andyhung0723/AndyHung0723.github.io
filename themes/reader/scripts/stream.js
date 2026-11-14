'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { stripHTML } = require('hexo-util');

/* global hexo */

const CJK_CHAR = /[぀-ヿ㐀-䶿一-鿿豈-﫿가-힯]/g;
const LATIN_WORD = /[A-Za-z0-9][\w.'-]*/g;

let streamIndex = null;
let assetVersions = new Map();

const themeConfig = () => hexo.theme.config;

/*
 * Built once per generate pass. Every page renders the full sidebar, so per-page work
 * must stay O(1) lookups instead of re-sorting or re-measuring posts.
 */
function buildStreamIndex() {
  const streams = themeConfig().streams ?? [];
  const fallback = streams.find((stream) => stream.fallback) ?? streams.at(-1);
  const byId = new Map(streams.map((stream) => [stream.id, { ...stream, posts: [] }]));
  const streamIdByPath = new Map();

  hexo.locals
    .get('posts')
    .sort('date', -1)
    .forEach((post) => {
      const categoryNames = post.categories.map((category) => category.name);
      const stream =
        streams.find((candidate) => candidate.category && categoryNames.includes(candidate.category)) ??
        fallback;
      byId.get(stream.id).posts.push(post);
      streamIdByPath.set(post.path, stream.id);
    });

  return { streams: [...byId.values()], byId, streamIdByPath, minutesByPath: new Map() };
}

const getIndex = () => (streamIndex ??= buildStreamIndex());

hexo.extend.filter.register('before_generate', () => {
  streamIndex = null;
  assetVersions = new Map();
});

hexo.extend.generator.register('streams', () =>
  (themeConfig().streams ?? []).map((stream) => ({
    path: `${stream.id}/index.html`,
    layout: ['stream', 'index'],
    data: { title: stream.label, stream_id: stream.id, description: stream.description },
  })),
);

hexo.extend.generator.register('taxonomy_indexes', () => [
  { path: 'categories/index.html', layout: ['categories', 'index'], data: { title: '分類', taxonomy: 'categories' } },
  { path: 'tags/index.html', layout: ['tags', 'index'], data: { title: '標籤', taxonomy: 'tags' } },
]);

hexo.extend.helper.register('streams', () => getIndex().streams);

hexo.extend.helper.register('stream_of', (post) => {
  const { byId, streamIdByPath } = getIndex();
  return byId.get(streamIdByPath.get(post.path)) ?? null;
});

hexo.extend.helper.register('current_stream', function (page) {
  const { byId, streamIdByPath, streams } = getIndex();
  if (page.stream_id) return byId.get(page.stream_id) ?? null;
  if (streamIdByPath.has(page.path)) return byId.get(streamIdByPath.get(page.path));
  if (page.category) return streams.find((stream) => stream.category === page.category) ?? null;
  return null;
});

hexo.extend.helper.register('stream_neighbors', function (post) {
  const stream = this.stream_of(post);
  if (!stream) return { newer: null, older: null, position: 0, total: 0 };

  const position = stream.posts.findIndex((candidate) => candidate.path === post.path);
  return {
    newer: stream.posts[position - 1] ?? null,
    older: stream.posts[position + 1] ?? null,
    position: position + 1,
    total: stream.posts.length,
  };
});

hexo.extend.helper.register('reading_minutes', (post) => {
  const { minutesByPath } = getIndex();
  if (minutesByPath.has(post.path)) return minutesByPath.get(post.path);

  const { cjk_chars_per_minute: cjkRate = 260, words_per_minute: wordRate = 130 } =
    themeConfig().reading_speed ?? {};
  const text = stripHTML(post.content ?? '');
  const cjkChars = text.match(CJK_CHAR)?.length ?? 0;
  const latinWords = text.replace(CJK_CHAR, ' ').match(LATIN_WORD)?.length ?? 0;
  const minutes = Math.max(1, Math.round(cjkChars / cjkRate + latinWords / wordRate));

  minutesByPath.set(post.path, minutes);
  return minutes;
});

hexo.extend.helper.register('is_stale', (post) => {
  const { stale_before: staleBefore } = themeConfig();
  return Boolean(staleBefore) && post.date.toDate() < new Date(staleBefore);
});

hexo.extend.helper.register('group_by_year', (posts) => {
  const groups = [];
  posts.forEach((post) => {
    const year = post.date.format('YYYY');
    const group = groups.at(-1)?.year === year ? groups.at(-1) : groups[groups.push({ year, posts: [] }) - 1];
    group.posts.push(post);
  });
  return groups;
});

hexo.extend.helper.register('post_summary', (post, length = 110) => {
  if (post.description) return post.description;
  const text = stripHTML(post.excerpt || post.content || '').replace(/\s+/g, ' ').trim();
  return text.length > length ? `${text.slice(0, length)}…` : text;
});

hexo.extend.helper.register('page_description', function (page) {
  if (page.description) return page.description;
  if (page.content) return this.post_summary(page, 140);
  return this.config.description;
});

hexo.extend.helper.register('canonical_url', function (page) {
  return this.full_url_for(page.path).replace(/index\.html$/, '');
});

hexo.extend.helper.register('stream_style', () => {
  const streams = themeConfig().streams ?? [];
  const light = streams
    .map((s) => `[data-stream="${s.id}"]{--stream:${s.color};--stream-tint:${s.tint}}`)
    .join('');
  const dark = streams
    .map((s) => `[data-stream="${s.id}"]{--stream:${s.color_dark};--stream-tint:${s.tint_dark}}`)
    .join('');
  const scopedDark = (scope) => dark.replaceAll('[data-stream=', `${scope} [data-stream=`);
  return (
    light +
    `@media (prefers-color-scheme:dark){${scopedDark(':root:not([data-theme="light"])')}}` +
    scopedDark(':root[data-theme="dark"]')
  );
});

/* Content-hash query strings, so a CSS/JS change never needs a manual cache bump. */
hexo.extend.helper.register('asset_url', function (assetPath) {
  if (!assetVersions.has(assetPath)) {
    const file = path.join(hexo.theme_dir, 'source', assetPath);
    const version = fs.existsSync(file)
      ? crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 10)
      : '';
    assetVersions.set(assetPath, version);
  }
  const version = assetVersions.get(assetPath);
  return this.url_for(assetPath) + (version ? `?v=${version}` : '');
});

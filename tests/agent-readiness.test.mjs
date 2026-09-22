import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('robots.txt allows major agent crawlers', () => {
  const robots = read('public/robots.txt');
  for (const agent of ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Google-Extended', 'DeepSeekBot', 'ora-agent']) {
    assert.match(robots, new RegExp(`User-agent: ${agent}[\\s\\S]*?Allow: /`));
  }
});

test('llms.txt contains concrete agent routing guidance', () => {
  const llms = read('public/llms.txt');
  assert.match(llms, /## When to use this site/);
  assert.match(llms, /## Machine-readable resources/);
  assert.match(llms, /agent-instructions\.md/);
});

test('dedicated agent instructions describe when and where to use the site', () => {
  const instructions = read('public/agent-instructions.md');
  assert.match(instructions, /## When to use this site/);
  assert.match(instructions, /## Routing/);
  assert.match(instructions, /## Source handling/);
});

test('markdown 404 remains an actual 404 and includes recovery links', () => {
  const page = read('src/pages/404.astro');
  const middleware = read('functions/_middleware.ts');
  assert.match(page, /status: 404/);
  assert.match(page, /Content-Type': 'text\/markdown; charset=utf-8/);
  assert.match(page, /\/llms\.txt/);
  assert.match(middleware, /response\.status === 404/);
  assert.match(middleware, /Content-Type': 'text\/markdown; charset=utf-8/);
});

test('homepage identity uses the full brand name in structured metadata', () => {
  const layout = read('src/layouts/BaseLayout.astro');
  assert.match(layout, /<meta name="author" content="Arhan Ahmad Khan"/);
  assert.match(layout, /"name": "Arhan Ahmad Khan"/);
  assert.match(layout, /"@type": "Person"/);
});

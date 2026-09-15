const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load() {
  const calls = [];
  const query = new Proxy({}, { get: (_, method) => (...args) => {
    calls.push([method, ...args]);
    return method === 'range'
      ? Promise.resolve({ data: [{ id: 'result' }], count: 37 })
      : query;
  }});
  const context = { exports: {}, console, require: (name) => name === 'server-only' ? {} : {
    createAdminClient: () => ({ from: () => query }),
  }};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/data/admin-properties.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  }).outputText, context);
  return { ...context.exports, calls };
}

test('searches every text field case-insensitively', () => {
  const { buildPropertySearchFilter: filter } = load();
  for (const field of ['title', 'city', 'neighborhood', 'address', 'postal_code']) {
    assert(filter('Rotterdam').includes(`${field}.ilike."%Rotterdam%"`));
  }
});

test('supports UUID identifiers and numeric prices without invalid numeric filters', () => {
  const { buildPropertySearchFilter: filter } = load();
  const id = 'ABCDEF12-1234-1234-1234-123456789012';
  assert(filter(id).includes(`id.eq.${id}`));
  assert(filter('€ 1 250,50').includes('monthly_price.eq.1250.5'));
  assert(!filter('Rotterdam').includes('monthly_price.eq'));
  assert(!filter('invalid-id').includes('id.eq'));
});

test('quotes punctuation and escapes wildcard input', () => {
  const { buildPropertySearchFilter: filter } = load();
  assert(filter('a,b"c').includes('title.ilike.' + JSON.stringify('%a,b"c%')));
  assert(filter('10%_').includes('title.ilike.' + JSON.stringify('%10\\%\\_%')));
});

test('filters in the database before pagination and preserves the full result count', async () => {
  const { getAllPropertiesAdmin, calls } = load();
  const result = await getAllPropertiesAdmin({ search: 'Rotterdam', page: 2 });
  assert(calls.findIndex(([method]) => method === 'or') < calls.findIndex(([method]) => method === 'range'));
  assert.deepEqual(calls.find(([method]) => method === 'range'), ['range', 12, 23]);
  assert.equal(result.total, 37);
  assert(!calls.some(([method]) => method === 'eq'));
});

test('an empty search retrieves all apartments with pagination', async () => {
  const { getAllPropertiesAdmin, calls } = load();
  await getAllPropertiesAdmin({ search: '   ' });
  assert(!calls.some(([method]) => method === 'or'));
  assert.deepEqual(calls.find(([method]) => method === 'range'), ['range', 0, 11]);
});

test('each dashboard card opens the list matching its counter', async () => {
  const dashboard = fs.readFileSync('app/admin/(dashboard)/page.tsx', 'utf8');
  const links = [...dashboard.matchAll(/<StatCard href="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(links.length, 5);
  for (const [index, status] of [undefined, 'available', 'reserved', 'rented', 'draft'].entries()) {
    const url = new URL(links[index], 'http://localhost');
    assert.equal(url.pathname, '/admin/appartements');
    assert.equal(url.searchParams.get('status'), status ?? null);
    const { getAllPropertiesAdmin, calls } = load();
    await getAllPropertiesAdmin({ status: url.searchParams.get('status') ?? undefined });
    const statusFilters = calls.filter(([method]) => method === 'eq');
    assert.deepEqual(statusFilters, status ? [['eq', 'status', status]] : []);
  }
});

test('status is combined with search before pagination', async () => {
  const { getAllPropertiesAdmin, calls } = load();
  await getAllPropertiesAdmin({ status: 'reserved', search: 'Rotterdam', page: 2 });
  assert(calls.some(([method]) => method === 'or'));
  assert.deepEqual(calls.find(([method]) => method === 'eq'), ['eq', 'status', 'reserved']);
  assert(calls.findIndex(([method]) => method === 'eq') < calls.findIndex(([method]) => method === 'range'));
  assert.deepEqual(calls.find(([method]) => method === 'range'), ['range', 12, 23]);
});

test('unknown statuses do not filter the list', async () => {
  const { getAllPropertiesAdmin, calls } = load();
  await getAllPropertiesAdmin({ status: 'unknown' });
  assert(!calls.some(([method]) => method === 'eq'));
});

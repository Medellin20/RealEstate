const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, dependencies) {
  const context = { exports: {}, require: (name) => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  }};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  }).outputText, context);
  return context.exports;
}

test('admin actions reject duplicate clicks while awaiting the server and unlock after errors', async () => {
  const states = [];
  const errors = [];
  const { useAdminAction } = load('lib/hooks/use-admin-action.ts', {
    react: { useRef: () => ({ current: false }), useState: () => [false, (value) => states.push(value)] },
    sonner: { toast: { error: (message) => errors.push(message) } },
  });
  const [, run] = useAdminAction();
  let release;
  let calls = 0;
  const pending = run(() => { calls++; return new Promise((resolve) => { release = resolve; }); });
  await run(async () => { calls++; });
  assert.equal(calls, 1);
  assert.equal(states.at(-1), true);
  release();
  await pending;
  assert.equal(states.at(-1), false);
  await run(async () => { throw new Error('offline'); });
  assert.equal(errors.length, 1);
  assert.equal(states.at(-1), false);
  await run(async () => { calls++; });
  assert.equal(calls, 2);
});

test('photo ordering reports database failures and scopes every update to the property', async () => {
  const filters = [];
  const invalidations = [];
  const query = {
    update: () => query,
    eq: (...args) => { filters.push(args); return query; },
    select: () => query,
    single: async () => ({ error: { message: 'database unavailable' } }),
  };
  const { reorderPropertyImages } = load('actions/admin-images.ts', {
    'next/cache': { revalidatePath: (...args) => invalidations.push(args) },
    '@/lib/supabase/admin': { createAdminClient: () => ({ from: () => query }) },
    '@/lib/data/history': { logAdminAction: async () => {} },
  });
  const result = await reorderPropertyImages('property-1', ['photo-1', 'photo-2']);
  assert.equal(result.success, false);
  assert.equal(filters.filter(([key, value]) => key === 'property_id' && value === 'property-1').length, 2);
  assert.equal(invalidations.length, 1);
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(sendMail) {
  const context = {
    exports: {},
    console: { log() {}, error() {} },
    process: { env: {
      GMAIL_USER: 'sender@example.com', GMAIL_APP_PASSWORD: 'test-password', ALERT_EMAIL: 'admin@example.com',
    } },
    require: (name) => name === 'server-only' ? {} : {
      createTransport: () => ({
        verify: () => { throw new Error('Redundant SMTP verification'); },
        sendMail,
      }),
    },
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/notifications/email.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, esModuleInterop: true },
  }).outputText, context);
  return context.exports.sendAdminAlert;
}

test('sends directly without a preliminary SMTP connection', async () => {
  let calls = 0;
  const send = load(async (message) => {
    calls++;
    assert.equal(message.to[0], 'admin@example.com');
    assert.equal(message.subject, 'Test');
    assert(message.text.includes('Client: Example'));
    return { messageId: 'test-id' };
  });
  assert.equal((await send('Test', { Client: 'Example' })).sent, true);
  assert.equal(calls, 1);
});

test('waits for SMTP acceptance before reporting success', async () => {
  let accept;
  const send = load(() => new Promise((resolve) => { accept = resolve; }));
  let finished = false;
  const result = send('Test', {}).then((value) => { finished = true; return value; });
  await Promise.resolve();
  assert.equal(finished, false);
  accept({ messageId: 'test-id' });
  assert.equal((await result).sent, true);
});

test('preserves delivery failure reporting', async () => {
  const send = load(async () => { throw new Error('SMTP unavailable'); });
  const result = await send('Test', {});
  assert.equal(result.sent, false);
  assert.equal(result.reason, 'delivery_failed');
});

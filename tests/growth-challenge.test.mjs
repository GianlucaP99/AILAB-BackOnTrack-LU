import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/i);
assert.ok(match, 'index.html must contain the application script');

let proofValue = '';
const storage = new Map();
const downloads = [];
const sandbox = {
  Blob,
  console,
  crypto: { randomUUID: () => 'test-uuid' },
  document: {
    createElement: () => ({ click: () => downloads.push(true) }),
    querySelector: () => ({ get value() { return proofValue; } }),
    querySelectorAll: () => []
  },
  localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  setTimeout: callback => callback(),
  URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} }
};
sandbox.globalThis = sandbox;
const instrumented = match[1].replace(
  'render();\n})();',
  'globalThis.__app = { TARGETS, DEFAULT, valid, totalFor, cap, leaderRows, injectDemoSubmissions, exportSubmission, blank, getDb: () => db, setDb: value => { db = value; } };\n})();'
);
vm.runInNewContext(instrumented, sandbox, { filename: 'index.html:inline-script' });
const app = sandbox.__app;
const clone = value => JSON.parse(JSON.stringify(value));

function freshDb(profile = { name: 'Test User', email: 'test@example.com', grade: 'Consultant', reviewer: '' }) {
  const db = clone(app.blank());
  db.profile = profile;
  return db;
}

test('defines the five agreed grade targets', () => {
  assert.deepEqual(clone(app.TARGETS.Analyst), [54, 4]);
  assert.deepEqual(clone(app.TARGETS.Consultant), [50, 8]);
  assert.deepEqual(clone(app.TARGETS['Senior Consultant']), [45, 20]);
  assert.deepEqual(clone(app.TARGETS.Manager), [33, 40]);
  assert.deepEqual(clone(app.TARGETS['Senior Manager']), [20, 60]);
});

test('validates the JSON schema marker and expected document type', () => {
  assert.doesNotThrow(() => app.valid({ schemaVersion: 1, app: 'road-to-target', type: 'catalogue' }, 'catalogue'));
  assert.throws(() => app.valid({ schemaVersion: 1, app: 'wrong', type: 'catalogue' }, 'catalogue'), /Unsupported file/);
  assert.throws(() => app.valid({ schemaVersion: 1, app: 'road-to-target', type: 'master' }, 'catalogue'), /not a catalogue export/);
});

test('counts delivery, business, and the 10-point internal-life limit correctly', () => {
  const db = freshDb();
  app.setDb(db);
  const delivery = clone(app.DEFAULT.find(activity => activity.category === 'Delivery'));
  const sales = clone(app.DEFAULT.find(activity => activity.category === 'Sales'));
  const internal = clone(app.DEFAULT.find(activity => activity.category === 'Internal life'));
  const entries = [
    { activityId: delivery.id, activity: delivery, points: 12, status: 'Approved' },
    { activityId: sales.id, activity: sales, points: 4, status: 'Approved' },
    { activityId: internal.id, activity: internal, points: 14, status: 'Approved' }
  ];
  assert.deepEqual(clone(app.totalFor(entries, { name: 'Other' })), { d: 12, b: 14, t: 26 });
});

test('enforces the LinkedIn two-post monthly cap', () => {
  const db = freshDb();
  const linkedIn = clone(app.DEFAULT.find(activity => activity.label === 'LinkedIn post'));
  db.entries = [{ id: 'existing', activityId: linkedIn.id, date: '2026-10-02', quantity: 2, status: 'Draft' }];
  app.setDb(db);
  const result = app.cap(linkedIn, 1, '2026-10-20');
  assert.equal(result.points, 0);
  assert.match(result.warning, /Cap applied/);
});

test('enforces five proposal-writing days per bid but permits another bid', () => {
  const db = freshDb();
  const writing = clone(app.DEFAULT.find(activity => activity.label === 'Proposal writing'));
  db.entries = [{ id: 'bid-a', activityId: writing.id, date: '2026-10-02', quantity: 5, proof: 'Bid A', status: 'Draft' }];
  app.setDb(db);
  proofValue = 'Bid A';
  assert.equal(app.cap(writing, 1, '2026-10-20').points, 0);
  proofValue = 'Bid B';
  assert.equal(app.cap(writing, 1, '2026-10-20').points, 1);
});

test('limits internal-life contribution to ten game points', () => {
  const db = freshDb();
  const internal = clone(app.DEFAULT.find(activity => activity.category === 'Internal life'));
  db.entries = [{ id: 'internal-1', activityId: internal.id, points: 9, status: 'Approved' }];
  app.setDb(db);
  const result = app.cap(internal, 1, '2026-11-10');
  assert.equal(result.points, 1);
  assert.match(result.warning, /10 points/);
});

test('inserts 15 demo contributors once without duplicate injection', () => {
  const db = freshDb();
  app.setDb(db);
  assert.equal(app.injectDemoSubmissions(), 30);
  assert.equal(app.getDb().entries.length, 30);
  assert.equal(app.injectDemoSubmissions(), 0);
  assert.equal(app.getDb().entries.length, 30);
});

test('creates standings ordered by qualifying progress within the right leagues', () => {
  const db = freshDb();
  const delivery = clone(app.DEFAULT.find(activity => activity.category === 'Delivery'));
  const sales = clone(app.DEFAULT.find(activity => activity.category === 'Sales'));
  const junior = { name: 'Junior', email: 'junior@example.com', grade: 'Consultant' };
  const senior = { name: 'Senior', email: 'senior@example.com', grade: 'Manager' };
  db.entries = [
    { activityId: delivery.id, activity: delivery, points: 50, status: 'Approved', person: junior },
    { activityId: sales.id, activity: sales, points: 8, status: 'Approved', person: junior },
    { activityId: delivery.id, activity: delivery, points: 33, status: 'Approved', person: senior },
    { activityId: sales.id, activity: sales, points: 40, status: 'Approved', person: senior }
  ];
  app.setDb(db);
  const rows = app.leaderRows();
  assert.equal(rows.length, 2);
  assert.equal(rows.find(row => row.p.email === junior.email).league, 'Juniors');
  assert.equal(rows.find(row => row.p.email === senior.email).league, 'Seniors');
  assert.ok(rows.every(row => row.v === 100));
});

test('marks drafts as submitted when exporting a contributor submission', () => {
  const db = freshDb();
  const delivery = clone(app.DEFAULT.find(activity => activity.category === 'Delivery'));
  db.entries = [{ id: 'draft-1', activityId: delivery.id, activity: delivery, date: '2026-10-10', quantity: 1, points: 1, status: 'Draft', person: db.profile }];
  app.setDb(db);
  assert.equal(app.exportSubmission(), true);
  assert.equal(app.getDb().entries[0].status, 'Submitted');
  assert.ok(downloads.length > 0);
});

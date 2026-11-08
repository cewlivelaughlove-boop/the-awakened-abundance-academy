import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { abundanceCards, shuffleDeck } from '../public/assets/abundance-card-data.js';

const root = fileURLToPath(new URL('../public', import.meta.url));
const manifest = JSON.parse(readFileSync(`${root}/assets/tarot/manifest.json`, 'utf8'));
assert.equal(abundanceCards.length, 78);
assert.equal(new Set(abundanceCards.map(card => card.id)).size, 78);
assert.equal(new Set(abundanceCards.map(card => card.name)).size, 78);
assert.equal(new Set(abundanceCards.map(card => card.cardImage)).size, 78);
assert.equal(new Set(abundanceCards.map(card => card.meaning)).size, 78, 'Each card must have its own interpretation');
assert.equal(abundanceCards.filter(card => card.arcana === 'major').length, 22);
assert.equal(abundanceCards.filter(card => card.arcana === 'minor').length, 56);
for (const suit of ['Wands', 'Cups', 'Swords', 'Pentacles']) {
  const cards = abundanceCards.filter(card => card.suit === suit);
  assert.equal(cards.length, 14);
  assert.deepEqual(cards.map(card => card.rank), Array.from({ length: 14 }, (_, i) => i + 1));
  for (const [rank, title] of [[1, 'Ace'], [11, 'Page'], [12, 'Knight'], [13, 'Queen'], [14, 'King']]) {
    assert.equal(cards.find(card => card.rank === rank).name, `${title} of ${suit}`);
  }
}
assert.equal(abundanceCards.find(card => card.name === 'Strength').rank, 8);
assert.equal(abundanceCards.find(card => card.name === 'Justice').rank, 11);
assert.equal(manifest.cards.length, 78);
assert.equal(new Set(manifest.cards.map(card => card.sha256)).size, 78, 'Every card must use distinct artwork');
for (const card of abundanceCards) {
  for (const field of ['id', 'name', 'meaning', 'message', 'action', 'cardImage']) assert.ok(card[field].length > 0);
  assert.equal(card.meaning.match(/[^.!?]+[.!?](?:\s|$)/g)?.length, 2, `${card.id} must have two meaning sentences`);
  assert.ok(card.meaning.length <= 450, `${card.id} interpretation should remain concise`);
  assert.notEqual(card.meaning, card.message);
  assert.notEqual(card.meaning, card.action);
  assert.ok(Array.isArray(card.keywords));
  assert.equal(card.keywords.length, 3, `${card.id} must have three keywords`);
  assert.equal(new Set(card.keywords).size, 3, `${card.id} keywords must be distinct`);
  for (const keyword of card.keywords) {
    assert.equal(typeof keyword, 'string');
    assert.ok(keyword.trim().length > 0 && keyword.length <= 30);
  }
  const source = manifest.cards.find(item => item.id === card.id);
  assert.ok(source);
  assert.equal(source.name, card.name);
  assert.equal(source.cardImage, card.cardImage);
  assert.equal(source.license, 'Public domain');
  assert.ok(source.sourcePage.startsWith('https://commons.wikimedia.org/wiki/File:'));
  assert.ok(existsSync(root + card.cardImage));
  const data = readFileSync(root + card.cardImage);
  assert.equal(data[0], 0xff);
  assert.equal(data[1], 0xd8);
  assert.equal(createHash('sha256').update(data).digest('hex'), source.sha256);
}
const originalIds = abundanceCards.map(card => card.id);
const shuffled = shuffleDeck(abundanceCards, () => 0.25);
assert.deepEqual(abundanceCards.map(card => card.id), originalIds, 'Shuffle must not mutate source deck');
assert.notEqual(shuffled, abundanceCards);
assert.equal(shuffled.length, 78);
assert.deepEqual([...shuffled.map(card => card.id)].sort(), [...originalIds].sort());
assert.equal(new Set(shuffled.slice(0, 3).map(card => card.id)).size, 3);
console.log('PASS: 78 unique, complete, correctly mapped card records with two-sentence meanings and three keywords each; all locally hosted image hashes, public-domain notices, and shuffle invariants verified.');

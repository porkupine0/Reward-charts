// Bible picker helpers: references, chapter counts and the next chapter.
import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOKS, chapters, parseRef, nextRef } from '../bible.js';

test('66 books, 1189 chapters', () => {
  assert.equal(BOOKS.length, 66);
  assert.equal(BOOKS.reduce((a, [, n]) => a + n, 0), 1189);
  assert.equal(chapters('Psalms'), 150);
});
test('references', () => {
  assert.deepEqual(parseRef('1 John 3'), { book: '1 John', ch: 3 });
  assert.equal(parseRef('John 22'), null);
  assert.equal(parseRef(''), null);
});
test('next chapter wraps within the allowed books', () => {
  const g = ['Matthew', 'Mark', 'Luke', 'John'];
  assert.equal(nextRef('John 3', g), 'John 4');
  assert.equal(nextRef('Matthew 28', g), 'Mark 1');
  assert.equal(nextRef('John 21', g), 'Matthew 1');
  assert.equal(nextRef('Psalms 150', ['Psalms', 'Proverbs']), 'Proverbs 1');
  assert.equal(nextRef('Genesis 3', g), null);
});

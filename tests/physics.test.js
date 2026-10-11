import test from 'node:test';
import assert from 'node:assert/strict';
import { solution } from '../dist/physics.js';
const near = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);
test('initial rest and half-open force interval', () => {
  assert.deepEqual(solution(0, 1, 5), { x: 0, v: 0, f: 0 });
  assert.deepEqual(solution(1, 1, 5), { x: 0, v: 0, f: 1 });
  assert.equal(solution(5, 1, 5).f, 0);
  assert.equal(solution(0, 0, 5).f, 1);
  assert.deepEqual(solution(8, 3, 3), { x: 0, v: 0, f: 0 });
});
test('position and velocity remain continuous across switching times', () => {
  for (const [a, b] of [[1, 5], [0, 30], [3, 3.1]]) for (const t of [a, b]) {
    const left = solution(t - 1e-7, a, b), right = solution(t + 1e-7, a, b);
    near(left.x, right.x, 5e-7); near(left.v, right.v, 5e-7);
  }
});
test('solution satisfies the differential equation away from switches', () => {
  const h = 1e-4;
  for (const t of [.5, 2, 4, 6, 20, 159]) {
    const { x, f, v } = solution(t, 1, 5);
    const left = solution(t - h, 1, 5), right = solution(t + h, 1, 5);
    near((right.v - left.v) / (2 * h) + x, f, 1e-7);
    near((right.x - left.x) / (2 * h), v, 1e-7);
  }
});
test('free oscillation conserves energy and a full-period pulse leaves rest', () => {
  const expectedEnergy = 2 * Math.sin(2) ** 2;
  for (const t of [5, 10, 100, 1000]) {
    const { x, v } = solution(t, 1, 5);
    near((x * x + v * v) / 2, expectedEnergy);
    near(solution(t + 10, 1, 1 + 2 * Math.PI).x, 0);
  }
});

/** Exact unit-mass, unit-spring response to a unit rectangular force. */
export function solution(t, a, b) {
  if (t < a || a === b) return { x: 0, v: 0, f: 0 };
  if (t < b) return { x: 2 * Math.sin((t - a) / 2) ** 2, v: Math.sin(t - a), f: 1 };
  // Difference identities avoid cancellation when the pulse is very short.
  const amplitude = 2 * Math.sin((b - a) / 2);
  const phase = t - (a + b) / 2;
  return { x: amplitude * Math.sin(phase), v: amplitude * Math.cos(phase), f: 0 };
}

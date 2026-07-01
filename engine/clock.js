'use strict';
// Strictly-monotonic ISO timestamps. Guarantees updatedAt after a mutation is
// always > the previous value even within the same millisecond, so audit ordering
// and the "updatedAt changed on transition" invariant hold deterministically.

let last = 0;

function nowIso() {
  let t = Date.now();
  if (t <= last) t = last + 1;
  last = t;
  return new Date(t).toISOString();
}

module.exports = { nowIso };

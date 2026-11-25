const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const OPEN = 9 * HOUR;
const CLOSE = 17 * HOUR;

/**
 * Business time, in milliseconds, between `start` and `end`: the part
 * of [start, end) inside Monday-to-Friday 09:00-17:00 UTC windows.
 * Throws a RangeError if `end` is before `start` or either is invalid.
 */
export function businessTimeBetween(
  start: Date,
  end: Date,
): number {
  const a = start.getTime();
  const b = end.getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) {
    throw new RangeError(
      "businessTimeBetween: invalid Date",
    );
  }
  if (b < a) {
    throw new RangeError(
      "businessTimeBetween: end is before start",
    );
  }
  let total = 0;
  for (
    let day = Math.floor(a / DAY) * DAY;
    day < b;
    day += DAY
  ) {
    const weekday = new Date(day).getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    const from = Math.max(a, day + OPEN);
    const to = Math.min(b, day + CLOSE);
    if (to > from) total += to - from;
  }
  return total;
}

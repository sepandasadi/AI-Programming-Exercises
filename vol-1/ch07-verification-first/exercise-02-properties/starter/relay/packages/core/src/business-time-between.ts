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
  // Whole weeks hold exactly 40 business hours, wherever
  // they start, so count them without walking the days.
  const weeks = Math.round((b - a) / (7 * DAY));
  let total = weeks * 40 * HOUR;
  const from0 = a + weeks * 7 * DAY;
  for (
    let day = Math.floor(from0 / DAY) * DAY;
    day < b;
    day += DAY
  ) {
    const weekday = new Date(day).getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    const from = Math.max(from0, day + OPEN);
    const to = Math.min(b, day + CLOSE);
    if (to > from) total += to - from;
  }
  return total;
}

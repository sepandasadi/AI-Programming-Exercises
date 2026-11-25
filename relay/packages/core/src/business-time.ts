const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const OPEN = 9 * HOUR; // 09:00 UTC, inclusive
const CLOSE = 17 * HOUR; // 17:00 UTC, exclusive
const BUSINESS_DAY = CLOSE - OPEN; // 8 hours
const BUSINESS_WEEK = 5 * BUSINESS_DAY; // 40 hours

/** The largest epoch ms a Date can hold. */
const MAX_TIME = 8.64e15;

/** UTC midnight of the day containing `t` (epoch ms). */
const dayStart = (t: number): number =>
  Math.floor(t / DAY) * DAY;

/**
 * Monday to Friday, in UTC. Computed from the day number rather than
 * `new Date(t).getUTCDay()`, which is NaN past the Date range and made
 * the search for the next weekday loop forever.
 */
const isBusinessDay = (t: number): boolean => {
  // Day 0, 1970-01-01, was a Thursday; 0 = Sunday ... 6 = Saturday.
  const d = (((Math.floor(t / DAY) + 4) % 7) + 7) % 7;
  return d >= 1 && d <= 5;
};

const HOLIDAY_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses YYYY-MM-DD dates into the UTC midnights they name. Throws a
 * RangeError for anything else, including impossible dates (2026-02-30).
 */
function parseHolidays(
  holidays: readonly string[],
): Set<number> {
  const days = new Set<number>();
  for (const h of holidays) {
    const t = HOLIDAY_FORMAT.test(h)
      ? Date.parse(`${h}T00:00:00.000Z`)
      : Number.NaN;
    if (
      Number.isNaN(t) ||
      new Date(t).toISOString().slice(0, 10) !== h
    ) {
      throw new RangeError(
        `addBusinessTime: holiday must be a YYYY-MM-DD date, got ${JSON.stringify(h)}`,
      );
    }
    days.add(t);
  }
  return days;
}

/**
 * Returns `t` if it is inside a business window, otherwise the next
 * opening (09:00 UTC on the next Monday to Friday that is not a holiday).
 */
function nextBusinessInstant(
  t: number,
  holidays: ReadonlySet<number>,
): number {
  const isOpenDay = (day: number): boolean =>
    isBusinessDay(day) && !holidays.has(day);
  const day = dayStart(t);
  const offset = t - day;
  if (
    isBusinessDay(day) &&
    offset >= OPEN &&
    offset < CLOSE
  ) {
    return t;
  }
  let candidate = offset < OPEN ? day : day + DAY;
  while (!isOpenDay(candidate)) {
    candidate += DAY;
  }
  return candidate + OPEN;
}

/**
 * Adds `ms` milliseconds of business time to `start` and returns the
 * respond-by instant. Business time runs Monday to Friday, 09:00
 * (inclusive) to 17:00 (exclusive), UTC. See docs/specs/issue-triage.md.
 *
 * `holidays` is an optional list of YYYY-MM-DD dates (UTC days) on which
 * no business time is counted. Dates that fall on a weekend, or before
 * `start`, have no effect.
 *
 * The result is the earliest instant at which the clock has counted the
 * full amount, so a deadline that lands exactly on a closing time is that
 * closing time (17:00), not the next opening.
 *
 * Throws a RangeError if `ms` is not a positive whole number, if `start`
 * is an invalid Date, if a holiday is not a valid YYYY-MM-DD date, or if
 * the result falls outside the Date range.
 */
export function addBusinessTime(
  start: Date,
  ms: number,
  holidays: readonly string[] = [],
): Date {
  if (!Number.isInteger(ms) || ms <= 0) {
    throw new RangeError(
      `addBusinessTime: ms must be a positive whole number, got ${ms}`,
    );
  }
  const startMs = start.getTime();
  if (Number.isNaN(startMs)) {
    throw new RangeError(
      "addBusinessTime: start is an invalid Date",
    );
  }

  const closed = parseHolidays(holidays);
  const lastHoliday = [...closed].reduce(
    (a, b) => Math.max(a, b),
    -Infinity,
  );

  let cursor = nextBusinessInstant(startMs, closed);
  let remaining = ms;

  for (;;) {
    // From any instant inside a window, 40 business hours later is the
    // same weekday and time one calendar week later, provided no holiday
    // lies in between. So once the cursor is past the last holiday, skip
    // whole weeks, but always leave at least 1 ms so the code below
    // applies the closing-time rule. Until then, walk day by day.
    if (dayStart(cursor) > lastHoliday) {
      const weeks = Math.floor(
        (remaining - 1) / BUSINESS_WEEK,
      );
      cursor += weeks * WEEK;
      remaining -= weeks * BUSINESS_WEEK;
    }
    // The cursor only moves forward, so once it passes the last valid
    // Date the result can't be in range: stop before a huge (or
    // infinite) cursor can stall the walk.
    if (cursor > MAX_TIME) throw outOfRange();

    const close = dayStart(cursor) + CLOSE;
    const available = close - cursor;
    if (remaining <= available) {
      cursor += remaining;
      break;
    }
    remaining -= available;
    cursor = nextBusinessInstant(close, closed);
  }

  return new Date(cursor);
}

function outOfRange(): RangeError {
  return new RangeError(
    "addBusinessTime: result is outside the range of Date",
  );
}

import { isHolidayDate } from "./holidays.js";

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

/** Holidays as UTC day starts: a set to test, a sorted list to search. */
type Holidays = {
  days: ReadonlySet<number>;
  sorted: readonly number[];
};

function toHolidays(dates: readonly string[]): Holidays {
  const days = new Set<number>();
  for (const date of dates) {
    if (!isHolidayDate(date)) {
      throw new RangeError(
        `addBusinessTime: holiday "${date}" is not a date in YYYY-MM-DD form`,
      );
    }
    days.add(Date.parse(`${date}T00:00:00.000Z`));
  }
  return {
    days,
    sorted: [...days].sort((a, b) => a - b),
  };
}

/** Monday to Friday, in UTC, and not a holiday. `day` is a day start. */
const isBusinessDay = (
  day: number,
  holidays: Holidays,
): boolean => {
  const d = new Date(day).getUTCDay(); // 0 = Sunday ... 6 = Saturday
  return d >= 1 && d <= 5 && !holidays.days.has(day);
};

/**
 * Returns `t` if it is inside a business window, otherwise the next
 * opening (09:00 UTC on the next business day).
 */
function nextBusinessInstant(
  t: number,
  holidays: Holidays,
): number {
  const day = dayStart(t);
  const offset = t - day;
  if (
    isBusinessDay(day, holidays) &&
    offset >= OPEN &&
    offset < CLOSE
  ) {
    return t;
  }
  let candidate = offset < OPEN ? day : day + DAY;
  while (!isBusinessDay(candidate, holidays)) {
    candidate += DAY;
  }
  return candidate + OPEN;
}

const outOfRange = (): RangeError =>
  new RangeError(
    "addBusinessTime: result is outside the range of Date",
  );

/**
 * Adds `ms` milliseconds of business time to `start` and returns the
 * respond-by instant. Business time runs Monday to Friday, 09:00
 * (inclusive) to 17:00 (exclusive), UTC, except on `holidays`
 * (`YYYY-MM-DD`, whole UTC days). See docs/specs/issue-triage.md and
 * docs/specs/triage-holidays.md.
 *
 * The result is the earliest instant at which the clock has counted the
 * full amount, so a deadline that lands exactly on a closing time is that
 * closing time (17:00), not the next opening.
 *
 * Throws a RangeError if `ms` is not a positive whole number, if `start`
 * is an invalid Date, if a holiday is not a `YYYY-MM-DD` date, or if the
 * result falls outside the Date range.
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

  const hol = toHolidays(holidays);
  let cursor = nextBusinessInstant(startMs, hol);
  let remaining = ms;
  let next = 0; // index into hol.sorted of the first holiday after cursor's day

  for (;;) {
    if (cursor > MAX_TIME) throw outOfRange();
    const day = dayStart(cursor);
    while ((hol.sorted[next] ?? Infinity) <= day) next++;
    const holiday = hol.sorted[next] ?? Infinity;

    // From any instant inside a window, 40 business hours later is the
    // same weekday and time one calendar week later, provided no holiday
    // falls on the days skipped (day, day + 7 * weeks]. Skip as many whole
    // weeks as that allows, but always leave at least 1 ms so the window
    // step below applies the closing-time rule.
    const weeks = Math.min(
      Math.floor((remaining - 1) / BUSINESS_WEEK),
      Math.floor((holiday - day - 1) / WEEK),
    );
    if (weeks > 0) {
      cursor += weeks * WEEK;
      remaining -= weeks * BUSINESS_WEEK;
      if (cursor > MAX_TIME) throw outOfRange();
    }

    // One window at a time until the next skip or the deadline.
    const close = dayStart(cursor) + CLOSE;
    const available = close - cursor;
    if (remaining <= available) {
      cursor += remaining;
      break;
    }
    remaining -= available;
    cursor = nextBusinessInstant(close, hol);
  }

  const result = new Date(cursor);
  if (Number.isNaN(result.getTime())) throw outOfRange();
  return result;
}

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

const MONTH_RE = new RegExp(`\\b(${MONTHS.join('|')})\\b`, 'gi');
/** "April – June", "June to October", "May-September". */
const RANGE_RE = new RegExp(
  `\\b(${MONTHS.join('|')})\\b\\s*(?:–|—|-|to|until|through)\\s*(?:early |late |mid[- ])?\\b(${MONTHS.join('|')})\\b`,
  'gi',
);

const indexOf = (name: string) => MONTHS.indexOf(name.toLowerCase()) + 1;

/**
 * Read the free-text `bestMonths` into the set of months a place actually
 * rides well, so a trip in March is not offered a pass that is under snow.
 *
 * Handles ranges, several ranges in one line, loose month mentions and
 * "year-round". An empty result means "could not tell" — callers should treat
 * that as no information rather than as a closed season.
 */
export function monthsFor(text: string | undefined): Set<number> {
  const months = new Set<number>();
  if (!text) return months;
  const t = text.toLowerCase();

  if (/year[- ]round|all year/.test(t)) {
    for (let m = 1; m <= 12; m++) months.add(m);
    return months;
  }

  let hasRange = false;
  for (const m of t.matchAll(RANGE_RE)) {
    hasRange = true;
    const from = indexOf(m[1]);
    const to = indexOf(m[2]);
    // Ranges may wrap the new year (November – March).
    for (let i = from; ; i = (i % 12) + 1) {
      months.add(i);
      if (i === to) break;
    }
  }

  // Loose mentions ("the event is in April") count too, but only once the
  // ranges are in — otherwise the second month of every range is added twice.
  if (!hasRange) {
    for (const m of t.matchAll(MONTH_RE)) months.add(indexOf(m[1]));
  } else {
    const inRange = t.replace(RANGE_RE, '');
    for (const m of inRange.matchAll(MONTH_RE)) months.add(indexOf(m[1]));
  }

  return months;
}

export const monthName = (m: number) =>
  MONTHS[m - 1].charAt(0).toUpperCase() + MONTHS[m - 1].slice(1);

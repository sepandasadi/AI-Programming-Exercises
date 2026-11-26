export type Section = {
  id: string;
  heading: string;
  body: string;
};

// This lab accepts one non-empty ASCII alphanumeric query term.
export function matchSections(
  sections: readonly Section[],
  query: string,
): string[] {
  const term = query.toLowerCase();
  return sections
    .filter(({ heading, body }) =>
      heading.toLowerCase().includes(term) ||
      body.toLowerCase().includes(term),
    )
    .map(({ id }) => id);
}

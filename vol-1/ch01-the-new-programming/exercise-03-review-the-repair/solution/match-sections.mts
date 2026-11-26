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
    .filter(({ heading, body }) => {
      const text = `${heading} ${body}`.toLowerCase();
      const words: readonly string[] = text.match(/[a-z0-9]+/g) ?? [];
      return words.includes(term);
    })
    .map(({ id }) => id);
}

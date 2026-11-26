// The chapter fixture uses the three citation fields from Relay's SearchResult.
export type SearchHit = {
  heading: string;
  path: string;
  line: number;
};

export function formatHit(hit: SearchHit): string {
  return `${hit.heading} (${hit.path}:${hit.line})`;
}

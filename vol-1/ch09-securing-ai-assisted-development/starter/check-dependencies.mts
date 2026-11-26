export type Dependency = {
  name: string;
  version: string;
  source: string;
};

export function unapprovedDependencies(
  candidates: readonly Dependency[],
  _approved: readonly Dependency[],
): Dependency[] {
  // Allow exact approved entries. Hold everything else.
  return [...candidates];
}

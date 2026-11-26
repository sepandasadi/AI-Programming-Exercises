export type Dependency = {
  name: string;
  version: string;
  source: string;
};

export function unapprovedDependencies(
  candidates: readonly Dependency[],
  approved: readonly Dependency[],
): Dependency[] {
  return candidates.filter(
    (candidate) =>
      !approved.some(
        (entry) =>
          entry.name === candidate.name &&
          entry.version === candidate.version &&
          entry.source === candidate.source,
      ),
  );
}

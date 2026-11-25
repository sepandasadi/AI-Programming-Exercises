import { z } from "zod";

export const IssueSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  state: z.enum(["open", "closed"]),
  labels: z.array(z.string()),
  updatedAt: z.iso.datetime(),
});
export type Issue = z.infer<typeof IssueSchema>;

export type StaleIssue = {
  id: number;
  title: string;
  updatedAt: string;
  daysStale: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function staleIssues(
  issues: Issue[],
  now: Date,
  days: number,
): StaleIssue[] {
  return issues
    .filter((i) => i.state === "open")
    .filter(
      (i) =>
        !i.labels.some(
          (l) => l.toLowerCase() === "on-hold",
        ),
    )
    .map((i) => ({
      issue: i,
      ageMs: now.getTime() - Date.parse(i.updatedAt),
    }))
    .filter(({ ageMs }) => ageMs >= days * DAY_MS)
    .sort(
      (a, b) =>
        b.ageMs - a.ageMs || a.issue.id - b.issue.id,
    )
    .map(({ issue, ageMs }) => ({
      id: issue.id,
      title: issue.title,
      updatedAt: issue.updatedAt,
      daysStale: Math.floor(ageMs / DAY_MS),
    }));
}

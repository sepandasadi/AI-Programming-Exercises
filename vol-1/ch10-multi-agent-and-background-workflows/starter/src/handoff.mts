import { formatDeadline } from "./deadline.mts";
import { type Priority, priorityLabel } from "./priority.mts";
import { ownershipHint } from "./ownership.mts";

export type TriageHandoff = {
  number: number;
  priority: Priority;
  respondBy: string;
  hasOwner: boolean;
};

export function formatHandoff(input: TriageHandoff): string {
  return [
    `#${input.number} ${priorityLabel(input.priority)}`,
    `Respond by ${formatDeadline(input.respondBy)}`,
    ownershipHint(input.hasOwner),
  ].join(" | ");
}

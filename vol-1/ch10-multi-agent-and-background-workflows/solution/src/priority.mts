export type Priority = "P0" | "P1" | "P2" | "P3";

const labels: Record<Priority, string> = {
  P0: "Critical",
  P1: "High",
  P2: "Normal",
  P3: "Low",
};

export function priorityLabel(priority: Priority): string {
  return labels[priority];
}

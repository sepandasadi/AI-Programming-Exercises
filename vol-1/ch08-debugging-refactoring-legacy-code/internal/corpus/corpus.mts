export type Runbook = {
  id: string;
  title: string;
  body: string;
};

export const runbooks: readonly Runbook[] = [
  {
    id: "payments",
    title: "Payments",
    body: "Start with the dashboard.\nUse regional failover if checkout is unavailable.",
  },
  {
    id: "rollback",
    title: "Rollback",
    body: "Check the release marker.\nRestore the previous revision.",
  },
  {
    id: "alerts",
    title: "Alerts",
    body: "Check the alert dashboard.\nVerify the owner.",
  },
  {
    id: "databases",
    title: "Databases",
    body: "Open the database dashboard.\nCheck replication lag.",
  },
];

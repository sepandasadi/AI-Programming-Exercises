import { evaluateCanary, type Decision } from "./gate.mts";
import { observe, runRollback } from "./replay.mts";

const [command, scenario, ...extra] = process.argv.slice(2);
const exitCodes: Record<Decision, number> = { proceed: 0, hold: 2, stop: 3 };

if (
  command === "canary" &&
  (scenario === "healthy" ||
    scenario === "short" ||
    scenario === "regression") &&
  extra.length === 0
) {
  const window = observe(scenario, 10);
  const decision = evaluateCanary(window.control, window.candidate);
  console.log(JSON.stringify({ decision, flagPercent: 10, ...window }));
  process.exitCode = exitCodes[decision];
} else if (command === "rollback" && scenario === undefined) {
  const window = runRollback();
  console.log(
    JSON.stringify({ decision: "restored", flagPercent: 0, ...window }),
  );
} else {
  console.error(
    "Usage: node lab/release.mts canary <healthy|short|regression> | rollback",
  );
  process.exitCode = 1;
}

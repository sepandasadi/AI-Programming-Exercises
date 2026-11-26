export type Observations = {
  checked: number;
  mismatches: number;
};

export type Decision = "proceed" | "hold" | "stop";

const minimumPerArm = 20;

export function evaluateCanary(
  control: Observations,
  candidate: Observations,
): Decision {
  if (control.mismatches > 0 || candidate.mismatches > 0) {
    return "stop";
  }
  const controlReady = control.checked >= minimumPerArm;
  const candidateReady = candidate.checked >= minimumPerArm;
  if (!controlReady || !candidateReady) {
    return "hold";
  }
  return "proceed";
}

import {
  mkdtemp,
  rm,
  writeFile,
  mkdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  checkSpec,
  coveredIn,
  criteriaIn,
} from "./check-spec.js";

// Test titles below are built with "AC" + "-n" so this file
// never looks like it covers a real spec.
const ac = (n: number) => `AC` + `-${n}`;

const spec = [
  "# Spec",
  "## Acceptance criteria",
  `- ${ac(1)}: one`,
  `- ${ac(2)}: two`,
  "## Verification",
  `- mentions ${ac(9)} outside the criteria`,
].join("\n");

describe("criteriaIn", () => {
  it("reads IDs only from the Acceptance criteria section", () => {
    expect(criteriaIn(spec)).toEqual([ac(1), ac(2)]);
  });
});

describe("coveredIn", () => {
  const body = [
    `// ${ac(2)} is mentioned in a comment`,
    `it("${ac(1)}: does one thing", () => {});`,
    `it.each([1, 2])("${ac(3)}: case %s", () => {});`,
    `const s = "${ac(4)}: just a string";`,
  ].join("\n");

  it("counts test titles in files tagged for the spec", () => {
    const src = `// spec: demo\n${body}`;
    expect(coveredIn(src, "demo")).toEqual([ac(1), ac(3)]);
  });

  it("ignores files tagged for another spec", () => {
    const src = `// spec: other\n${body}`;
    expect(coveredIn(src, "demo")).toEqual([]);
  });

  it("ignores untagged files", () => {
    expect(coveredIn(body, "demo")).toEqual([]);
  });
});

describe("checkSpec", () => {
  let dir = "";
  afterAll(() => rm(dir, { recursive: true, force: true }));

  it("reports criteria covered only by the spec's own tests", async () => {
    dir = await mkdtemp(join(tmpdir(), "spec-check-"));
    await mkdir(join(dir, "src"));
    const specPath = join(dir, "demo.md");
    await writeFile(specPath, spec);
    await writeFile(
      join(dir, "src", "a.test.ts"),
      `// spec: demo\nit("${ac(1)}: x", () => {});\n`,
    );
    await writeFile(
      join(dir, "src", "b.test.ts"),
      `// spec: other\nit("${ac(2)}: y", () => {});\n`,
    );
    expect(await checkSpec(specPath, dir)).toEqual([
      { id: ac(1), ok: true },
      { id: ac(2), ok: false },
    ]);
  });
});

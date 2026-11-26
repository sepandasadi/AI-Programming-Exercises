export const handoffs = [
  {
    number: 42,
    priority: "P1",
    respondBy: "2026-11-25T21:45:00.000Z",
    hasOwner: false,
    expected: "#42 High | Respond by 2026-11-25 21:45 UTC | Assign an owner",
  },
  {
    number: 43,
    priority: "P0",
    respondBy: "2026-01-01T00:00:00.000Z",
    hasOwner: true,
    expected:
      "#43 Critical | Respond by 2026-01-01 00:00 UTC | Confirm the owner",
  },
] as const;

// Equal synthetic samples for comparison, independent of the flag percentage.
export const fullBuckets = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99,
];

export const shortBuckets = [0, 1, 2, 9, 10, 20, 30, 40];

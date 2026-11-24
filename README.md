# AI Programming Exercises

Code for *The New Programming with AI* (working title), a two-volume book by Sepand Asadi:

- **Vol. 1, *Coding with AI***: working with coding agents.
- **Vol. 2, *Building with AI***: building AI features.

## What's here

| Path | What it holds |
| --- | --- |
| [`relay/`](relay/) | **Relay**, the project that runs through both volumes: a TypeScript app that answers questions over a team's docs and repos, triages issues and drafts PRs |
| [`vol-1/`](vol-1/) | Exercises for Vol. 1, one folder per chapter |
| [`vol-2/`](vol-2/) | Exercises for Vol. 2, one folder per chapter |

Each chapter folder (`vol-1/ch06-spec-driven-development/`, for example) has a README,
numbered exercises (instructions, starter, solution), a challenge and a quiz.
Every exercise includes at least one verification step.

## Relay at each chapter

Relay's state at the end of each chapter is tagged: `v1-ch06`, `v1-ch07`, … for Vol. 1
and `v2-ch02`, … for Vol. 2. To start a chapter from the right place:

```bash
git checkout v1-ch06
```

## Running Relay

Needs Node.js 22+ and pnpm (enable it with `corepack enable`).

```bash
cd relay
cp .env.example .env
pnpm install
pnpm build
pnpm test
pnpm dev        # API on http://localhost:3000, try /health
```

## License

MIT. See [LICENSE](LICENSE).

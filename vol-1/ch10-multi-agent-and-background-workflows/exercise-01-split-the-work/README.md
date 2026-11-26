# Exercise 1 — Split the work and freeze the base

Read the [handoff contract](../starter/contract.md) and look at the
[composer](../starter/src/handoff.mts). It calls three formatters with
fixed signatures. Record which contract each formatter owns and who will
review the joined output. The three workers may edit their own formatters.
The integration owner keeps the contract, composer and tests outside their
write scopes.

From the chapter folder, create a scratch repository. The local identity
and hook settings apply only to this scratch repository and its worktrees.

```sh
chapter_dir="$PWD"
scratch="$(mktemp -d)"
integration="$scratch/integration"
mkdir "$integration" "$scratch/hooks"
cp -R "$chapter_dir/starter/." "$integration/"
git -C "$integration" init -b integration
git -C "$integration" config --local user.name 'Relay Lab'
git -C "$integration" config --local user.email 'relay-lab@example.invalid'
git -C "$integration" config --local commit.gpgSign false
git -C "$integration" config --local core.hooksPath "$scratch/hooks"
git -C "$integration" add .
git -C "$integration" commit -m 'Freeze the handoff contract and tests'
base="$(git -C "$integration" rev-parse HEAD)"

for lane in priority deadline ownership; do
  git -C "$integration" worktree add -b "lab/$lane" "$scratch/$lane" "$base"
done
```

**Verify it.** `git -C "$integration" worktree list` shows four checkouts
at the same commit. Run the starter suite from the integration worktree.
All five tests should fail on assertions because the three
formatters still return the starter values. A setup, syntax or import
error would be a different failure to fix before dispatch.

```sh
(cd "$integration" && node --test test/handoff.test.mts)
```

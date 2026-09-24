#!/usr/bin/env sh
# Runs the `code-reviewer` Claude agent on the commits being pushed to main.
# Called from .husky/pre-push with git's pre-push stdin piped in.
# Skip with: SKIP_AI_REVIEW=1 git push

[ "$SKIP_AI_REVIEW" = "1" ] && { echo "⏭  AI review skipped (SKIP_AI_REVIEW=1)"; exit 0; }

if ! command -v claude >/dev/null 2>&1; then
  echo "⚠️  claude CLI not found — skipping AI review"
  exit 0
fi

ZERO=0000000000000000000000000000000000000000
range=""

# stdin lines: <local ref> <local sha> <remote ref> <remote sha>
while read -r local_ref local_sha remote_ref remote_sha; do
  [ "$remote_ref" = "refs/heads/main" ] || continue
  [ "$local_sha" = "$ZERO" ] && continue # deleting main, nothing to review
  if [ "$remote_sha" = "$ZERO" ]; then
    range="origin/main...$local_sha"
  else
    range="$remote_sha..$local_sha"
  fi
done

[ -z "$range" ] && exit 0 # not pushing to main

# Only app code is worth an AI review; skip pushes that touch just scripts/docs/config.
if [ -z "$(git diff --name-only "$range" -- src/)" ]; then
  echo "⏭  AI review skipped (no changes under src/)"
  exit 0
fi

echo "🤖 Running AI code review on $range ..."

# Embed the diff so the agent doesn't spend turns fetching it (capped to keep it fast).
diff_text=$(git diff "$range" -- src/ | head -c 60000)

# Prompt goes via stdin: --allowedTools is variadic and would swallow a positional prompt.
prompt="Review exactly the commits in range $range. The diff (src/ only, possibly truncated) is below — use it directly; only read files when you need surrounding context, and use git diff $range if it was truncated. Lint, tests and build are already run by the pre-push hook, so skip running them.

$diff_text"

timeout_s=${AI_REVIEW_TIMEOUT:-600}
out_file=$(mktemp)
trap 'rm -f "$out_file"' EXIT

# Run in the background so we can show progress and enforce a timeout
# (claude -p prints nothing until the review is finished).
echo "$prompt" | claude -p \
  --agent code-reviewer \
  --allowedTools "Read,Grep,Glob,Bash(git diff:*),Bash(git log:*),Bash(git show:*),Bash(git status:*),Bash(git ls-files:*)" \
  >"$out_file" 2>&1 &
pid=$!

elapsed=0
while kill -0 "$pid" 2>/dev/null; do
  if [ "$elapsed" -ge "$timeout_s" ]; then
    kill "$pid" 2>/dev/null
    echo ""
    echo "⚠️  AI review timed out after ${timeout_s}s — not blocking push (raise with AI_REVIEW_TIMEOUT=900)"
    exit 0
  fi
  printf "\r   ⏳ reviewing... %ss (Ctrl+C to abort, SKIP_AI_REVIEW=1 to skip)" "$elapsed"
  sleep 5
  elapsed=$((elapsed + 5))
done
echo ""

wait "$pid"
status=$?
output=$(cat "$out_file")

echo "$output"

if [ $status -ne 0 ]; then
  echo "⚠️  AI review failed to run (exit $status) — not blocking push"
  exit 0
fi

if echo "$output" | tail -n 5 | grep -q "REVIEW_RESULT: FAIL"; then
  echo ""
  echo "❌ AI review requested changes — push blocked."
  echo "   Fix the 🔴 items, or bypass with: SKIP_AI_REVIEW=1 git push"
  exit 1
fi

echo "✅ AI review passed"

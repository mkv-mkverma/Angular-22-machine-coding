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

echo "🤖 Running AI code review on $range ..."

# Prompt goes via stdin: --allowedTools is variadic and would swallow a positional prompt.
prompt="Review exactly the commits in range $range (use: git diff $range). Lint, tests and build are already run by the pre-push hook, so skip running them."

output=$(echo "$prompt" | claude -p \
  --agent code-reviewer \
  --allowedTools "Read,Grep,Glob,Bash(git diff:*),Bash(git log:*),Bash(git show:*),Bash(git status:*),Bash(git ls-files:*)")
status=$?

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

#!/usr/bin/env sh
# Runs tests and build for .husky/pre-push. If a step fails, its output is
# handed to Claude to fix, and the push is blocked so the fix can be reviewed
# and committed before pushing again.
# Skip the auto-fix with: SKIP_AI_FIX=1 git push
# Output of the last failed step is kept in .git/last-pre-push-failure.log

log="$(git rev-parse --git-dir)/last-pre-push-failure.log"
status_file=$(mktemp)
trap 'rm -f "$status_file"' EXIT

ai_fix() {
  step=$1

  if [ "$SKIP_AI_FIX" = "1" ]; then
    echo "⏭  AI fix skipped (SKIP_AI_FIX=1). Full output: $log"
    return
  fi
  if ! command -v claude >/dev/null 2>&1; then
    echo "⚠️  claude CLI not found — skipping AI fix. Full output: $log"
    return
  fi

  echo ""
  echo "🤖 '$step' failed — asking Claude to fix it (full output: $log) ..."

  # Strip ANSI colors and cap the size so the prompt stays small.
  failure=$(perl -pe 's/\e\[[0-9;]*m//g' "$log" | tail -c 40000)

  prompt="The pre-push check '$step' failed in this Angular repo. Its output (possibly truncated) is below.
Find the root cause and fix it. Follow CLAUDE.md conventions. If production code is wrong, fix the code;
only change a test when the test itself is wrong. Never delete, skip, or loosen tests just to make them pass.
Re-run '$step' to confirm it passes, then summarize what you changed and why.

$failure"

  echo "$prompt" | claude -p \
    --allowedTools "Read,Edit,Write,Grep,Glob,Bash(npm test:*),Bash(npx ng test:*),Bash(npm run build:*),Bash(git diff:*),Bash(git status:*)"

  echo ""
  echo "📝 Claude's changes are in your working tree — review with 'git diff', commit, then push again."
}

run_step() {
  step=$1
  shift
  { "$@" 2>&1; echo "$?" >"$status_file"; } | tee "$log"
  [ "$(cat "$status_file")" = "0" ] && return 0

  ai_fix "$step"
  echo "❌ '$step' failed — push blocked."
  exit 1
}

run_step "npm test" npm test
run_step "npm run build" npm run build
rm -f "$log"

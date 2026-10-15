npm init playwright@latest

npx playwright test

npx playwright test --project=chromium

npx playwright show-report

# Run all Playwright tests (Chromium + WebKit; Firefox only on CI)

npx playwright test

# Run only your autocomplete test

npx playwright test tests/autocomplete.spec.ts

# Watch it in a real browser window

npx playwright test tests/autocomplete.spec.ts --project=chromium --headed

# Interactive UI mode: click Run, then click each step to see the page (best for learning)

npx playwright test --ui

# Open the HTML report from the last run

npx playwright show-report

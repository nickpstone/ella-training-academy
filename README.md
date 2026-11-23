# Ella’s Training Academy

A mobile-first training journal for Ella, a miniature schnauzer. Use it on a phone or desktop to practise one skill at a time, record short sessions and see how Ella’s responses change over time. The dashboard illustration is generated artwork of a miniature schnauzer. A new install starts with an empty journal.

## Development

Use Node.js 24 and npm.

```sh
npm install
npm run dev
```

Open the URL Vite prints. The React and TypeScript UI lives in `src`. The curriculum is in `src/curriculum.ts`, the progression engine in `src/training.ts`, and IndexedDB and backup validation in `src/storage.ts`. Tailwind and the app’s light and dark theme styles are in `src/styles.css`.

## Practising with Ella

Start with the suggested exercise or open **Training path** to read the instructions. Set a three-, four- or five-minute timer. Count an attempt at the difficulty shown on the session card, and use **Undo last attempt** to correct an entry. If Ella struggles, pause and make the next repetition easier. Keep easier warm-ups out of the current level’s count. Finish at any time, add an optional note and save. **Progress** shows recorded sessions and success rates by dimension. **Make today a rest day** replaces the daily practice suggestion until you resume or the local day changes.

Say “Yes!” when Ella gets it right and always follow it with a reward. Feed in position for sits and return to Ella before marking or feeding on distance exercises. Say “Free!” to release her. If a repetition goes wrong, reset calmly and lower the challenge.

The six weeks describe the order of skills. Two sessions at the same level with at least five attempts and at least 80% success each earn advancement. At 60–79%, repeat. Below 60%, simplify the next practice. Each exercise increases one dimension at a time and completing its final level unlocks the next exercise. Mastered work remains available to revisit.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Vitest covers progression, backup validation, IndexedDB transactions and a React Testing Library session flow. Playwright runs desktop and Pixel 7 profiles against a production build at `/ella-training-academy/`, including an offline reload after the service worker takes control. In Linux CI, use `npx playwright install --with-deps chromium` to install browser system dependencies. The **CI** workflow runs on pushes and pull requests.

## Deployment and offline use

To preview a GitHub Pages-style build locally:

```sh
VITE_BASE_PATH=/ella-training-academy/ npm run build
VITE_BASE_PATH=/ella-training-academy/ npm run preview
```

For deployment, choose **GitHub Actions** under the repository’s **Settings → Pages** after confirming the repository and Pages audience are suitable. Availability and access controls for Pages on a private repo depend on the GitHub plan. Manually run **Deploy to GitHub Pages** from the Actions tab. The workflow uses the configured Pages base path, uploads `dist`, and reports the deployed URL on the environment. The app uses hash navigation and emits a `404.html` shell for unmatched Pages paths.

Open the deployed app online once on each device so it can download and cache the app shell. Use the browser’s **Install app** or **Add to Home screen** menu where available. The production service worker caches the dashboard illustration, icons, and bundled app assets under its own scope. A newly downloaded version activates once tabs using the previous version close.

## Backup and restore

Training data lives in IndexedDB for the current browser profile and origin. To move devices or protect against cleared browser data, open **Ella’s profile → Backup & restore → Export backup**. The versioned JSON contains profile details, theme, rest dates and session history. Keep the file somewhere safe.

Choose **Import backup** to validate the file and preview its session count. **Restore backup** replaces the current local data in one transaction. Export your current data first if you want to keep a copy. Backups are local files and the app does not sync between devices.

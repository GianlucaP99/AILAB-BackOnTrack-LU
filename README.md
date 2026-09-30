# Road to Target

A self-contained, offline-first web app for Wavestone Luxembourg's **Back on Track** game (1 October–31 December 2026). Open `index.html` directly in a modern browser or host it on GitHub Pages. No server, account, CDN, or network connection is required.

## Contributor use

1. Choose **Contributor**, complete **Profile**, and save it. Name, email, and grade are required before activities can be added, so every activity is correctly linked to your activity list.
2. Use **Add** to record activities as drafts. The app calculates points and warns when an activity cap applies.
3. Check progress on **Dashboard**. Both delivery and business targets must be met to earn Bronze (100%), Silver (115%), or Gold (130%).
4. In **Data**, export your submission. This marks current drafts as Submitted and downloads `surname_firstname_YYYY-MM.json`.
5. In **Data**, you can import a previously exported submission to restore or merge your own entries (the profile is restored if this browser has no profile yet). Import `catalogue.json` supplied by a reviewer when it changes, then later import that reviewer's `*_reviewed.json` to see decisions and comments.

## Reviewer use

1. Choose **Reviewer** (this is deliberately not authentication), then manage activities under **Catalogue** and export `catalogue.json` for contributors.
2. In **Import**, drag in one or more contributor JSON submissions. The app validates them and preserves entries already imported.
3. Review submissions in **Queue**; filters and bulk approval are available, and rejections require a comment.
4. Use **Merge** to find likely duplicates and potential team wins. Linking and merging preserve an audit record.
5. Use **Leaderboard** to view the league rankings, anonymise the display, export each reviewed contributor file, or download `master.json` and `master.csv`.

## JSON flow and safety

Every exported JSON document contains `schemaVersion: 1`, the `road-to-target` application marker, unique entry IDs, timestamps, and audit fields. Files are validated on import and errors are shown without replacing data. Browser data is held in `localStorage`; export `master.json` regularly as a backup. **Reset local data** permanently clears only this app's browser data after confirmation.

Test files are provided in [`samples/`](samples/): import both files through the Reviewer **Import** screen to try the queue and leaderboard.

## GitHub Pages

1. Commit and push this repository to GitHub.
2. In the repository, open **Settings → Pages**.
3. Select **Deploy from a branch**, choose the branch containing this file and the `/ (root)` folder, then save.
4. Open the published URL once GitHub reports the deployment complete.

# Back on Track: Growth Challenge

A self-contained, offline-first web app for Wavestone Luxembourg's **Back on Track: Growth Challenge** (1 October–31 December 2026). Open `index.html` directly in a modern browser or host it on GitHub Pages. No server, account, CDN, or network connection is required.

## Contributor use

1. Choose **Contributor**, complete **Profile**, and save it. Name, email, and grade are required before activities can be added, so every activity is correctly linked to your activity list.
2. Use **Add** to record activities as drafts. The app calculates points and warns when an activity cap applies.
3. Check progress on **Dashboard**. Both delivery and business targets must be met to earn Bronze (100%), Silver (115%), or Gold (130%).
4. In **Data**, export your submission. This marks current drafts as Submitted and downloads `surname_firstname_YYYY-MM.json`.
5. In **Data**, use the clearly labelled **Import my submission** button to restore or merge your own exported entries (the profile is restored if this browser has no profile yet). Use **Import catalogue** when a reviewer sends you a new `catalogue.json`.
6. Use **Submission** to create the review JSON or choose **Report end of month to management**. This downloads the report and opens a pre-addressed email draft to `gianluca.pasolini@wavestone.com` only by default; add optional CC recipients, then attach the downloaded JSON manually before sending.

## Reviewer use

1. Choose **Reviewer** (this is deliberately not authentication), then manage activities under **Catalogue** and export `catalogue.json` for contributors.
2. In **Import**, drag in one or more contributor JSON submissions. The app validates them and preserves entries already imported.
3. Review submissions in **Queue**; filters and bulk approval are available, and rejections require a comment.
4. Use **Merge** to find likely duplicates and potential team wins. Linking and merging preserve an audit record.
5. Use **Leaderboard** to view the top three in each league, anonymise the public display, export each reviewed contributor file, or download `master.json` and `master.csv`. Use **Standings** for the complete ranked contributor list in both leagues.

## JSON flow and safety

Every exported JSON document contains `schemaVersion: 1`, the `road-to-target` application marker, unique entry IDs, timestamps, and audit fields. Files are validated on import and errors are shown without replacing data. Browser data is held in `localStorage`; export `master.json` regularly as a backup. **Reset local data** permanently clears only this app's browser data after confirmation.

Fifteen test contributor submissions are provided in [`samples/`](samples/): select or drop them together through the Reviewer **Import** screen to try bulk import, the queue, and leaderboard. The Reviewer **Import** screen also has an **Inject 15 demo submissions** button for a one-click local demo.

## Collaboration and shared data

GitHub Pages serves static files only. Each browser therefore has its own `localStorage` and cannot see another person's changes in real time; this is intentional for the no-backend/offline design. The collaboration flow is: reviewer exports `catalogue.json` → contributors import it and export submissions → reviewer bulk-imports and reviews them → reviewer exports each reviewed file and the consolidated master backup. Real-time shared editing would require a backend/service (for example Microsoft 365, SharePoint, Firebase, or another approved company system) and cannot be added to a fully offline static page.

## GitHub Pages

1. Commit and push this repository to GitHub.
2. In the repository, open **Settings → Pages**.
3. Select **Deploy from a branch**, choose the branch containing this file and the `/ (root)` folder, then save.
4. Open the published URL once GitHub reports the deployment complete.

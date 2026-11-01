# Prompt Forge

A free, client-side Grok prompt builder. Type a rough idea in the browser and Prompt Forge turns it into a structured prompt: a time window, where to search (the web, X, or both), who the answer is for, and how to format the result. Research, social listening, competitor scans, meeting prep, posts, file analysis, and decisions each use their own template.

Everything runs locally. There is no build step, no account, and no server — `index.html`, `styles.css`, and `app.js` are the whole site. Nothing is sent anywhere until you copy the prompt or open it in Grok yourself.

## Use it

Open `index.html` in a browser, or visit the GitHub Pages site: https://c0resmith.github.io/prompt-forge/

## Deploy

Pushes to `main` publish the repository root with GitHub Actions (`.github/workflows/pages.yml`). Pages is configured to build from GitHub Actions.

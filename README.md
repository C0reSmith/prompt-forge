# Prompt Forge

A free, client-side AI prompt generator. Type a rough idea in the browser, pick a target model, and Prompt Forge turns it into a structured prompt: a time window, where to look, who the answer is for, and how to format the result.

Targets are ChatGPT, Claude, Gemini, Grok, Perplexity, Copilot, Meta AI, DeepSeek, and Any / Generic (the default). The wording follows the model. Posts on X show up only for Grok. Perplexity prompts ask for cited web sources. Claude prompts use labeled sections. ChatGPT, Claude, Perplexity, and Grok can open with the prompt filled in. The others copy it so you can paste. Copy always works.

Research, social listening, competitor scans, meeting prep, posts, file analysis, and decisions each use their own template.

Everything runs locally. There is no build step, no account, and no server — `index.html`, `styles.css`, and `app.js` are the whole site. Nothing is sent anywhere until you copy the prompt or open it in an AI yourself.

## Use it

Open `index.html` in a browser, or visit the GitHub Pages site: https://c0resmith.github.io/prompt-forge/

## Deploy

Pushes to `main` publish the repository root with GitHub Actions (`.github/workflows/pages.yml`). The GitHub Pages source is GitHub Actions.

# BestRot — Brainrot Studio (starter build)

A local-first, responsive React + TypeScript starter for a Brainrot video creation studio. It is designed to run without paid API keys.

## Current features

- Responsive dark/light interface, Hebrew RTL and English LTR UI.
- Project concept/style/length/language/ratio settings.
- Local idea templates and editable script draft.
- Optional Gemini 2.5 Flash script generation after the user explicitly clicks **Write with AI** and supplies their own API key in Settings. API availability/quotas depend on Google AI Studio account and current limits.
- One-click, local 12-second animated motion-graphics video export from project text, no uploaded footage required. This produces a real WebM file in the browser, but is not AI-generated footage and currently has no generated voice/music.
- Upload and preview multiple local video clips.
- Editable title and caption overlay preview, caption color, aspect ratio, and source-audio volume.
- Browser-side video export to **WebM** with text overlays and, when browser support permits, source audio.
- Save project settings in localStorage; export project JSON and script Markdown.
- Local project list and starter idea lab.

## Important limitations

This is a functional starter, not a complete AI video-generation service. Gemini is used only for optional text/script generation; no external generative-video model, live trend API, voice-generation provider, music catalog, cloud sync, MP4 encoder, or YouTube upload integration is connected yet. The motion-video exporter animates text and graphics locally; it does not create photorealistic AI scenes. Trend cards are sample ideas, not live trends. Export is WebM and depends on browser/device support; audio capture support varies. Local project data stays in the current browser profile and does not sync across devices. Uploaded source files are not embedded in the exported project JSON.

## Run locally

Requires Node.js 20 or newer (recommended).

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build

```bash
npm run build
npm run preview
```

## Put it on GitHub

1. Create a new repository named `BestRot` on GitHub.
2. Extract this ZIP and upload the **contents** of the `BestRot` folder (not the ZIP itself) to the repository.
3. This project includes a GitHub Actions workflow in `.github/workflows/deploy.yml`. In the repository, open **Settings → Pages** and set the source to **GitHub Actions**. The workflow will build and publish the static site when you push to the `main` branch.
4. You can also import the repository into Vercel or Netlify. For those platforms, use build command `npm run build` and output directory `dist`.

GitHub stores the code; the Pages workflow publishes this browser-only starter. Later server-side AI integrations may need a serverless backend.

## Roadmap for a production version

1. Add a provider-neutral AI adapter and secure server-side API routes for text, voice, image and video providers.
2. Add real trend ingestion using official/authorized APIs, freshness timestamps and source links.
3. Add a timeline editor with per-clip timing, captions, audio/music tracks, effects and transitions.
4. Add a reliable MP4 export pipeline and device capability checks.
5. Add secure, user-consented YouTube OAuth and upload flow.
6. Add optional account/cloud sync, licensing metadata and project backups.

The optional Gemini key is entered by the user in the browser and saved in that browser localStorage for this personal-use starter; it is not included in the source code or ZIP. Do not enter a key into a public/shared device or share a browser profile containing it. For a public multi-user production app, move AI calls behind a server-side API and keep secrets in server-side environment variables.

# BestRot Studio

BestRot is a browser-based Brainrot video concept and editing starter built with React, TypeScript and Vite.

## Deploy to Vercel from GitHub

1. Upload the **contents** of this `BestRot` folder to the root of your GitHub repository (so `package.json`, `index.html`, `src/`, `tsconfig.json`, and `vite.config.ts` are directly at repository root). Do not upload the ZIP file itself.
2. In Vercel choose **Add New → Project**, import the same GitHub repository, and authorize access if prompted.
3. In project configuration set **Root Directory** to `.` (repository root). Do not point it at `src`.
4. Use these settings (the included `vercel.json` already declares them):
   - Framework Preset: **Vite**
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**. Future pushes to the connected branch (usually `main`) trigger new deployments automatically.

## Fix common Vercel build errors

- **No inputs were found / include paths were ["src"]**: check that Vercel's Root Directory is the repository root (`.`), and that `src/App.tsx` and `src/main.tsx` were uploaded. `tsconfig.app.json` includes `src`. Do not set the root directory to `src`.
- **Could not find package.json**: upload the folder contents, not a nested `BestRot/BestRot` folder. `package.json` must be at the root selected in Vercel.
- **Build command failed**: use `npm run build`. The script checks the TypeScript app project and then builds with Vite.
- **Old error after fixing files**: in Vercel open the latest deployment and redeploy after confirming the new files are committed to GitHub.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Check/build with:

```bash
npm run check
npm run build
npm run preview
```

## Current capabilities and limitations

- Responsive Hebrew/English interface and project settings.
- Idea and script drafting, local clip preview, editable text/caption overlays.
- Browser-side WebM motion-graphics export, where supported by the browser.
- Optional Gemini script generation when the user supplies their own API key.

This is not yet a complete AI video generation service: real generative-video, voice/music providers, live trend ingestion, MP4 export, cloud sync, and direct YouTube upload are not connected. The built-in animation exporter creates a real WebM motion-graphics file; it does not generate AI video footage.

## Security note

Do not commit API keys to GitHub. The current optional Gemini integration runs in the browser and is intended only for personal experimentation; a public multi-user deployment should use a server-side endpoint and server-side environment variables.

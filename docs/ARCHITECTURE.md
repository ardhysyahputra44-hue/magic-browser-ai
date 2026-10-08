# Stage 2 Architecture

React UI persists state through `src/store/appStore.ts` and `src/services/storage/localStorage.ts`.

Browser behavior remains isolated behind `BrowserRuntime`:

```text
React UI
  |
BrowserRuntime ---------------- GeminiService
  |                                      |
MockBrowserRuntime                 MockGeminiService
  |                                      |
future Electron runtime             future Node server
  |
Chromium/WebContentsView
```

The next production boundary is server-side Gemini calls. Google AI Studio Build Mode supports full-stack web apps with React on the client and Node.js on the server, plus server-side secrets. https://ai.google.dev/gemini-api/docs/aistudio-build-mode

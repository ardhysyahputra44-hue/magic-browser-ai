# Magic Browser AI — Stage 2

Stage 2 adds durable browser state and richer MockBrowserRuntime while keeping the project compatible with Google AI Studio web preview.

## Added
- localStorage persistence (`magic-browser-ai:state:v2`)
- group creation / deletion
- tab history with back/forward/reload
- normalized address navigation (URL or Google search)
- AI service abstraction + MockGeminiService
- settings shell and reset local data
- preserved BrowserRuntime boundary for future Electron implementation

## Next
Stage 3 = real Gemini server-side service using `@google/genai`, with sanitized page context.

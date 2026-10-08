export interface PageContext {
  url: string;
  title: string;
  selectedText?: string;
  visibleText?: string;
}

export interface GeminiRequest {
  prompt: string;
  context?: PageContext;
}

export interface GeminiService {
  ask(request: GeminiRequest): Promise<string>;
}

export class MockGeminiService implements GeminiService {
  async ask(request: GeminiRequest) {
    const title = request.context?.title || 'halaman aktif';
    return `Demo Stage 2: saya menerima pertanyaan tentang ${title}. Gemini API nyata akan dipasang pada Stage 3 melalui server-side runtime.`;
  }
}

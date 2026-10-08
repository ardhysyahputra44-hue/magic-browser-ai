import type { BrowserGroup, BrowserState, BrowserTab, ProxyConfig } from '../../types/models';
import { makeTab } from '../../store/appStore';

export interface BrowserRuntime {
  init(state: BrowserState): Promise<void>;
  createTab(groupId: string, url?: string): Promise<BrowserTab>;
  activateTab(groupId: string, tabId: string): Promise<void>;
  closeTab(groupId: string, tabId: string): Promise<void>;
  navigate(groupId: string, tabId: string, input: string): Promise<string>;
  back(groupId: string, tabId: string): Promise<string | undefined>;
  forward(groupId: string, tabId: string): Promise<string | undefined>;
  reload(groupId: string, tabId: string): Promise<string | undefined>;
  setGroupProxy(groupId: string, proxy?: ProxyConfig): Promise<void>;
  setTabProxy(groupId: string, tabId: string, proxy?: ProxyConfig): Promise<void>;
}

function normalize(input: string) {
  const value = input.trim();
  if (!value) return 'about:blank';
  if (/^(https?|about):\/\//i.test(value)) return value;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) return `https://${value}`;
  return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
}

function titleOf(url: string) {
  if (url === 'about:blank') return 'Tab Baru';
  try { return new URL(url).hostname; } catch { return url.slice(0, 32); }
}

export class MockBrowserRuntime implements BrowserRuntime {
  private state!: BrowserState;
  async init(state: BrowserState) { this.state = state; }
  private group(id: string): BrowserGroup { const g = this.state.groups.find(x => x.id === id); if (!g) throw new Error('Group tidak ditemukan'); return g; }
  private tab(groupId: string, tabId: string) { const t = this.group(groupId).tabs.find(x => x.id === tabId); if (!t) throw new Error('Tab tidak ditemukan'); return t; }

  async createTab(groupId: string, url?: string) {
    const g = this.group(groupId);
    const tab = makeTab(groupId, url ?? g.url);
    g.tabs.push(tab); g.activeTabId = tab.id;
    return tab;
  }
  async activateTab(groupId: string, tabId: string) { const g = this.group(groupId); this.tab(groupId, tabId); g.activeTabId = tabId; }
  async closeTab(groupId: string, tabId: string) { const g = this.group(groupId); g.tabs = g.tabs.filter(t => t.id !== tabId); if (g.activeTabId === tabId) g.activeTabId = g.tabs.at(-1)?.id; }
  async navigate(groupId: string, tabId: string, input: string) {
    const t = this.tab(groupId, tabId); const url = normalize(input);
    t.url = url; t.title = titleOf(url); t.history = [...t.history.slice(0, t.historyIndex + 1), url]; t.historyIndex = t.history.length - 1;
    return url;
  }
  async back(groupId: string, tabId: string) { const t = this.tab(groupId, tabId); if (t.historyIndex <= 0) return t.url; t.historyIndex -= 1; t.url = t.history[t.historyIndex]; t.title = titleOf(t.url); return t.url; }
  async forward(groupId: string, tabId: string) { const t = this.tab(groupId, tabId); if (t.historyIndex >= t.history.length - 1) return t.url; t.historyIndex += 1; t.url = t.history[t.historyIndex]; t.title = titleOf(t.url); return t.url; }
  async reload(groupId: string, tabId: string) { const t = this.tab(groupId, tabId); return t.url; }
  async setGroupProxy(groupId: string, proxy?: ProxyConfig) { this.group(groupId).proxy = proxy; }
  async setTabProxy(groupId: string, tabId: string, proxy?: ProxyConfig) { this.tab(groupId, tabId).proxy = proxy; }
}

export function createBrowserRuntime(): BrowserRuntime { return new MockBrowserRuntime(); }

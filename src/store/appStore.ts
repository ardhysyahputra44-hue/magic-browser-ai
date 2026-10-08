import type { BrowserGroup, BrowserState, BrowserTab } from '../types/models';

export const STORAGE_KEY = 'magic-browser-ai:state:v2';

export const defaultGroups = [
  ['google', 'Google', 'https://www.google.com', 'G'],
  ['youtube', 'YouTube', 'https://www.youtube.com', 'Y'],
  ['gmail', 'Gmail', 'https://mail.google.com', 'M'],
  ['whatsapp', 'WhatsApp', 'https://web.whatsapp.com', 'W'],
  ['facebook', 'Facebook', 'https://www.facebook.com', 'F'],
  ['instagram', 'Instagram', 'https://www.instagram.com', 'I'],
  ['appscript', 'AppScript', 'https://script.google.com', 'A'],
  ['drive', 'G-Drive', 'https://drive.google.com', 'D'],
  ['aistudio', 'AI Studio', 'https://aistudio.google.com', 'AI'],
  ['chatgpt', 'ChatGPT', 'https://chatgpt.com', 'C'],
  ['other', 'URL Lainnya', 'https://www.google.com', '+']
] as const;

export function makeTab(groupId: string, url = 'about:blank'): BrowserTab {
  const tabId = crypto.randomUUID();
  const cleanUrl = url || 'about:blank';
  return {
    id: tabId,
    groupId,
    title: cleanUrl === 'about:blank' ? 'Tab Baru' : safeTitle(cleanUrl),
    url: cleanUrl,
    partition: `persist:magic-${groupId}-${tabId}`,
    muted: false,
    history: [cleanUrl],
    historyIndex: 0
  };
}

function safeTitle(url: string) {
  try { return new URL(url).hostname || 'Tab Baru'; } catch { return url.slice(0, 32) || 'Tab Baru'; }
}

export function createInitialState(): BrowserState {
  const groups: BrowserGroup[] = defaultGroups.map(([id, name, url, icon]) => ({ id, name, url, icon, tabs: [] }));
  return { version: 2, groups, activeGroupId: 'google', sidebarOpen: true, aiOpen: true, selectedUtility: null };
}

export function loadState(): BrowserState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as BrowserState;
    if (parsed.version !== 2 || !Array.isArray(parsed.groups)) return createInitialState();
    return normalizeState(parsed);
  } catch {
    return createInitialState();
  }
}

export function persistState(state: BrowserState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function normalizeState(state: BrowserState): BrowserState {
  return {
    ...createInitialState(),
    ...state,
    groups: (state.groups ?? []).map(g => ({
      ...g,
      tabs: (g.tabs ?? []).map(t => ({
        ...t,
        history: Array.isArray(t.history) && t.history.length ? t.history : [t.url],
        historyIndex: Number.isInteger(t.historyIndex) ? Math.min(Math.max(t.historyIndex, 0), Math.max(0, (t.history?.length ?? 1) - 1)) : 0,
      }))
    }))
  };
}

export function addGroup(state: BrowserState, name: string, url = 'https://www.google.com'): BrowserState {
  const id = `group-${crypto.randomUUID().slice(0, 8)}`;
  const group: BrowserGroup = { id, name: name.trim() || 'Group Baru', url, icon: '✦', tabs: [] };
  return { ...state, groups: [...state.groups, group], activeGroupId: id };
}

export function renameGroup(state: BrowserState, groupId: string, name: string): BrowserState {
  return { ...state, groups: state.groups.map(g => g.id === groupId ? { ...g, name: name.trim() || g.name } : g) };
}

export function removeGroup(state: BrowserState, groupId: string): BrowserState {
  if (state.groups.length <= 1) return state;
  const groups = state.groups.filter(g => g.id !== groupId);
  return { ...state, groups, activeGroupId: state.activeGroupId === groupId ? groups[0].id : state.activeGroupId };
}

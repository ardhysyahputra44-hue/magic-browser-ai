export type ProxyProtocol = 'http' | 'https' | 'socks4' | 'socks5';

export interface ProxyConfig {
  protocol: ProxyProtocol;
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export interface BrowserTab {
  id: string;
  groupId: string;
  title: string;
  url: string;
  favicon?: string;
  partition: string;
  muted: boolean;
  proxy?: ProxyConfig;
  history: string[];
  historyIndex: number;
}

export interface BrowserGroup {
  id: string;
  name: string;
  url: string;
  icon: string;
  hidden?: boolean;
  proxy?: ProxyConfig;
  tabs: BrowserTab[];
  activeTabId?: string;
}

export interface BrowserState {
  version: 2;
  groups: BrowserGroup[];
  activeGroupId: string;
  sidebarOpen: boolean;
  aiOpen: boolean;
  selectedUtility?: 'proxy' | 'downloads' | 'bookmarks' | null;
}

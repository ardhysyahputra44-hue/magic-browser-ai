import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Bot, Bookmark, ChevronDown, Download, Home, Menu, Plus, RotateCw, Search, Settings, Shield, Sparkles, X } from 'lucide-react';
import { createBrowserRuntime, type BrowserRuntime } from './services/browser/runtime';
import { MockGeminiService, type GeminiService } from './services/ai/gemini';
import { addGroup, loadState, persistState, removeGroup, renameGroup } from './store/appStore';
import type { BrowserGroup, BrowserState, BrowserTab } from './types/models';
import './styles.css';

const runtime: BrowserRuntime = createBrowserRuntime();
const ai: GeminiService = new MockGeminiService();

function App() {
  const [state, setState] = useState<BrowserState>(() => loadState());
  const [address, setAddress] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const group = useMemo(() => state.groups.find(g => g.id === state.activeGroupId) ?? state.groups[0], [state]);
  const tab = useMemo(() => group?.tabs.find(t => t.id === group.activeTabId), [group]);

  useEffect(() => { void runtime.init(state); persistState(state); }, [state]);

  const patch = (updater: (s: BrowserState) => BrowserState) => setState(s => updater(s));
  const sync = () => setState(s => ({ ...s, groups: s.groups.map(g => ({ ...g, tabs: [...g.tabs] })) }));

  async function openTab(g: BrowserGroup, url = g.url) { await runtime.createTab(g.id, url); sync(); }
  async function activate(g: BrowserGroup, t: BrowserTab) { await runtime.activateTab(g.id, t.id); setState(s => ({ ...s, activeGroupId: g.id })); sync(); }
  async function navigateTo(value: string) { if (!tab) return; await runtime.navigate(group.id, tab.id, value); setAddress(''); sync(); }
  async function runNav(kind: 'back' | 'forward' | 'reload') { if (!tab) return; await runtime[kind](group.id, tab.id); sync(); }
  async function askAi() {
    const prompt = aiPrompt.trim(); if (!prompt) return;
    setAiReply('Memproses…');
    setAiReply(await ai.ask({ prompt, context: tab ? { url: tab.url, title: tab.title } : undefined }));
  }

  return <div className="app-shell">
    <header className="topbar">
      <button className="icon-btn" onClick={() => setState(s => ({ ...s, sidebarOpen: !s.sidebarOpen }))}><Menu size={17}/></button>
      <div className="brand"><span className="brand-mark">✦</span><span>Magic Browser</span><em>AI</em></div>
      <div className="window-actions"><button className="icon-btn" onClick={() => setSettingsOpen(true)}><Settings size={16}/></button></div>
    </header>

    <div className="workspace">
      {state.sidebarOpen && <aside className="sidebar">
        <div className="section-title">GROUPS</div>
        <div className="group-list">
          {state.groups.filter(g => !g.hidden).map(g => <button key={g.id} className={`group-item ${g.id === state.activeGroupId ? 'active' : ''}`} onClick={() => patch(s => ({ ...s, activeGroupId: g.id }))}>
            <span className="group-icon">{g.icon}</span><span className="group-name">{g.name}</span><span className="group-count">{g.tabs.length}</span>
          </button>)}
        </div>
        <button className="add-group" onClick={() => setGroupModalOpen(true)}><Plus size={15}/>Tambah Group</button>
        <div className="sidebar-bottom">
          <button className="utility" onClick={() => patch(s => ({ ...s, selectedUtility: 'proxy' }))}><Shield size={15}/>Proxy Manager</button>
          <button className="utility" onClick={() => patch(s => ({ ...s, selectedUtility: 'downloads' }))}><Download size={15}/>Downloads</button>
          <button className="utility" onClick={() => patch(s => ({ ...s, selectedUtility: 'bookmarks' }))}><Bookmark size={15}/>Bookmarks</button>
        </div>
      </aside>}

      <main className="browser-pane">
        <div className="group-bar">
          <div className="group-title"><span className="group-icon">{group?.icon}</span><strong>{group?.name}</strong><ChevronDown size={14}/></div>
          <div className="group-bar-actions"><button className="pill-btn" onClick={() => group && openTab(group)}><Plus size={14}/> Tab Baru</button><button className={`pill-btn ai-pill ${state.aiOpen ? 'on' : ''}`} onClick={() => patch(s => ({ ...s, aiOpen: !s.aiOpen }))}><Sparkles size={14}/> AI</button></div>
        </div>
        <div className="tabs-row"><div className="tabs-scroll">{group?.tabs.map(t => <div key={t.id} className={`tab ${t.id === group.activeTabId ? 'active' : ''}`} onClick={() => group && activate(group, t)}><span className="tab-dot"/><span>{t.title}</span><button onClick={async e => { e.stopPropagation(); await runtime.closeTab(group.id, t.id); sync(); }}><X size={12}/></button></div>)}<button className="new-tab" onClick={() => group && openTab(group)}><Plus size={15}/></button></div></div>
        <div className="address-row">
          <div className="nav-controls"><button className="icon-btn" onClick={() => runNav('back')}><ArrowLeft size={16}/></button><button className="icon-btn" onClick={() => runNav('forward')}><ArrowRight size={16}/></button><button className="icon-btn" onClick={() => runNav('reload')}><RotateCw size={15}/></button><button className="icon-btn" onClick={() => { if (tab) void navigateTo(group.url); }}><Home size={15}/></button></div>
          <form className="address-box" onSubmit={e => { e.preventDefault(); void navigateTo(address || tab?.url || group.url); }}><Search size={15}/><input value={address} onChange={e => setAddress(e.target.value)} placeholder={tab?.url || 'Cari atau masukkan alamat'}/><button type="button" className="ai-address" onClick={() => patch(s => ({ ...s, aiOpen: true }))}><Bot size={15}/></button></form>
          <button className="icon-btn"><Shield size={16}/></button>
        </div>

        <div className="content-area">
          {tab ? <div className="mock-page"><div className="mock-toolbar"><span className="secure">● Aman</span><span>{tab.url}</span></div><div className="mock-content"><div className="mock-logo">{tab.title.charAt(0).toUpperCase()}</div><h1>{tab.title}</h1><p>Stage 2 aktif. State, tab history, group management, dan local persistence sekarang berjalan melalui <strong>MockBrowserRuntime</strong>.</p><div className="mock-cards"><div/><div/><div/></div></div></div> : <div className="welcome"><div className="sparkle">✦</div><h1>Magic Browser <span>AI</span></h1><p>Multi-session browser manager dengan AI Gemini.</p><button onClick={() => group && openTab(group)}><Plus size={16}/> Buka tab pertama</button></div>}
        </div>
      </main>

      {state.aiOpen && <aside className="ai-panel"><div className="ai-head"><div><span className="ai-badge"><Sparkles size={14}/> Gemini Assistant</span><h2>AI Browser Copilot</h2></div><button className="icon-btn" onClick={() => patch(s => ({ ...s, aiOpen: false }))}><X size={16}/></button></div><div className="ai-context"><div className="context-icon">✦</div><div><small>Current context</small><strong>{tab?.title || 'Belum ada tab aktif'}</strong></div></div><div className="suggestions"><button onClick={() => setAiPrompt('Ringkas halaman ini')}>Ringkas halaman</button><button onClick={() => setAiPrompt('Jelaskan isi halaman ini')}>Jelaskan halaman</button><button onClick={() => setAiPrompt('Ekstrak data penting dari halaman ini')}>Ekstrak data</button><button onClick={() => setAiPrompt('Buatkan poin tindakan dari halaman ini')}>Action items</button></div><div className="ai-chat">{aiReply ? <div className="ai-message">{aiReply}</div> : <div className="ai-empty"><Bot size={22}/><p>Stage 2 masih menggunakan MockGeminiService. Context tab sudah siap dikirim ke server pada Stage 3.</p></div>}</div><form className="ai-input" onSubmit={e => { e.preventDefault(); void askAi(); }}><input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Tanya AI tentang halaman..."/><button><Sparkles size={16}/></button></form></aside>}
    </div>

    {groupModalOpen && <div className="modal-backdrop"><div className="modal"><div className="modal-head"><h2>Tambah Group</h2><button className="icon-btn" onClick={() => setGroupModalOpen(false)}><X size={16}/></button></div><input autoFocus value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Nama group"/><div className="modal-actions"><button onClick={() => setGroupModalOpen(false)}>Batal</button><button className="primary" onClick={() => { setState(s => addGroup(s, newGroupName)); setNewGroupName(''); setGroupModalOpen(false); }}>Tambah</button></div></div></div>}
    {settingsOpen && <div className="modal-backdrop"><div className="modal wide"><div className="modal-head"><div><span className="ai-badge">Stage 2</span><h2>Settings</h2></div><button className="icon-btn" onClick={() => setSettingsOpen(false)}><X size={16}/></button></div><div className="settings-grid"><button>General</button><button>Appearance</button><button>Groups</button><button>Tabs</button><button>Proxy</button><button>Downloads</button><button>Bookmarks</button><button>Security</button><button>AI</button><button>Updates</button><button>License</button><button onClick={() => { localStorage.clear(); location.reload(); }}>Reset Local Data</button></div><div className="danger-zone"><strong>Active group</strong><span>{group?.name}</span><button onClick={() => { if (group) setState(s => removeGroup(s, group.id)); }}>Hapus Group</button></div></div></div>}
  </div>;
}

export default App;

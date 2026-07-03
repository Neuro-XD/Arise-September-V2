// ============================================================
// ui.js — Reusable UI helpers: modal, command palette, icons, formatting
// ============================================================

import { store } from './store.js';
import { router } from './router.js';
import { notifications } from './notifications.js';

const icon = {
  check: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  edit: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  flame: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  target: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  star: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  clock: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  trend: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  award: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
  download: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  bell: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
};

export const ui = {
  init() {
    const palette = document.getElementById('commandPalette');
    palette.querySelector('[data-close-palette]').addEventListener('click', () => this.closeCommandPalette());
    const modal = document.getElementById('modal');
    modal.querySelector('[data-close-modal]').addEventListener('click', () => this.closeModal());
    modal.querySelector('.modal__backdrop').addEventListener('click', () => this.closeModal());

    const cmdInput = document.getElementById('commandInput');
    cmdInput.addEventListener('input', () => this.filterCommands(cmdInput.value));
    cmdInput.addEventListener('keydown', (e) => this.handleCmdKey(e));
  },

  icon(name) { return icon[name] || ''; },

  updateActiveNav(route) {
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.route === route);
    });
  },

  openModal(title, bodyHtml) {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    modal.hidden = false;
    modal.style.display = 'grid';
    const first = modal.querySelector('input, textarea, select, button');
    if (first) setTimeout(() => first.focus(), 50);
  },

  closeModal() {
    const modal = document.getElementById('modal');
    modal.hidden = true;
    modal.style.display = 'none';
  },

  openCommandPalette() {
    const palette = document.getElementById('commandPalette');
    palette.hidden = false;
    palette.style.display = 'grid';
    this.buildCommands('');
    const input = document.getElementById('commandInput');
    input.value = '';
    input.focus();
  },

  closeCommandPalette() {
    const palette = document.getElementById('commandPalette');
    palette.hidden = true;
    palette.style.display = 'none';
  },

  buildCommands(query) {
    const list = document.getElementById('commandList');
    const q = query.toLowerCase().trim();
    const commands = [
      { group: 'Navigation', items: router.routes().map((r) => ({ label: r.charAt(0).toUpperCase() + r.slice(1), action: () => { router.navigate(r); this.closeCommandPalette(); }, icon: icon.bolt })) },
    ];
    const state = store.getState();
    commands.push({
      group: 'Quests',
      items: state.quests.filter((x) => !q || x.title.toLowerCase().includes(q)).slice(0, 5).map((x) => ({
        label: x.title,
        hint: `${x.xp} XP`,
        action: () => { router.navigate('quests'); this.closeCommandPalette(); },
        icon: icon.check,
      })),
    });

    let html = '';
    let idx = 0;
    commands.forEach((group) => {
      const filtered = group.items.filter((it) => !q || it.label.toLowerCase().includes(q));
      if (!filtered.length) return;
      html += `<div class="cmd-group">${group.group}</div>`;
      filtered.forEach((it) => {
        html += `<div class="cmd-item ${idx === 0 ? 'selected' : ''}" data-idx="${idx}">${it.icon}<span>${it.label}</span>${it.hint ? `<span class="cmd-item__hint">${it.hint}</span>` : ''}</div>`;
        idx++;
      });
    });
    if (!html) html = `<div class="cmd-group">No results</div>`;
    list.innerHTML = html;
    list.querySelectorAll('.cmd-item').forEach((el) => {
      el.addEventListener('click', () => {
        const i = parseInt(el.dataset.idx, 10);
        const all = list.querySelectorAll('.cmd-item');
        all[i]?.click();
      });
      el.addEventListener('mouseenter', () => {
        list.querySelectorAll('.cmd-item').forEach((x) => x.classList.remove('selected'));
        el.classList.add('selected');
      });
    });
    // rebind actions properly
    this._cmdActions = [];
    commands.forEach((group) => {
      group.items.filter((it) => !q || it.label.toLowerCase().includes(q)).forEach((it) => this._cmdActions.push(it.action));
    });
    list.querySelectorAll('.cmd-item').forEach((el, i) => {
      el.onclick = () => this._cmdActions[i]?.();
    });
  },

  filterCommands(q) { this.buildCommands(q); },

  handleCmdKey(e) {
    const list = document.getElementById('commandList');
    const items = list.querySelectorAll('.cmd-item');
    if (!items.length) return;
    const current = list.querySelector('.cmd-item.selected');
    let i = Array.from(items).indexOf(current);
    if (e.key === 'ArrowDown') { e.preventDefault(); i = Math.min(i + 1, items.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); i = Math.max(i - 1, 0); }
    else if (e.key === 'Enter') { e.preventDefault(); current?.click(); return; }
    items.forEach((x) => x.classList.remove('selected'));
    items[i]?.classList.add('selected');
    items[i]?.scrollIntoView({ block: 'nearest' });
  },

  formatTime(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(ts).toLocaleDateString();
  },

  formatDate(ts) {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  },

  todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  escape(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
};

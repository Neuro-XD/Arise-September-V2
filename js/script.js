// ============================================================
// script.js — Application entry point & module wiring
// ============================================================

import { store } from './store.js';
import { router } from './router.js';
import { ui } from './ui.js';
import { notifications } from './notifications.js';
import { particles } from './particles.js';
import { sounds } from './sounds.js';
import { theme } from './theme.js';
import { xp } from './xp.js';
import { quests } from './quests.js';
import { stats } from './stats.js';
import { achievements } from './achievements.js';
import { calendar } from './calendar.js';
import { settings } from './settings.js';

const app = {
  async init() {
    store.load();
    theme.apply(store.getState().settings.theme);
    particles.init(document.getElementById('particles'), store.getState().settings.particles);
    sounds.setEnabled(store.getState().settings.sound);
    ui.init();
    notifications.init(document.getElementById('notifications'));
    xp.init();
    quests.init();
    stats.init();
    achievements.init();
    calendar.init();
    settings.init();
    router.init();
    this.bindGlobal();
    this.seedIfEmpty();
    notifications.info('System Online', 'Welcome back, Hunter. Your daily quests await.');
  },

  bindGlobal() {
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    sidebarCollapse.addEventListener('click', () => {
      const collapsed = store.getState().settings.sidebarCollapsed;
      store.update('settings', { sidebarCollapsed: !collapsed });
      document.getElementById('app').classList.toggle('sidebar-collapsed', !collapsed);
    });

    const topbarMenu = document.getElementById('topbarMenu');
    const backdrop = document.getElementById('sidebarBackdrop');
    topbarMenu.addEventListener('click', () => document.getElementById('app').classList.add('sidebar-open'));
    backdrop.addEventListener('click', () => document.getElementById('app').classList.remove('sidebar-open'));

    document.getElementById('topbarAvatar').addEventListener('click', () => router.navigate('profile'));
    document.getElementById('topbarNotif').addEventListener('click', () => router.navigate('achievements'));

    const levelUp = document.getElementById('levelUp');
    levelUp.addEventListener('click', (e) => {
      if (e.target.closest('.level-up__content') && !e.target.closest('.level-up__close')) return;
      xp.dismissLevelUp();
    });

    const search = document.getElementById('commandSearch');
    search.addEventListener('focus', () => ui.openCommandPalette());
    search.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') search.blur();
    });

    document.addEventListener('keydown', (e) => this.handleShortcut(e));

    // ripple on buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });

    // apply collapsed state
    if (store.getState().settings.sidebarCollapsed) {
      document.getElementById('app').classList.add('sidebar-collapsed');
    }
  },

  handleShortcut(e) {
    const cmd = e.ctrlKey || e.metaKey;
    if (cmd && e.key.toLowerCase() === 'k') { e.preventDefault(); ui.openCommandPalette(); return; }
    if (cmd && e.key.toLowerCase() === 'n') { e.preventDefault(); router.navigate('achievements'); return; }
    if (cmd && e.key.toLowerCase() === 'b') { e.preventDefault(); document.getElementById('sidebarCollapse').click(); return; }
    if (cmd && e.key.toLowerCase() === 'd') { e.preventDefault(); router.navigate('dashboard'); return; }
    if (e.key === 'Escape') { ui.closeCommandPalette(); ui.closeModal(); xp.dismissLevelUp(); }
  },

  seedIfEmpty() {
    const state = store.getState();
    if (state.quests.length === 0) quests.seedDefaults();
    if (state.achievements.length === 0) achievements.seedDefaults();
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());

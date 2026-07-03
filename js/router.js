// ============================================================
// router.js — Hash-based client-side router
// ============================================================

import { store } from './store.js';
import { ui } from './ui.js';
import { renderDashboard } from './views/dashboard.js';
import { renderQuests } from './views/quests.js';
import { renderStats } from './views/stats.js';
import { renderAchievements } from './views/achievements.js';
import { renderCalendar } from './views/calendar.js';
import { renderProfile } from './views/profile.js';
import { renderSettings } from './views/settings.js';

const routes = {
  dashboard: { label: 'Dashboard', render: renderDashboard },
  quests: { label: 'Quests', render: renderQuests },
  stats: { label: 'Statistics', render: renderStats },
  achievements: { label: 'Achievements', render: renderAchievements },
  calendar: { label: 'Calendar', render: renderCalendar },
  profile: { label: 'Profile', render: renderProfile },
  settings: { label: 'Settings', render: renderSettings },
};

let current = 'dashboard';

export const router = {
  init() {
    window.addEventListener('hashchange', () => this.handle());
    this.handle();
    this.renderNav();
    store.subscribe(() => this.renderNav());
  },

  handle() {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const route = routes[hash] ? hash : 'dashboard';
    current = route;
    this.renderNav();
    const view = document.getElementById('view');
    if (!view) return;
    view.innerHTML = '';
    routes[route].render(view);
    ui.updateActiveNav(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderNav() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;
    const state = store.getState();
    const dailyCount = state.quests.filter((q) => q.type === 'daily' && !q.done).length;
    const achCount = state.achievements.filter((a) => !a.unlocked).length;

    const items = [
      { id: 'dashboard', label: 'Dashboard', icon: iconHome() },
      { id: 'quests', label: 'Quests', icon: iconQuest(), badge: dailyCount || null },
      { id: 'stats', label: 'Statistics', icon: iconStats() },
      { id: 'achievements', label: 'Achievements', icon: iconAch(), badge: achCount || null },
      { id: 'calendar', label: 'Calendar', icon: iconCal() },
      { id: 'profile', label: 'Profile', icon: iconProfile() },
      { id: 'settings', label: 'Settings', icon: iconSettings() },
    ];

    nav.innerHTML = items.map((it) => `
      <button class="nav-item ${it.id === current ? 'active' : ''}" data-route="${it.id}" title="${it.label}">
        ${it.icon}
        <span class="nav-item__label">${it.label}</span>
        ${it.badge ? `<span class="nav-item__badge">${it.badge}</span>` : ''}
      </button>
    `).join('');

    nav.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => this.navigate(btn.dataset.route));
    });
  },

  navigate(route) {
    if (!routes[route]) route = 'dashboard';
    window.location.hash = `/${route}`;
    document.getElementById('app').classList.remove('sidebar-open');
  },

  current() { return current; },
  routes() { return Object.keys(routes); },
};

function iconHome() { return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`; }
function iconQuest() { return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`; }
function iconStats() { return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`; }
function iconAch() { return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.5 13.5L17 22l-5-3-5 3 1.5-8.5"/></svg>`; }
function iconCal() { return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`; }
function iconProfile() { return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`; }
function iconSettings() { return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`; }

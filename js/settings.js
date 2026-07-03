// ============================================================
// settings.js — Settings controller (export/import/reset/toggles)
// ============================================================

import { store } from './store.js';
import { theme } from './theme.js';
import { particles } from './particles.js';
import { sounds } from './sounds.js';
import { notifications } from './notifications.js';

export const settings = {
  init() {},

  setTheme(name) {
    theme.apply(name);
    sounds.play('click');
  },

  setSound(on) {
    store.update('settings', { sound: on });
    sounds.setEnabled(on);
    if (on) sounds.play('click');
  },

  setParticles(on) {
    store.update('settings', { particles: on });
    particles.setEnabled(on);
  },

  setReduceMotion(on) {
    store.update('settings', { reduceMotion: on });
    document.documentElement.style.setProperty('--dur-fast', on ? '0ms' : '150ms');
    document.documentElement.style.setProperty('--dur-base', on ? '0ms' : '250ms');
    document.documentElement.style.setProperty('--dur-slow', on ? '0ms' : '400ms');
  },

  setSidebarCollapsed(on) {
    store.update('settings', { sidebarCollapsed: on });
    document.getElementById('app').classList.toggle('sidebar-collapsed', on);
  },

  exportData() {
    const data = store.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arise-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notifications.success('Data Exported', 'Backup file downloaded');
  },

  importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        store.importData(e.target.result);
        const s = store.getState().settings;
        theme.apply(s.theme);
        particles.setEnabled(s.particles);
        sounds.setEnabled(s.sound);
        notifications.success('Data Imported', 'Your progress has been restored');
      } catch (err) {
        notifications.error('Import Failed', 'Invalid backup file');
      }
    };
    reader.readAsText(file);
  },

  resetData() {
    store.reset();
    theme.apply('dark');
    particles.setEnabled(true);
    sounds.setEnabled(true);
    notifications.warning('Data Reset', 'All progress has been cleared');
  },

  updateProfile({ username, title, avatar }) {
    store.update('profile', {
      username: username || store.getState().profile.username,
      title: title || store.getState().profile.title,
      avatar: (avatar || username || 'S').charAt(0).toUpperCase(),
    });
    notifications.success('Profile Updated', '');
  },
};

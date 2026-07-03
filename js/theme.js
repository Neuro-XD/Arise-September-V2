// ============================================================
// theme.js — Theme application + persistence
// ============================================================

import { store } from './store.js';
import { particles } from './particles.js';

export const theme = {
  apply(name) {
    const valid = ['dark', 'light', 'purple', 'emerald'];
    if (!valid.includes(name)) name = 'dark';
    document.documentElement.setAttribute('data-theme', name);
    store.update('settings', { theme: name });
    // re-paint particles with new colors
    if (store.getState().settings.particles) {
      particles.setEnabled(false);
      requestAnimationFrame(() => particles.setEnabled(true));
    }
  },

  current() { return store.getState().settings.theme; },

  list() {
    return [
      { id: 'dark', label: 'Dark' },
      { id: 'light', label: 'Light' },
      { id: 'purple', label: 'Purple' },
      { id: 'emerald', label: 'Emerald' },
    ];
  },
};

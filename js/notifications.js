// ============================================================
// notifications.js — Toast notification queue with progress bar
// ============================================================

import { sounds } from './sounds.js';

const icons = {
  success: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  warning: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  error: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  info: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
};

const queue = [];
let active = 0;
const MAX_ACTIVE = 4;
const DEFAULT_DURATION = 4500;

export const notifications = {
  container: null,

  init(container) {
    this.container = container;
  },

  _show(type, title, msg, duration = DEFAULT_DURATION) {
    const item = { type, title, msg, duration };
    queue.push(item);
    this._drain();
  },

  _drain() {
    while (active < MAX_ACTIVE && queue.length) {
      const item = queue.shift();
      this._render(item);
      active++;
    }
  },

  _render({ type, title, msg, duration }) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${icons[type] || icons.info}</span>
      <div class="toast__body">
        <div class="toast__title">${this._esc(title)}</div>
        ${msg ? `<div class="toast__msg">${this._esc(msg)}</div>` : ''}
      </div>
      <button class="toast__close" aria-label="Dismiss">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="toast__progress" style="animation-duration:${duration}ms"></div>
    `;
    this.container.appendChild(toast);

    sounds.play(type);

    const remove = () => {
      if (toast.classList.contains('leaving')) return;
      toast.classList.add('leaving');
      setTimeout(() => {
        toast.remove();
        active--;
        this._drain();
      }, 250);
    };
    toast.querySelector('.toast__close').addEventListener('click', remove);
    const timer = setTimeout(remove, duration);
    toast.addEventListener('mouseenter', () => {
      clearTimeout(timer);
      const bar = toast.querySelector('.toast__progress');
      if (bar) bar.style.animationPlayState = 'paused';
    });
    toast.addEventListener('mouseleave', () => {
      const bar = toast.querySelector('.toast__progress');
      if (bar) bar.style.animationPlayState = 'running';
    });
  },

  _esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  },

  success(title, msg) { this._show('success', title, msg); },
  warning(title, msg) { this._show('warning', title, msg); },
  error(title, msg) { this._show('error', title, msg); },
  info(title, msg) { this._show('info', title, msg); },
};

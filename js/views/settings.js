// ============================================================
// views/settings.js — Settings view
// ============================================================

import { store } from '../store.js';
import { settings } from '../settings.js';
import { theme } from '../theme.js';
import { ui } from '../ui.js';

export function renderSettings(root) {
  const s = store.getState().settings;

  root.innerHTML = `
    <div class="view__header">
      <div>
        <h1 class="view__title">Settings</h1>
        <p class="view__subtitle">Customize your system and manage your data.</p>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section__title">Appearance</div>
      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">Theme</div>
          <div class="settings-row__hint">Choose your visual environment</div>
        </div>
        <div class="theme-picker" id="themePicker">
          ${theme.list().map((t) => `
            <button class="theme-swatch theme-swatch--${t.id} ${s.theme === t.id ? 'active' : ''}" data-theme="${t.id}" title="${t.label}" aria-label="${t.label}"></button>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section__title">Preferences</div>
      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">Sound Effects</div>
          <div class="settings-row__hint">Play sounds on actions and notifications</div>
        </div>
        ${toggle('sound', s.sound)}
      </div>
      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">Background Particles</div>
          <div class="settings-row__hint">Animated particle field</div>
        </div>
        ${toggle('particles', s.particles)}
      </div>
      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">Reduce Motion</div>
          <div class="settings-row__hint">Minimize animations and transitions</div>
        </div>
        ${toggle('reduceMotion', s.reduceMotion)}
      </div>
      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">Collapse Sidebar</div>
          <div class="settings-row__hint">Show icons only (Ctrl+B)</div>
        </div>
        ${toggle('sidebar', s.sidebarCollapsed)}
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section__title">Data Management</div>
      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">Export Data</div>
          <div class="settings-row__hint">Download a JSON backup of your progress</div>
        </div>
        <button class="btn" id="exportData">${ui.icon('download')} Export</button>
      </div>
      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">Import Data</div>
          <div class="settings-row__hint">Restore from a backup file</div>
        </div>
        <button class="btn" id="importData">${ui.icon('upload')} Import</button>
        <input type="file" id="importFile" accept="application/json" hidden />
      </div>
      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">Reset All Data</div>
          <div class="settings-row__hint">Permanently clear all progress — cannot be undone</div>
        </div>
        <button class="btn btn--danger" id="resetData">${ui.icon('trash')} Reset</button>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section__title">Keyboard Shortcuts</div>
      <div class="settings-row">
        <div class="settings-row__info"><div class="settings-row__label">Command Palette</div><div class="settings-row__hint">Quick search and navigation</div></div>
        <kbd>Ctrl</kbd> + <kbd>K</kbd>
      </div>
      <div class="settings-row">
        <div class="settings-row__info"><div class="settings-row__label">Toggle Sidebar</div><div class="settings-row__hint">Collapse or expand</div></div>
        <kbd>Ctrl</kbd> + <kbd>B</kbd>
      </div>
      <div class="settings-row">
        <div class="settings-row__info"><div class="settings-row__label">Dashboard</div><div class="settings-row__hint">Jump to dashboard</div></div>
        <kbd>Ctrl</kbd> + <kbd>D</kbd>
      </div>
      <div class="settings-row">
        <div class="settings-row__info"><div class="settings-row__label">Notifications</div><div class="settings-row__hint">View achievements</div></div>
        <kbd>Ctrl</kbd> + <kbd>N</kbd>
      </div>
    </div>

    <div class="card" style="text-align:center;color:var(--text-tertiary);font-size:0.82rem;">
      Project September V2 — Arise &middot; v2.0.0 &middot; Built for hunters, by hunters.
    </div>
  `;

  bind(root);
}

function toggle(id, checked) {
  return `
    <label class="toggle">
      <input type="checkbox" id="tog-${id}" ${checked ? 'checked' : ''} class="toggle__input" />
      <span class="toggle__track"><span class="toggle__thumb"></span></span>
    </label>
  `;
}

function bind(root) {
  root.querySelectorAll('.theme-swatch').forEach((b) => {
    b.addEventListener('click', () => {
      settings.setTheme(b.dataset.theme);
      root.querySelectorAll('.theme-swatch').forEach((x) => x.classList.toggle('active', x.dataset.theme === b.dataset.theme));
    });
  });

  root.querySelector('#tog-sound').addEventListener('change', (e) => settings.setSound(e.target.checked));
  root.querySelector('#tog-particles').addEventListener('change', (e) => settings.setParticles(e.target.checked));
  root.querySelector('#tog-reduceMotion').addEventListener('change', (e) => settings.setReduceMotion(e.target.checked));
  root.querySelector('#tog-sidebar').addEventListener('change', (e) => settings.setSidebarCollapsed(e.target.checked));

  root.querySelector('#exportData').addEventListener('click', () => settings.exportData());
  root.querySelector('#importData').addEventListener('click', () => root.querySelector('#importFile').click());
  root.querySelector('#importFile').addEventListener('change', (e) => {
    if (e.target.files[0]) settings.importData(e.target.files[0]);
  });
  root.querySelector('#resetData').addEventListener('click', () => {
    if (confirm('Reset ALL data? This cannot be undone.')) settings.resetData();
  });
}

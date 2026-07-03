// ============================================================
// views/dashboard.js — Main dashboard view
// ============================================================

import { store } from '../store.js';
import { quests } from '../quests.js';
import { achievements } from '../achievements.js';
import { ui } from '../ui.js';

export function renderDashboard(root) {
  const state = store.getState();
  const daily = quests.daily();
  const dailyDone = daily.filter((q) => q.done).length;
  const recent = state.activity.slice(0, 6);
  const recentAch = achievements.recent(3);

  root.innerHTML = `
    <div class="view__header">
      <div>
        <h1 class="view__title">Dashboard</h1>
        <p class="view__subtitle">${greeting()}, ${ui.escape(state.profile.username)}. ${dailyDone === daily.length && daily.length ? 'All daily quests complete.' : `${dailyDone}/${daily.length} daily quests done.`}</p>
      </div>
      <div class="view__actions">
        <button class="btn btn--primary" id="quickAddQuest">${ui.icon('plus')} New Quest</button>
      </div>
    </div>

    <div class="section">
      <div class="section__header">
        <h2 class="section__title">${ui.icon('check', 'section__title-icon')} Daily Quests</h2>
        <span class="section__count">${dailyDone}/${daily.length} complete</span>
      </div>
      <div class="grid grid--auto stagger" id="dashQuestList">
        ${daily.length ? daily.slice(0, 4).map(questCard).join('') : emptyState('No daily quests', 'Add a quest to begin your journey.')}
      </div>
    </div>

    <div class="grid grid--2">
      <div class="card">
        <div class="card__header"><span class="card__title">${ui.icon('trend')} Recent Activity</span></div>
        <div class="feed">
          ${recent.length ? recent.map(feedItem).join('') : '<div class="empty"><div class="empty__title">No activity yet</div></div>'}
        </div>
      </div>
      <div class="card">
        <div class="card__header"><span class="card__title">${ui.icon('award')} Recent Achievements</span></div>
        <div class="profile__recent">
          ${recentAch.length ? recentAch.map((a) => recentAchCard(a, ui)).join('') : '<div class="empty"><div class="empty__title">No achievements yet</div><div>Complete quests to unlock rewards.</div></div>'}
        </div>
      </div>
    </div>
  `;

  bindQuestCards(root);
  document.getElementById('quickAddQuest')?.addEventListener('click', () => openQuestModal());
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Burning the midnight oil';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function questCard(q) {
  const pct = q.target > 1 ? Math.min(100, (q.progress / q.target) * 100) : (q.done ? 100 : 0);
  return `
    <div class="quest ${q.done ? 'quest--done' : ''}" data-id="${q.id}">
      <div class="quest__top">
        <button class="quest__check" data-toggle aria-label="Toggle quest">${ui.icon('check')}</button>
        <div class="quest__body">
          <div class="quest__title">${ui.escape(q.title)}</div>
          ${q.desc ? `<div class="quest__desc">${ui.escape(q.desc)}</div>` : ''}
          <div class="quest__meta">
            <span class="quest__xp">${ui.icon('bolt')} ${q.xp} XP</span>
            ${q.target > 1 ? `<span class="chip">${q.progress}/${q.target}</span>` : ''}
          </div>
          ${q.target > 1 ? `<div class="quest__progress"><div class="progress"><div class="progress__fill" style="width:${pct}%"></div></div></div>` : ''}
        </div>
        <div class="quest__actions">
          <button class="quest__action" data-edit aria-label="Edit">${ui.icon('edit')}</button>
          <button class="quest__action quest__action--delete" data-delete aria-label="Delete">${ui.icon('trash')}</button>
        </div>
      </div>
    </div>
  `;
}

export function bindQuestCards(root) {
  root.querySelectorAll('.quest').forEach((el) => {
    const id = el.dataset.id;
    el.querySelector('[data-toggle]')?.addEventListener('click', () => quests.toggle(id));
    el.querySelector('[data-delete]')?.addEventListener('click', () => {
      if (confirm('Delete this quest?')) quests.remove(id);
    });
    el.querySelector('[data-edit]')?.addEventListener('click', () => openQuestModal(id));
  });
}

export function openQuestModal(id) {
  const q = id ? store.getState().quests.find((x) => x.id === id) : null;
  ui.openModal(q ? 'Edit Quest' : 'New Quest', `
    <div class="field"><label class="field__label">Title</label><input class="input" id="qfTitle" value="${q ? ui.escape(q.title) : ''}" placeholder="e.g. Morning Run" /></div>
    <div class="field"><label class="field__label">Description</label><textarea class="textarea" id="qfDesc" placeholder="Optional details">${q ? ui.escape(q.desc) : ''}</textarea></div>
    <div class="grid grid--2">
      <div class="field"><label class="field__label">XP Reward</label><input class="input" id="qfXp" type="number" min="1" value="${q ? q.xp : 50}" /></div>
      <div class="field"><label class="field__label">Target Count</label><input class="input" id="qfTarget" type="number" min="1" value="${q ? q.target : 1}" /></div>
    </div>
    <div class="field"><label class="field__label">Type</label>
      <select class="select" id="qfType">
        <option value="daily" ${q?.type === 'daily' ? 'selected' : ''}>Daily</option>
        <option value="weekly" ${q?.type === 'weekly' ? 'selected' : ''}>Weekly</option>
      </select>
    </div>
    <div class="modal__footer">
      ${q ? `<button class="btn btn--danger" id="qfDelete">Delete</button>` : ''}
      <button class="btn btn--ghost" id="qfCancel">Cancel</button>
      <button class="btn btn--primary" id="qfSave">${q ? 'Save' : 'Create Quest'}</button>
    </div>
  `);
  document.getElementById('qfCancel').onclick = () => ui.closeModal();
  document.getElementById('qfSave').onclick = () => {
    const title = document.getElementById('qfTitle').value.trim();
    if (!title) return;
    const data = {
      title,
      desc: document.getElementById('qfDesc').value.trim(),
      xp: parseInt(document.getElementById('qfXp').value, 10) || 10,
      target: parseInt(document.getElementById('qfTarget').value, 10) || 1,
      type: document.getElementById('qfType').value,
    };
    if (q) quests.edit(q.id, data);
    else quests.add(data);
    ui.closeModal();
  };
  if (q) document.getElementById('qfDelete').onclick = () => { quests.remove(q.id); ui.closeModal(); };
  setTimeout(() => document.getElementById('qfTitle').focus(), 50);
}

export function feedItem(a) {
  const dotClass = a.type === 'level' ? 'feed-item__dot--level' : a.type === 'ach' ? 'feed-item__dot--ach' : a.type === 'xp' ? '' : 'feed-item__dot--success';
  return `
    <div class="feed-item">
      <span class="feed-item__dot ${dotClass}"></span>
      <span class="feed-item__text">${a.text}</span>
      <span class="feed-item__time">${ui.formatTime(a.ts)}</span>
    </div>
  `;
}

export function recentAchCard(a, ui) {
  return `
    <div class="recent-ach">
      <div class="recent-ach__icon">${ui.icon(a.icon || 'star')}</div>
      <div class="recent-ach__body">
        <div class="recent-ach__title">${ui.escape(a.title)}</div>
        <div class="recent-ach__time">${ui.formatTime(a.unlockedAt)}</div>
      </div>
      <span class="chip chip--accent">+${a.xp}</span>
    </div>
  `;
}

export function emptyState(title, msg) {
  return `<div class="empty" style="grid-column:1/-1;"><div class="empty__title">${title}</div><div>${msg}</div></div>`;
}

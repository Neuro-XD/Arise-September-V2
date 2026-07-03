// ============================================================
// views/quests.js — Quests view with daily/weekly tabs
// ============================================================

import { store } from '../store.js';
import { quests } from '../quests.js';
import { ui } from '../ui.js';
import { questCard, bindQuestCards, openQuestModal, emptyState } from './dashboard.js';

let activeTab = 'daily';

export function renderQuests(root) {
  root.innerHTML = `
    <div class="view__header">
      <div>
        <h1 class="view__title">Quests</h1>
        <p class="view__subtitle">Complete quests to earn XP and ascend the ranks.</p>
      </div>
      <div class="view__actions">
        <button class="btn btn--primary" id="addQuest">${ui.icon('plus')} New Quest</button>
      </div>
    </div>
    <div class="tabs" id="questTabs">
      <button class="tab ${activeTab === 'daily' ? 'active' : ''}" data-tab="daily">Daily</button>
      <button class="tab ${activeTab === 'weekly' ? 'active' : ''}" data-tab="weekly">Weekly</button>
    </div>
    <div id="questList"></div>
  `;

  document.getElementById('addQuest').addEventListener('click', () => openQuestModal());
  document.querySelectorAll('#questTabs .tab').forEach((t) => {
    t.addEventListener('click', () => {
      activeTab = t.dataset.tab;
      document.querySelectorAll('#questTabs .tab').forEach((x) => x.classList.toggle('active', x.dataset.tab === activeTab));
      renderList();
    });
  });
  renderList();
}

function renderList() {
  const list = document.getElementById('questList');
  const items = activeTab === 'daily' ? quests.daily() : quests.weekly();
  const done = items.filter((q) => q.done).length;
  list.innerHTML = `
    <div class="section__header">
      <h2 class="section__title">${activeTab === 'daily' ? 'Daily Quests' : 'Weekly Quests'}</h2>
      <span class="section__count">${done}/${items.length} complete</span>
    </div>
    <div class="grid grid--auto stagger">
      ${items.length ? items.map(questCard).join('') : emptyState('No quests here', 'Create a new quest to get started.')}
    </div>
  `;
  bindQuestCards(list);
}

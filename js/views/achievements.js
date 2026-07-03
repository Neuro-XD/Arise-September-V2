// ============================================================
// views/achievements.js — Achievements grid
// ============================================================

import { achievements } from '../achievements.js';
import { ui } from '../ui.js';

export function renderAchievements(root) {
  const all = achievements.all();
  const unlocked = all.filter((a) => a.unlocked).length;
  const pct = all.length ? Math.round((unlocked / all.length) * 100) : 0;

  root.innerHTML = `
    <div class="view__header">
      <div>
        <h1 class="view__title">Achievements</h1>
        <p class="view__subtitle">${unlocked} of ${all.length} unlocked — ${pct}% complete</p>
      </div>
    </div>

    <div class="card" style="margin-bottom:var(--space-6);">
      <div class="card__header"><span class="card__title">${ui.icon('trophy')} Overall Progress</span><span class="chip chip--accent">${pct}%</span></div>
      <div class="progress progress--lg"><div class="progress__fill" style="width:${pct}%"></div></div>
    </div>

    <div class="grid grid--3 stagger" id="achGrid">
      ${all.map((a) => achCard(a)).join('')}
    </div>
  `;
}

function achCard(a) {
  const prog = achievements.progress(a);
  const tierColor = {
    E: 'var(--rank-e)', D: 'var(--rank-d)', C: 'var(--rank-c)',
    B: 'var(--rank-b)', A: 'var(--rank-a)', S: 'var(--rank-s)', SS: 'var(--rank-ss)',
  }[a.tier] || 'var(--accent)';

  return `
    <div class="ach ${a.unlocked ? 'ach--unlocked' : 'ach--locked'}">
      <div class="ach__icon" style="${a.unlocked ? `background:linear-gradient(135deg,${tierColor},var(--accent-2));color:#fff;box-shadow:0 0 20px ${tierColor};` : ''}">${ui.icon(a.icon || 'star')}</div>
      <div class="ach__title">${ui.escape(a.title)}</div>
      <div class="ach__desc">${ui.escape(a.desc)}</div>
      <div class="ach__reward">+${a.xp} XP</div>
      ${!a.unlocked && prog ? `
        <div style="width:100%;margin-top:var(--space-2);">
          <div class="quest__progress-label"><span>${prog.cur}/${prog.target}</span><span>${Math.min(100, (prog.cur / prog.target) * 100).toFixed(0)}%</span></div>
          <div class="progress"><div class="progress__fill" style="width:${Math.min(100, (prog.cur / prog.target) * 100)}%"></div></div>
        </div>
      ` : ''}
      ${a.unlocked ? `<div class="chip chip--success" style="margin-top:var(--space-2);">${ui.formatDate(a.unlockedAt)}</div>` : `<div class="chip" style="margin-top:var(--space-2);">Tier ${a.tier}</div>`}
    </div>
  `;
}

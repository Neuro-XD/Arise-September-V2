// ============================================================
// views/stats.js — Statistics view with charts
// ============================================================

import { stats } from '../stats.js';
import { xp, rankForLevel, nextRank } from '../xp.js';
import { store } from '../store.js';
import { ui } from '../ui.js';

export function renderStats(root) {
  const s = stats.summary();
  const weekXp = stats.last7DaysXp();
  const weekQuests = stats.last7DaysQuests();
  const max = Math.max(...weekXp.map((d) => d.xp), 1);
  const rank = rankForLevel(s.level);
  const next = nextRank(s.level);

  root.innerHTML = `
    <div class="view__header">
      <div>
        <h1 class="view__title">Statistics</h1>
        <p class="view__subtitle">Track your progression over time.</p>
      </div>
    </div>

    <div class="stat-grid stagger" style="margin-bottom:var(--space-6);">
      ${statCard('bolt', s.totalXp.toLocaleString(), 'Total XP')}
      ${statCard('star', `Level ${s.level}`, 'Current Level')}
      ${statCard('flame', `${s.streak}`, 'Day Streak')}
      ${statCard('trophy', `${s.achievementsUnlocked}/${s.achievementsTotal}`, 'Achievements')}
      ${statCard('target', `${s.questsDone}`, 'Quests Done')}
      ${statCard('trend', `${s.completionRate}%`, 'Completion Rate')}
    </div>

    <div class="grid grid--2" style="margin-bottom:var(--space-6);">
      <div class="card">
        <div class="card__header"><span class="card__title">${ui.icon('trend')} XP — Last 7 Days</span></div>
        <div class="chart" style="display:flex;align-items:flex-end;gap:8px;height:180px;padding-top:var(--space-4);">
          ${weekXp.map((d) => `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end;">
              <span style="font-size:0.7rem;color:var(--text-tertiary);font-family:var(--font-mono);">${d.xp || ''}</span>
              <div style="width:100%;max-width:36px;background:linear-gradient(180deg,var(--accent),var(--accent-2));border-radius:6px 6px 0 0;height:${(d.xp / max) * 100}%;min-height:4px;box-shadow:0 0 12px var(--accent-glow);transform-origin:bottom;animation:barGrow 600ms var(--ease-out) both;"></div>
              <span style="font-size:0.72rem;color:var(--text-tertiary);">${d.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card__header"><span class="card__title">${ui.icon('target')} Quests — Last 7 Days</span></div>
        <div class="chart" style="display:flex;align-items:flex-end;gap:8px;height:180px;padding-top:var(--space-4);">
          ${weekQuests.map((d) => {
            const mx = Math.max(...weekQuests.map((x) => x.count), 1);
            return `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end;">
              <span style="font-size:0.7rem;color:var(--text-tertiary);font-family:var(--font-mono);">${d.count || ''}</span>
              <div style="width:100%;max-width:36px;background:linear-gradient(180deg,var(--success),var(--accent-2));border-radius:6px 6px 0 0;height:${(d.count / mx) * 100}%;min-height:4px;box-shadow:0 0 12px var(--success-dim);transform-origin:bottom;animation:barGrow 600ms var(--ease-out) both;"></div>
              <span style="font-size:0.72rem;color:var(--text-tertiary);">${d.label}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:var(--space-6);">
      <div class="card__header"><span class="card__title">${ui.icon('star')} Rank Progression</span></div>
      <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-4);">
        <div style="width:56px;height:56px;border-radius:var(--radius-md);display:grid;place-items:center;font-family:var(--font-display);font-weight:900;font-size:1.4rem;color:#fff;background:${rank.color};box-shadow:0 0 20px ${rank.color};">${rank.tier}</div>
        <div>
          <div style="font-size:1.1rem;font-weight:700;">${rank.name}</div>
          <div style="color:var(--text-tertiary);font-size:0.85rem;">Level ${s.level} ${next ? `→ ${next.tier} at Level ${next.minLevel}` : '(Max Rank)'}</div>
        </div>
      </div>
      ${next ? `
        <div class="progress progress--lg"><div class="progress__fill" style="width:${((s.level - rank.minLevel) / (next.minLevel - rank.minLevel)) * 100}%"></div></div>
        <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:0.78rem;color:var(--text-tertiary);">
          <span>Lvl ${rank.minLevel}</span><span>Lvl ${next.minLevel}</span>
        </div>
      ` : '<div class="chip chip--accent">Maximum rank achieved</div>'}
    </div>

    <div class="card">
      <div class="card__header"><span class="card__title">${ui.icon('clock')} Activity Feed</span></div>
      <div class="feed">
        ${store.getState().activity.slice(0, 12).map((a) => `
          <div class="feed-item">
            <span class="feed-item__dot ${a.type === 'level' ? 'feed-item__dot--level' : a.type === 'ach' ? 'feed-item__dot--ach' : ''}"></span>
            <span class="feed-item__text">${a.text}</span>
            <span class="feed-item__time">${ui.formatTime(a.ts)}</span>
          </div>
        `).join('') || '<div class="empty"><div class="empty__title">No activity yet</div></div>'}
      </div>
    </div>
  `;
}

function statCard(iconName, value, label) {
  return `
    <div class="stat-card">
      <div class="stat-card__icon">${ui.icon(iconName)}</div>
      <div>
        <div class="stat-card__value">${value}</div>
        <div class="stat-card__label">${label}</div>
      </div>
    </div>
  `;
}

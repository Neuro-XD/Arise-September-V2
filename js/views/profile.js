// ============================================================
// views/profile.js — Profile view
// ============================================================

import { store } from '../store.js';
import { xp, rankForLevel, RANKS, nextRank } from '../xp.js';
import { stats } from '../stats.js';
import { achievements } from '../achievements.js';
import { settings } from '../settings.js';
import { ui } from '../ui.js';

export function renderProfile(root) {
  const state = store.getState();
  const rank = rankForLevel(state.xp.level);
  const prog = xp.progress();
  const s = stats.summary();
  const recentAch = achievements.recent(5);
  const next = nextRank(state.xp.level);

  root.innerHTML = `
    <div class="view__header">
      <div>
        <h1 class="view__title">Profile</h1>
        <p class="view__subtitle">Your hunter identity and progression.</p>
      </div>
      <div class="view__actions">
        <button class="btn btn--primary" id="editProfile">${ui.icon('edit')} Edit Profile</button>
      </div>
    </div>

    <div class="profile">
      <div class="profile__card">
        <div class="profile__avatar-wrap">
          <div class="profile__avatar">${ui.escape((state.profile.avatar || state.profile.username.charAt(0)).toUpperCase())}</div>
          <div class="profile__avatar-ring"></div>
          <div class="profile__rank-badge" style="background:${rank.color};box-shadow:0 0 16px ${rank.color};">${rank.tier}</div>
        </div>
        <div class="profile__name">${ui.escape(state.profile.username)}</div>
        <div class="profile__title">${ui.escape(state.profile.title)}</div>
        <div class="profile__rank-chip">${rank.tier} — ${rank.name}</div>
        <div class="profile__level">${state.xp.level}</div>
        <div class="profile__level-label">Level</div>
        <div class="profile__xp-block" style="margin-top:var(--space-4);">
          <div class="profile__xp-row"><span>XP Progress</span><span>${prog.into}/${prog.span}</span></div>
          <div class="progress progress--lg"><div class="progress__fill" style="width:${prog.pct}%"></div></div>
          <div class="profile__xp-row" style="margin-top:6px;"><span style="color:var(--text-tertiary);">Total XP</span><span style="color:var(--text-tertiary);">${prog.total.toLocaleString()}</span></div>
        </div>
      </div>

      <div class="profile__main">
        <div class="card">
          <div class="card__header"><span class="card__title">${ui.icon('trend')} Lifetime Statistics</span></div>
          <div class="stat-grid">
            ${profileStat('Total XP', s.totalXp.toLocaleString())}
            ${profileStat('Quests Done', s.questsDone)}
            ${profileStat('Best Streak', s.bestStreak)}
            ${profileStat('Achievements', s.achievementsUnlocked)}
            ${profileStat('Member Since', ui.formatDate(s.memberSince))}
            ${profileStat('Activities', s.activityCount)}
          </div>
        </div>

        <div class="card">
          <div class="card__header"><span class="card__title">${ui.icon('star')} Rank Ladder</span></div>
          <div class="rank-ladder">
            ${RANKS.map((r) => {
              const isCurrent = rank.tier === r.tier;
              const isLocked = state.xp.level < r.minLevel;
              const progress = isLocked ? Math.min(100, (state.xp.level / r.minLevel) * 100) : 100;
              return `
                <div class="rank-rung ${isCurrent ? 'rank-rung--current' : ''} ${isLocked ? 'rank-rung--locked' : ''}">
                  <div class="rank-rung__badge" style="background:${r.color};box-shadow:0 0 12px ${r.color};">${r.tier}</div>
                  <div>
                    <div class="rank-rung__name">${r.name}</div>
                    <div class="rank-rung__req">Level ${r.minLevel}+</div>
                  </div>
                  ${isLocked ? `<div class="rank-rung__bar"><div class="progress"><div class="progress__fill" style="width:${progress}%"></div></div></div>` : `<span class="chip chip--success">Unlocked</span>`}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card__header"><span class="card__title">${ui.icon('award')} Recent Achievements</span></div>
          <div class="profile__recent">
            ${recentAch.length ? recentAch.map((a) => `
              <div class="recent-ach">
                <div class="recent-ach__icon">${ui.icon(a.icon || 'star')}</div>
                <div class="recent-ach__body">
                  <div class="recent-ach__title">${ui.escape(a.title)}</div>
                  <div class="recent-ach__time">${ui.formatTime(a.unlockedAt)}</div>
                </div>
                <span class="chip chip--accent">+${a.xp}</span>
              </div>
            `).join('') : '<div class="empty"><div class="empty__title">No achievements yet</div><div>Complete quests to unlock them.</div></div>'}
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('editProfile').addEventListener('click', () => openProfileModal());
}

function profileStat(label, value) {
  return `<div class="stat"><span class="stat__value">${value}</span><span class="stat__label">${label}</span></div>`;
}

function openProfileModal() {
  const p = store.getState().profile;
  ui.openModal('Edit Profile', `
    <div class="field"><label class="field__label">Username</label><input class="input" id="pfName" value="${ui.escape(p.username)}" /></div>
    <div class="field"><label class="field__label">Title</label><input class="input" id="pfTitle" value="${ui.escape(p.title)}" placeholder="Your hunter title" /></div>
    <div class="field"><label class="field__label">Avatar Letter</label><input class="input" id="pfAvatar" maxlength="1" value="${ui.escape(p.avatar)}" /></div>
    <div class="modal__footer">
      <button class="btn btn--ghost" id="pfCancel">Cancel</button>
      <button class="btn btn--primary" id="pfSave">Save</button>
    </div>
  `);
  document.getElementById('pfCancel').onclick = () => ui.closeModal();
  document.getElementById('pfSave').onclick = () => {
    settings.updateProfile({
      username: document.getElementById('pfName').value.trim(),
      title: document.getElementById('pfTitle').value.trim(),
      avatar: document.getElementById('pfAvatar').value.trim(),
    });
    ui.closeModal();
    renderProfile(document.getElementById('view'));
  };
  setTimeout(() => document.getElementById('pfName').focus(), 50);
}

// ============================================================
// xp.js — XP, levels, ranks, level-up animation
// ============================================================

import { store } from './store.js';
import { notifications } from './notifications.js';
import { sounds } from './sounds.js';
import { achievements } from './achievements.js';

// XP needed to reach level L (cumulative): 100 * L * (L+1) / 2
export function xpForLevel(level) {
  return 100 * level * (level + 1) / 2;
}

export function levelFromTotal(total) {
  let level = 1;
  while (xpForLevel(level + 1) <= total) level++;
  return level;
}

export const RANKS = [
  { tier: 'E', name: 'Novice', minLevel: 1, color: 'var(--rank-e)' },
  { tier: 'D', name: 'Apprentice', minLevel: 5, color: 'var(--rank-d)' },
  { tier: 'C', name: 'Skilled', minLevel: 12, color: 'var(--rank-c)' },
  { tier: 'B', name: 'Elite', minLevel: 20, color: 'var(--rank-b)' },
  { tier: 'A', name: 'Expert', minLevel: 32, color: 'var(--rank-a)' },
  { tier: 'S', name: 'Master', minLevel: 45, color: 'var(--rank-s)' },
  { tier: 'SS', name: 'Sovereign', minLevel: 60, color: 'var(--rank-ss)' },
];

export function rankForLevel(level) {
  let r = RANKS[0];
  for (const rank of RANKS) if (level >= rank.minLevel) r = rank;
  return r;
}

export function nextRank(level) {
  return RANKS.find((r) => r.minLevel > level) || null;
}

export const xp = {
  init() {
    store.subscribe((state) => this.updateSidebar(state));
  },

  total() { return store.getState().xp.total; },
  level() { return store.getState().xp.level; },

  add(amount, reason = 'Quest completed') {
    const state = store.getState();
    const newTotal = state.xp.total + amount;
    const newLevel = levelFromTotal(newTotal);
    const leveledUp = newLevel > state.xp.level;
    const oldRank = rankForLevel(state.xp.level);
    const newRank = rankForLevel(newLevel);
    const rankedUp = newRank.tier !== oldRank.tier;

    store.update('xp', { total: newTotal, level: newLevel });
    store.addActivity('xp', `Gained <strong>${amount} XP</strong> — ${reason}`);

    if (leveledUp) {
      this.playLevelUp(newLevel, newRank);
      sounds.play('levelup');
      notifications.success('Level Up!', `You reached Level ${newLevel}. ${rankedUp ? `Rank ${newRank.tier} unlocked!` : ''}`);
      store.addActivity('level', `Reached <strong>Level ${newLevel}</strong>`);
    }
    if (rankedUp && !leveledUp) {
      notifications.success('Rank Up!', `You ascended to Rank ${newRank.tier} — ${newRank.name}`);
      sounds.play('achievement');
    }
    achievements.check();
    this.updateStreak();
  },

  updateStreak() {
    const state = store.getState();
    const today = new Date().toDateString();
    if (state.streak.lastActive === today) return;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const current = state.streak.lastActive === yesterday ? state.streak.current + 1 : 1;
    store.update('streak', {
      current,
      best: Math.max(state.streak.best, current),
      lastActive: today,
    });
  },

  playLevelUp(level, rank) {
    const overlay = document.getElementById('levelUp');
    document.getElementById('levelUpLevel').textContent = level;
    document.getElementById('levelUpRank').textContent = `${rank.tier} — ${rank.name}`;
    overlay.classList.remove('leaving');
    overlay.hidden = false;
    overlay.style.display = 'grid';
    this.confettiBurst();
    clearTimeout(this._levelUpTimer);
    this._levelUpTimer = setTimeout(
    () => this.dismissLevelUp(),
    2500
);

  dismissLevelUp() {
    const overlay = document.getElementById('levelUp');
    if (!overlay || overlay.hidden) return;
    clearTimeout(this._levelUpTimer);
    overlay.classList.add('leaving');
    setTimeout(() => {
      overlay.hidden = true;
      overlay.style.display = 'none';
      overlay.classList.remove('leaving');
    }, 500);
  },

  confettiBurst() {
    const colors = ['#7c5cff', '#3da9ff', '#2ee6a6', '#ffb547', '#ff5470', '#c47cff'];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
      c.style.animationDelay = Math.random() * 0.3 + 's';
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      if (Math.random() > 0.5) c.style.borderRadius = '50%';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3500);
    }
  },

  updateSidebar(state) {
    const badge = document.getElementById('sidebarRankBadge');
    const name = document.getElementById('sidebarRankName');
    const rank = rankForLevel(state.xp.level);
    if (badge) { badge.textContent = rank.tier; badge.style.background = rank.color; }
    if (name) name.textContent = rank.name;
    const streak = document.getElementById('topbarStreakValue');
    if (streak) streak.textContent = state.streak.current;
    const avatar = document.getElementById('topbarAvatarText');
    if (avatar) avatar.textContent = (state.profile.avatar || state.profile.username.charAt(0)).toUpperCase();
  },

  progress() {
    const state = store.getState();
    const level = state.xp.level;
    const cur = xpForLevel(level);
    const next = xpForLevel(level + 1);
    const into = state.xp.total - cur;
    const span = next - cur;
    return { into, span, pct: span > 0 ? (into / span) * 100 : 100, next, total: state.xp.total };
  },
};

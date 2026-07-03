// ============================================================
// achievements.js — Achievement definitions, unlock checks, confetti
// ============================================================

import { store, cryptoId } from './store.js';
import { xp } from './xp.js';
import { notifications } from './notifications.js';
import { sounds } from './sounds.js';
import { ui } from './ui.js';

const DEFS = [
  { id: 'first_quest', title: 'First Steps', desc: 'Complete your first quest', xp: 50, tier: 'E', icon: 'star', check: (s) => s.quests.some((q) => q.done) },
  { id: 'streak_3', title: 'Warming Up', desc: 'Maintain a 3-day streak', xp: 100, tier: 'E', icon: 'flame', check: (s) => s.streak.current >= 3 },
  { id: 'streak_7', title: 'Consistent', desc: 'Maintain a 7-day streak', xp: 200, tier: 'D', icon: 'flame', check: (s) => s.streak.current >= 7 },
  { id: 'streak_30', title: 'Unbreakable', desc: 'Maintain a 30-day streak', xp: 500, tier: 'B', icon: 'flame', check: (s) => s.streak.current >= 30 },
  { id: 'level_5', title: 'Apprentice', desc: 'Reach Level 5', xp: 150, tier: 'D', icon: 'bolt', check: (s) => s.xp.level >= 5 },
  { id: 'level_10', title: 'Rising Hunter', desc: 'Reach Level 10', xp: 250, tier: 'C', icon: 'bolt', check: (s) => s.xp.level >= 10 },
  { id: 'level_20', title: 'Elite Hunter', desc: 'Reach Level 20', xp: 500, tier: 'B', icon: 'bolt', check: (s) => s.xp.level >= 20 },
  { id: 'level_45', title: 'S-Rank', desc: 'Reach Level 45', xp: 1500, tier: 'S', icon: 'trophy', check: (s) => s.xp.level >= 45 },
  { id: 'quests_10', title: 'Taskmaster', desc: 'Complete 10 quests', xp: 120, tier: 'D', icon: 'target', check: (s) => s.quests.filter((q) => q.done).length >= 10 },
  { id: 'quests_50', title: 'Quest Conqueror', desc: 'Complete 50 quests', xp: 350, tier: 'B', icon: 'target', check: (s) => s.quests.filter((q) => q.done).length >= 50 },
  { id: 'quests_100', title: 'Centurion', desc: 'Complete 100 quests', xp: 800, tier: 'A', icon: 'target', check: (s) => s.quests.filter((q) => q.done).length >= 100 },
  { id: 'daily_sweep', title: 'Daily Sweep', desc: 'Complete all daily quests in one day', xp: 180, tier: 'C', icon: 'check', check: (s) => { const d = s.quests.filter((q) => q.type === 'daily'); return d.length > 0 && d.every((q) => q.done); } },
  { id: 'weekly_sweep', title: 'Weekly Champion', desc: 'Complete all weekly quests', xp: 400, tier: 'B', icon: 'trophy', check: (s) => { const w = s.quests.filter((q) => q.type === 'weekly'); return w.length > 0 && w.every((q) => q.done); } },
  { id: 'xp_1000', title: 'Quadruple Digits', desc: 'Earn 1,000 total XP', xp: 100, tier: 'C', icon: 'bolt', check: (s) => s.xp.total >= 1000 },
  { id: 'xp_10000', title: 'Five Digits', desc: 'Earn 10,000 total XP', xp: 500, tier: 'A', icon: 'bolt', check: (s) => s.xp.total >= 10000 },
  { id: 'night_owl', title: 'Night Owl', desc: 'Complete a quest after 10 PM', xp: 60, tier: 'E', icon: 'clock', check: (s) => s.activity.some((a) => new Date(a.ts).getHours() >= 22) },
  { id: 'early_bird', title: 'Early Bird', desc: 'Complete a quest before 7 AM', xp: 60, tier: 'E', icon: 'clock', check: (s) => s.activity.some((a) => new Date(a.ts).getHours() < 7) },
];

export const achievements = {
  init() {},

  seedDefaults() {
    const list = DEFS.map((d) => ({
      id: d.id,
      title: d.title,
      desc: d.desc,
      xp: d.xp,
      tier: d.tier,
      icon: d.icon,
      unlocked: false,
      unlockedAt: null,
    }));
    store.update('achievements', list);
  },

  all() { return store.getState().achievements; },

  check() {
    const state = store.getState();
    const updated = state.achievements.map((a) => {
      if (a.unlocked) return a;
      const def = DEFS.find((d) => d.id === a.id);
      if (def && def.check(state)) {
        this.onUnlock(a);
        return { ...a, unlocked: true, unlockedAt: Date.now() };
      }
      return a;
    });
    const newlyUnlocked = updated.some((a, i) => a.unlocked && !state.achievements[i].unlocked);
    if (newlyUnlocked) {
      store.update('achievements', updated);
    }
  },

  onUnlock(ach) {
    notifications.success('Achievement Unlocked!', `${ach.title} (+${ach.xp} XP)`);
    sounds.play('achievement');
    xp.confettiBurst();
    store.addActivity('ach', `Unlocked achievement <strong>${ach.title}</strong>`);
    // award XP without re-triggering achievement check loop excessively
    const state = store.getState();
    store.update('xp', { total: state.xp.total + ach.xp, level: xp.levelFromTotal(state.xp.total + ach.xp) });
  },

  recent(limit = 5) {
    return this.all().filter((a) => a.unlocked).sort((a, b) => b.unlockedAt - a.unlockedAt).slice(0, limit);
  },

  progress(ach) {
    // best-effort textual progress for some achievements
    const state = store.getState();
    switch (ach.id) {
      case 'streak_3': return { cur: state.streak.current, target: 3 };
      case 'streak_7': return { cur: state.streak.current, target: 7 };
      case 'streak_30': return { cur: state.streak.current, target: 30 };
      case 'level_5': return { cur: state.xp.level, target: 5 };
      case 'level_10': return { cur: state.xp.level, target: 10 };
      case 'level_20': return { cur: state.xp.level, target: 20 };
      case 'level_45': return { cur: state.xp.level, target: 45 };
      case 'quests_10': return { cur: state.quests.filter((q) => q.done).length, target: 10 };
      case 'quests_50': return { cur: state.quests.filter((q) => q.done).length, target: 50 };
      case 'quests_100': return { cur: state.quests.filter((q) => q.done).length, target: 100 };
      case 'xp_1000': return { cur: state.xp.total, target: 1000 };
      case 'xp_10000': return { cur: state.xp.total, target: 10000 };
      default: return null;
    }
  },
};

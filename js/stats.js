// ============================================================
// stats.js — Aggregate statistics computation
// ============================================================

import { store } from './store.js';
import { quests } from './quests.js';
import { xp } from './xp.js';

export const stats = {
  init() {},

  summary() {
    const state = store.getState();
    const allQuests = state.quests;
    const done = allQuests.filter((q) => q.done).length;
    const daily = allQuests.filter((q) => q.type === 'daily');
    const dailyDone = daily.filter((q) => q.done).length;
    const weekly = allQuests.filter((q) => q.type === 'weekly');
    const weeklyDone = weekly.filter((q) => q.done).length;
    const achUnlocked = state.achievements.filter((a) => a.unlocked).length;
    const totalAch = state.achievements.length;

    return {
      totalXp: state.xp.total,
      level: state.xp.level,
      rank: xp.rankForLevel(state.xp.level),
      streak: state.streak.current,
      bestStreak: state.streak.best,
      questsDone: done,
      questsTotal: allQuests.length,
      dailyDone,
      dailyTotal: daily.length,
      weeklyDone,
      weeklyTotal: weekly.length,
      completionRate: allQuests.length ? Math.round((done / allQuests.length) * 100) : 0,
      achievementsUnlocked: achUnlocked,
      achievementsTotal: totalAch,
      memberSince: state.profile.createdAt,
      activityCount: state.activity.length,
    };
  },

  last7DaysXp() {
    const state = store.getState();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const start = d.getTime();
      const end = start + 86400000;
      const xpGain = state.activity
        .filter((a) => a.type === 'xp' && a.ts >= start && a.ts < end)
        .reduce((sum, a) => {
          const m = a.text.match(/(\d+)\s*XP/);
          return sum + (m ? parseInt(m[1], 10) : 0);
        }, 0);
      days.push({
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        xp: xpGain,
        date: d,
      });
    }
    return days;
  },

  last7DaysQuests() {
    const state = store.getState();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const start = d.getTime();
      const end = start + 86400000;
      const count = state.activity.filter((a) => a.type === 'xp' && a.ts >= start && a.ts < end).length;
      days.push({ label: d.toLocaleDateString(undefined, { weekday: 'short' }), count });
    }
    return days;
  },

  rankDistribution() {
    const state = store.getState();
    const dist = {};
    state.achievements.forEach((a) => {
      dist[a.tier] = (dist[a.tier] || 0) + 1;
    });
    return dist;
  },
};

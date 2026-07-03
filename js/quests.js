// ============================================================
// quests.js — Daily/weekly quests, auto-reset, progress tracking
// ============================================================

import { store, cryptoId } from './store.js';
import { xp } from './xp.js';
import { notifications } from './notifications.js';
import { sounds } from './sounds.js';
import { ui } from './ui.js';
import { achievements } from './achievements.js';

const DAILY_QUESTS = [
  { title: 'Morning Workout', desc: '30 minutes of physical training', xp: 50, target: 1 },
  { title: 'Read 20 Pages', desc: 'Expand your knowledge', xp: 40, target: 1 },
  { title: 'Drink 2L Water', desc: 'Stay hydrated, hunter', xp: 30, target: 1 },
  { title: 'Deep Work Session', desc: '90 minutes of focused work', xp: 60, target: 1 },
  { title: 'Meditate 10 Minutes', desc: 'Calm the mind, sharpen focus', xp: 35, target: 1 },
];

const WEEKLY_QUESTS = [
  { title: 'Complete 5 Workouts', desc: 'Train your body this week', xp: 200, target: 5 },
  { title: 'Read 100 Pages', desc: 'Finish a book this week', xp: 180, target: 5 },
  { title: 'Ship a Project Milestone', desc: 'Make tangible progress', xp: 250, target: 1 },
];

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function startOfWeek(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.getTime();
}

export const quests = {
  init() {
    this.checkReset();
    store.subscribe(() => this.checkReset());
  },

  checkReset() {
    const state = store.getState();
    const today = startOfDay(Date.now());
    const week = startOfWeek(Date.now());
    let changed = false;
    let quests = state.quests.map((q) => {
      if (q.type === 'daily' && q.resetDay !== today) {
        changed = true;
        return { ...q, done: false, progress: 0, resetDay: today };
      }
      if (q.type === 'weekly' && q.resetDay !== week) {
        changed = true;
        return { ...q, done: false, progress: 0, resetDay: week };
      }
      return q;
    });
    if (changed) {
      store.setState({ ...state, quests, lastReset: Date.now() });
    }
  },

  seedDefaults() {
    const today = startOfDay(Date.now());
    const week = startOfWeek(Date.now());
    const daily = DAILY_QUESTS.map((q) => ({
      id: cryptoId(), type: 'daily', ...q, done: false, progress: 0, resetDay: today, createdAt: Date.now(),
    }));
    const weekly = WEEKLY_QUESTS.map((q) => ({
      id: cryptoId(), type: 'weekly', ...q, done: false, progress: 0, resetDay: week, createdAt: Date.now(),
    }));
    store.update('quests', [...daily, ...weekly]);
  },

  all() { return store.getState().quests; },
  daily() { return this.all().filter((q) => q.type === 'daily'); },
  weekly() { return this.all().filter((q) => q.type === 'weekly'); },

  add({ title, desc, xp: xpVal, type, target }) {
    const q = {
      id: cryptoId(),
      title,
      desc: desc || '',
      xp: Math.max(1, xpVal | 0),
      type: type || 'daily',
      target: Math.max(1, target | 0),
      done: false,
      progress: 0,
      resetDay: type === 'weekly' ? startOfWeek(Date.now()) : startOfDay(Date.now()),
      createdAt: Date.now(),
    };
    store.update('quests', [q, ...store.getState().quests]);
    notifications.success('Quest Added', `${title} — ${q.xp} XP reward`);
    sounds.play('quest');
  },

  toggle(id) {
    const q = store.getState().quests.find((x) => x.id === id);
    if (!q) return;
    if (q.done) {
      store.update('quests', (qs) => qs.map((x) => x.id === id ? { ...x, done: false, progress: 0 } : x));
      notifications.info('Quest Reopened', q.title);
      return;
    }
    const newProgress = q.progress + 1;
    const done = newProgress >= q.target;
    store.update('quests', (qs) => qs.map((x) => x.id === id ? { ...x, progress: newProgress, done } : x));
    if (done) {
      xp.add(q.xp, `Quest: ${q.title}`);
      sounds.play('success');
      notifications.success('Quest Complete', `${q.title} (+${q.xp} XP)`);
      achievements.check();
    } else {
      sounds.play('click');
      notifications.info('Progress', `${q.title} — ${newProgress}/${q.target}`);
    }
  },

  increment(id) { this.toggle(id); },

  remove(id) {
    store.update('quests', (qs) => qs.filter((x) => x.id !== id));
    notifications.info('Quest Removed', '');
  },

  edit(id, patch) {
    store.update('quests', (qs) => qs.map((x) => x.id === id ? { ...x, ...patch } : x));
  },

  completionRate() {
    const all = this.all();
    if (!all.length) return 0;
    return Math.round((all.filter((q) => q.done).length / all.length) * 100);
  },
};

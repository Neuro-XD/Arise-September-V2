// ============================================================
// calendar.js — Monthly calendar, task dots, events, countdowns
// ============================================================

import { store, cryptoId } from './store.js';
import { ui } from './ui.js';

let viewDate = new Date();
let selectedDate = new Date();

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const calendar = {
  init() {},

  events() { return store.getState().events; },

  addEvent({ title, date, time, color }) {
    const ev = { id: cryptoId(), title, date: dateKey(new Date(date)), time: time || '09:00', color: color || 'accent', createdAt: Date.now() };
    store.update('events', [...store.getState().events, ev]);
  },

  removeEvent(id) {
    store.update('events', (evs) => evs.filter((e) => e.id !== id));
  },

  eventsForDay(d) {
    const key = dateKey(d);
    return store.getState().events.filter((e) => e.date === key);
  },

  questsForDay(d) {
    // daily quests reset each day; show today's quests on today's cell
    if (!sameDay(d, new Date())) return [];
    return store.getState().quests.filter((q) => q.type === 'daily');
  },

  monthLabel() {
    return viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  },

  prev() { viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1); },
  next() { viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1); },
  today() { viewDate = new Date(); selectedDate = new Date(); },

  grid() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = startDay - 1; i >= 0; i--) {
      cells.push({ date: new Date(year, month - 1, prevDays - i), other: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d), other: false });
    }
    const trailing = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= trailing; d++) {
      cells.push({ date: new Date(year, month + 1, d), other: true });
    }
    return cells;
  },

  selected() { return selectedDate; },
  select(d) { selectedDate = new Date(d); },

  countdowns() {
    const now = Date.now();
    return store.getState().events
      .map((e) => {
        const ts = new Date(`${e.date}T${e.time}:00`).getTime();
        return { ...e, ts, diff: ts - now };
      })
      .filter((e) => e.diff > 0)
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 5);
  },

  formatCountdown(diff) {
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  },
};

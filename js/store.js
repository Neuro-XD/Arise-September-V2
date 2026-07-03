// ============================================================
// store.js — Central reactive state with localStorage persistence
// ============================================================

const STORAGE_KEY = 'arise_state_v2';

const defaultState = {
  profile: {
    username: 'Hunter',
    title: 'The One Who Arises',
    avatar: 'S',
    createdAt: Date.now(),
  },
  xp: {
    total: 0,
    level: 1,
  },
  streak: {
    current: 0,
    best: 0,
    lastActive: null,
  },
  quests: [],
  achievements: [],
  activity: [],
  events: [],
  settings: {
    theme: 'dark',
    sound: true,
    particles: true,
    sidebarCollapsed: false,
    reduceMotion: false,
  },
  lastReset: null,
};

const listeners = new Set();
let state = structuredClone(defaultState);

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Persist failed', e);
  }
}

function migrate(loaded) {
  // shallow-merge defaults so new keys appear in older saves
  return {
    ...structuredClone(defaultState),
    ...loaded,
    profile: { ...defaultState.profile, ...(loaded.profile || {}) },
    xp: { ...defaultState.xp, ...(loaded.xp || {}) },
    streak: { ...defaultState.streak, ...(loaded.streak || {}) },
    settings: { ...defaultState.settings, ...(loaded.settings || {}) },
    quests: loaded.quests || [],
    achievements: loaded.achievements || [],
    activity: loaded.activity || [],
    events: loaded.events || [],
  };
}

export const store = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = migrate(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('Load failed, using defaults', e);
      state = structuredClone(defaultState);
    }
    this.notify();
  },

  getState() {
    return state;
  },

  setState(next) {
    state = typeof next === 'function' ? next(state) : { ...state, ...next };
    persist();
    this.notify();
  },

  update(key, patch) {
    const current = state[key];
    const updated = typeof patch === 'function' ? patch(current) : { ...current, ...patch };
    state = { ...state, [key]: updated };
    persist();
    this.notify();
  },

  reset() {
    state = structuredClone(defaultState);
    persist();
    this.notify();
  },

  exportData() {
    return JSON.stringify(state, null, 2);
  },

  importData(json) {
    const parsed = JSON.parse(json);
    state = migrate(parsed);
    persist();
    this.notify();
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  notify() {
    listeners.forEach((fn) => fn(state));
  },

  addActivity(type, text) {
    const entry = { id: cryptoId(), type, text, ts: Date.now() };
    state.activity = [entry, ...state.activity].slice(0, 100);
    persist();
  },
};

export function cryptoId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

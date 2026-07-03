// ============================================================
// views/calendar.js — Calendar view
// ============================================================

import { calendar } from '../calendar.js';
import { store } from '../store.js';
import { ui } from '../ui.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function renderCalendar(root) {
  root.innerHTML = `
    <div class="view__header">
      <div>
        <h1 class="view__title">Calendar</h1>
        <p class="view__subtitle">Track your tasks and events over time.</p>
      </div>
      <div class="view__actions">
        <button class="btn btn--primary" id="addEvent">${ui.icon('plus')} Add Event</button>
      </div>
    </div>
    <div class="calendar">
      <div class="calendar__main">
        <div class="calendar__header">
          <div class="calendar__month" id="calMonth"></div>
          <div class="calendar__nav">
            <button class="calendar__nav-btn" id="calPrev" aria-label="Previous month">${chevronLeft()}</button>
            <button class="calendar__nav-btn" id="calToday">Today</button>
            <button class="calendar__nav-btn" id="calNext" aria-label="Next month">${chevronRight()}</button>
          </div>
        </div>
        <div class="calendar__grid" id="calGrid"></div>
      </div>
      <div class="calendar__side">
        <div class="card">
          <div class="card__header"><span class="card__title">${ui.icon('calendar')} ${selectedLabel()}</span></div>
          <div class="calendar__events" id="calEvents"></div>
        </div>
        <div class="card">
          <div class="card__header"><span class="card__title">${ui.icon('clock')} Upcoming Countdowns</span></div>
          <div class="countdown" id="calCountdowns"></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('addEvent').addEventListener('click', () => openEventModal());
  document.getElementById('calPrev').addEventListener('click', () => { calendar.prev(); renderCalendar(root); });
  document.getElementById('calNext').addEventListener('click', () => { calendar.next(); renderCalendar(root); });
  document.getElementById('calToday').addEventListener('click', () => { calendar.today(); renderCalendar(root); });

  renderGrid();
  renderEvents();
  renderCountdowns();
}

function renderGrid() {
  document.getElementById('calMonth').innerHTML = `${calendar.monthLabel()}`;
  const grid = document.getElementById('calGrid');
  const cells = calendar.grid();
  const today = new Date();
  const selected = calendar.selected();
  grid.innerHTML = WEEKDAYS.map((d) => `<div class="calendar__weekday">${d}</div>`).join('') +
    cells.map((c) => {
      const dayQuests = calendar.questsForDay(c.date);
      const dayEvents = calendar.eventsForDay(c.date);
      const dotCount = dayQuests.length + dayEvents.length;
      const allDone = dayQuests.length > 0 && dayQuests.every((q) => q.done);
      const isToday = sameDay(c.date, today);
      const isSelected = sameDay(c.date, selected);
      const classes = ['calendar__day'];
      if (c.other) classes.push('calendar__day--other');
      if (isToday) classes.push('calendar__day--today');
      if (isSelected) classes.push('calendar__day--selected');
      if (allDone) classes.push('calendar__day--done');
      return `
        <div class="${classes.join(' ')}" data-date="${c.date.toISOString()}">
          <span>${c.date.getDate()}</span>
          ${dotCount ? `<div class="calendar__dots">${Array.from({ length: Math.min(4, dotCount) }, () => '<span></span>').join('')}</div>` : ''}
        </div>
      `;
    }).join('');

  grid.querySelectorAll('.calendar__day').forEach((el) => {
    el.addEventListener('click', () => {
      calendar.select(new Date(el.dataset.date));
      renderCalendar(document.getElementById('view'));
    });
  });
}

function renderEvents() {
  const sel = calendar.selected();
  const events = calendar.eventsForDay(sel);
  const quests = calendar.questsForDay(sel);
  const container = document.getElementById('calEvents');
  const items = [
    ...quests.map((q) => ({ type: 'quest', title: q.title, time: 'Daily', done: q.done, xp: q.xp, id: q.id })),
    ...events.map((e) => ({ type: 'event', title: e.title, time: e.time, done: false, id: e.id })),
  ];
  container.innerHTML = items.length ? items.map((it) => `
    <div class="cal-event ${it.done ? 'cal-event--done' : ''}" data-id="${it.id}" data-type="${it.type}">
      <span class="cal-event__time">${it.time}</span>
      <div class="cal-event__body">
        <div class="cal-event__title">${ui.escape(it.title)}</div>
        ${it.type === 'quest' ? `<div class="cal-event__meta">${it.xp} XP</div>` : `<div class="cal-event__meta">Event</div>`}
      </div>
      ${it.type === 'event' ? `<button class="quest__action quest__action--delete" data-del="${it.id}" aria-label="Remove">${ui.icon('trash')}</button>` : ''}
    </div>
  `).join('') : '<div class="empty"><div class="empty__title">Nothing scheduled</div><div>No tasks or events for this day.</div></div>';

  container.querySelectorAll('[data-del]').forEach((b) => {
    b.addEventListener('click', (e) => { e.stopPropagation(); calendar.removeEvent(b.dataset.del); renderCalendar(document.getElementById('view')); });
  });
}

function renderCountdowns() {
  const cds = calendar.countdowns();
  const el = document.getElementById('calCountdowns');
  el.innerHTML = cds.length ? cds.map((c) => `
    <div class="countdown__item">
      <span class="countdown__label">${ui.escape(c.title)}</span>
      <span class="countdown__time">${calendar.formatCountdown(c.diff)}</span>
    </div>
  `).join('') : '<div class="empty"><div class="empty__title">No upcoming events</div></div>';
}

function selectedLabel() {
  return calendar.selected().toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

function openEventModal() {
  const sel = calendar.selected();
  const dateStr = sel.toISOString().slice(0, 10);
  ui.openModal('Add Event', `
    <div class="field"><label class="field__label">Title</label><input class="input" id="evTitle" placeholder="e.g. Team Sync" /></div>
    <div class="grid grid--2">
      <div class="field"><label class="field__label">Date</label><input class="input" id="evDate" type="date" value="${dateStr}" /></div>
      <div class="field"><label class="field__label">Time</label><input class="input" id="evTime" type="time" value="09:00" /></div>
    </div>
    <div class="modal__footer">
      <button class="btn btn--ghost" id="evCancel">Cancel</button>
      <button class="btn btn--primary" id="evSave">Add Event</button>
    </div>
  `);
  document.getElementById('evCancel').onclick = () => ui.closeModal();
  document.getElementById('evSave').onclick = () => {
    const title = document.getElementById('evTitle').value.trim();
    if (!title) return;
    calendar.addEvent({ title, date: document.getElementById('evDate').value, time: document.getElementById('evTime').value });
    ui.closeModal();
    renderCalendar(document.getElementById('view'));
  };
  setTimeout(() => document.getElementById('evTitle').focus(), 50);
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function chevronLeft() { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>'; }
function chevronRight() { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'; }

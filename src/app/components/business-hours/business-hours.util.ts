import { BusinessHours as Hours } from '../../config/company.config';

const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const WEEKDAY: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** "18:00" → "6 pm", "10:30" → "10:30 am" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const h12 = h % 12 || 12;
  return `${h12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'am' : 'pm'}`;
}

export function formatHours(h: Hours): string {
  return h.opens && h.closes ? `${formatTime(h.opens)} – ${formatTime(h.closes)}` : 'Closed';
}

/** Weekday (1–7) and minutes since midnight in the shop's time zone. */
function localNow(now: number, timeZone: string): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(now));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { day: WEEKDAY[get('weekday')] ?? 1, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

export interface OpenStatus {
  open: boolean;
  text: string;
  today: number;
}

export function openStatus(hours: Hours[], now: number, timeZone: string): OpenStatus {
  const { day, minutes } = localNow(now, timeZone);
  const forDay = (d: number) => hours.find((h) => h.days.includes(d));
  const today = forDay(day);

  if (today?.opens && today.closes) {
    const o = toMinutes(today.opens);
    const c = toMinutes(today.closes);
    if (minutes >= o && minutes < c) return { open: true, text: `Open now · closes ${formatTime(today.closes)}`, today: day };
    if (minutes < o) return { open: false, text: `Closed now · opens today at ${formatTime(today.opens)}`, today: day };
  }
  for (let i = 1; i <= 7; i++) {
    const d = ((day - 1 + i) % 7) + 1;
    const h = forDay(d);
    if (h?.opens) {
      const when = i === 1 ? 'tomorrow' : DAY_NAMES[d];
      return { open: false, text: `Closed now · opens ${when} at ${formatTime(h.opens)}`, today: day };
    }
  }
  return { open: false, text: 'Closed now', today: day };
}


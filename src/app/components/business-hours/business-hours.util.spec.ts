import { COMPANY } from '../../config/company.config';
import { formatTime, openStatus } from './business-hours.util';

const at = (iso: string) => openStatus(COMPANY.hours, Date.parse(iso), COMPANY.timeZone);

describe('business hours', () => {
  it('formats 24h times for display', () => {
    expect(formatTime('10:00')).toBe('10 am');
    expect(formatTime('18:00')).toBe('6 pm');
    expect(formatTime('12:30')).toBe('12:30 pm');
  });

  it('is open Mon–Fri 10 am – 6 pm (Kolkata time)', () => {
    expect(at('2026-10-01T09:59:00+05:30').open).toBeFalse(); // Thursday
    expect(at('2026-10-01T10:00:00+05:30').text).toBe('Open now · closes 6 pm');
    expect(at('2026-10-01T18:00:00+05:30').text).toBe('Closed now · opens tomorrow at 10 am');
  });

  it('closes at 5 pm on Saturday and stays closed on Sunday', () => {
    expect(at('2026-10-03T16:59:00+05:30').text).toBe('Open now · closes 5 pm');
    expect(at('2026-10-03T17:00:00+05:30').text).toBe('Closed now · opens Monday at 10 am');
    expect(at('2026-10-04T12:00:00+05:30').text).toBe('Closed now · opens tomorrow at 10 am');
  });

  it('uses Kolkata time regardless of the visitor time zone', () => {
    // 04:30 UTC = 10:00 IST on a Thursday
    expect(at('2026-10-01T04:30:00Z').open).toBeTrue();
  });
});

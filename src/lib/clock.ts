/**
 * A clock that code asks for "now", instead of calling `new Date()` directly.
 * Tests pass a FakeClock so time-based behaviour (retries, deadlines) can be
 * checked instantly and exactly. In production the database clock
 * (`now()` in PostgreSQL) becomes the source of truth for scheduling (P1/P4).
 */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = {
  now: () => new Date(),
};

/** Manually controlled clock for tests. */
export class FakeClock implements Clock {
  private current: number;

  constructor(start: Date | string = "2026-01-01T12:00:00.000Z") {
    this.current = new Date(start).getTime();
  }

  now(): Date {
    return new Date(this.current);
  }

  advanceBy(ms: number): void {
    this.current += ms;
  }

  set(time: Date | string): void {
    this.current = new Date(time).getTime();
  }
}

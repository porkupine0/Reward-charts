// Test helper: pretend today is SHIFT_DAYS days later (checks that no test depends on the real date).
// Usage: SHIFT_DAYS=120 NODE_OPTIONS="--require ./tests/shift-date.cjs" node --test tests/*.test.mjs
const off = (Number(process.env.SHIFT_DAYS) || 0) * 864e5;
const RealDate = Date;
class ShiftedDate extends RealDate {
  constructor(...a) { if (a.length) super(...a); else super(RealDate.now() + off); }
  static now() { return RealDate.now() + off; }
}
globalThis.Date = ShiftedDate;

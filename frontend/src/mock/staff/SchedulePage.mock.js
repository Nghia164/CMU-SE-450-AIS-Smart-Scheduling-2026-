// ============================================================
// MOCK: Lịch làm của tôi (Staff) — chỉ ca từ lịch PUBLISHED
// Bám schema: schedules (status PUBLISHED), schedule_assignments
// Tuần hiện tại 12–18/10/2026 (T2→CN), tuần sau 19–25/10/2026
// ============================================================

// Ca mẫu: Sáng 07:00–12:00, Chiều 12:00–17:00, Tối 17:00–22:00
const SHIFTS = {
  sang: { shiftName: 'Ca sáng', startTime: '07:00', endTime: '12:00' },
  chieu: { shiftName: 'Ca chiều', startTime: '12:00', endTime: '17:00' },
  toi: { shiftName: 'Ca tối', startTime: '17:00', endTime: '22:00' },
};

const DAYS = [
  { date: '2026-10-12', dayLabel: 'Thứ 2' },
  { date: '2026-10-13', dayLabel: 'Thứ 3' },
  { date: '2026-10-14', dayLabel: 'Thứ 4' },
  { date: '2026-10-15', dayLabel: 'Thứ 5' },
  { date: '2026-10-16', dayLabel: 'Thứ 6' },
  { date: '2026-10-17', dayLabel: 'Thứ 7' },
  { date: '2026-10-18', dayLabel: 'Chủ nhật' },
  { date: '2026-10-19', dayLabel: 'Thứ 2' },
  { date: '2026-10-20', dayLabel: 'Thứ 3' },
  { date: '2026-10-21', dayLabel: 'Thứ 4' },
  { date: '2026-10-22', dayLabel: 'Thứ 5' },
  { date: '2026-10-23', dayLabel: 'Thứ 6' },
  { date: '2026-10-24', dayLabel: 'Thứ 7' },
  { date: '2026-10-25', dayLabel: 'Chủ nhật' },
];

// position gắn với shift_requirement
let autoId = 100;
function shift(dayIdx, key, position, status, store = 'STORE-01 · Quận 1') {
  const d = DAYS[dayIdx];
  autoId += 1;
  return {
    id: autoId,
    date: d.date,
    dayLabel: d.dayLabel,
    ...SHIFTS[key],
    position,
    status, // ASSIGNED | CONFIRMED
    store,
  };
}

// Tuần này: 5 ca (3 CONFIRMED, 2 ASSIGNED) — 1 ngày nghỉ
// Tuần sau: 4 ca (toàn ASSIGNED) — có 1 ngày 2 ca liên tiếp?
// (giữ thực tế: mỗi ngày tối đa 1 ca; một ngày nghỉ giữa tuần)
export const mockMySchedule = [
  // ---- Tuần này (12–18/10) ----
  shift(0, 'sang', 'Barista', 'CONFIRMED'),
  shift(1, 'chieu', 'Phục vụ', 'CONFIRMED'),
  shift(2, 'toi', 'Thu ngân', 'CONFIRMED'),
  // 15/10 nghỉ
  shift(4, 'sang', 'Barista', 'ASSIGNED'),
  shift(5, 'chieu', 'Phục vụ', 'ASSIGNED'),
  shift(6, 'toi', 'Phục vụ', 'ASSIGNED'),
  // ---- Tuần sau (19–25/10) ----
  shift(7, 'sang', 'Barista', 'ASSIGNED'),
  shift(8, 'chieu', 'Phục vụ', 'ASSIGNED'),
  // 21/10 nghỉ
  shift(10, 'sang', 'Barista', 'ASSIGNED'),
  shift(11, 'toi', 'Thu ngân', 'ASSIGNED'),
  shift(13, 'chieu', 'Phục vụ', 'ASSIGNED'),
];

export const mockScheduleMeta = {
  publishedScheduleName: 'Lịch tuần 42 & 43',
  publishedAt: '2026-10-12 09:00',
  publishedBy: 'Quản lý cửa hàng',
};

export default { mockMySchedule, mockScheduleMeta };

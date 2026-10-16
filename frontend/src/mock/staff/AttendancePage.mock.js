// ============================================================
// AttendancePage.mock.js — Dữ liệu giả lập trang "Chấm công" STAFF (Task 2.7)
// Bám sát bảng `attendance_records` trong database/01_schema.sql
// Geofence cửa hàng: 100m (store_profile.geofence_radius_m)
// Trạng thái lịch sử: ON_TIME | LATE | ABSENT | COMPLETED | MISSING_CHECK_OUT
// Trạng thái hôm nay: NOT_CHECKED_IN | CHECKED_IN | COMPLETED
// ============================================================

// Chấm công hôm nay (bản ghi gắn với schedule_assignments hiện tại)
export const todayAttendance = {
  assignmentId: 9001,
  shiftName: 'Ca chiều',
  scheduledStart: '12:00',
  scheduledEnd: '17:00',
  checkedInAt: null,      // 'HH:MM' sau khi check-in
  checkedOutAt: null,     // 'HH:MM' sau khi check-out
  checkInDistance: null,  // mét, từ GPS
  status: 'NOT_CHECKED_IN',
};

// 18 bản ghi lịch sử chấm công (mới nhất → cũ nhất)
export const history = [
  { id: 701, date: '13/10/2026', shiftName: 'Ca chiều', checkInAt: '11:58', checkOutAt: '17:05', checkInDistance: 28, status: 'ON_TIME' },
  { id: 702, date: '12/10/2026', shiftName: 'Ca sáng', checkInAt: '07:14', checkOutAt: '12:02', checkInDistance: 45, status: 'LATE' },
  { id: 703, date: '11/10/2026', shiftName: 'Ca tối', checkInAt: null, checkOutAt: null, checkInDistance: null, status: 'ABSENT' },
  { id: 704, date: '10/10/2026', shiftName: 'Ca chiều', checkInAt: '11:55', checkOutAt: null, checkInDistance: 33, status: 'MISSING_CHECK_OUT' },
  { id: 705, date: '09/10/2026', shiftName: 'Ca sáng', checkInAt: '06:52', checkOutAt: '12:00', checkInDistance: 21, status: 'COMPLETED' },
  { id: 706, date: '08/10/2026', shiftName: 'Ca tối', checkInAt: '16:57', checkOutAt: '22:03', checkInDistance: 38, status: 'ON_TIME' },
  { id: 707, date: '07/10/2026', shiftName: 'Ca chiều', checkInAt: '12:11', checkOutAt: '17:00', checkInDistance: 52, status: 'LATE' },
  { id: 708, date: '06/10/2026', shiftName: 'Ca sáng', checkInAt: '06:58', checkOutAt: '12:01', checkInDistance: 19, status: 'ON_TIME' },
  { id: 709, date: '05/10/2026', shiftName: 'Ca tối', checkInAt: '17:02', checkOutAt: '22:00', checkInDistance: 30, status: 'COMPLETED' },
  { id: 710, date: '04/10/2026', shiftName: 'Ca chiều', checkInAt: '11:56', checkOutAt: '17:02', checkInDistance: 26, status: 'ON_TIME' },
  { id: 711, date: '03/10/2026', shiftName: 'Ca sáng', checkInAt: '07:21', checkOutAt: '12:00', checkInDistance: 41, status: 'LATE' },
  { id: 712, date: '02/10/2026', shiftName: 'Ca tối', checkInAt: '16:55', checkOutAt: '22:04', checkInDistance: 35, status: 'COMPLETED' },
  { id: 713, date: '01/10/2026', shiftName: 'Ca chiều', checkInAt: '11:59', checkOutAt: '17:01', checkInDistance: 24, status: 'ON_TIME' },
  { id: 714, date: '30/09/2026', shiftName: 'Ca sáng', checkInAt: '06:54', checkOutAt: '12:03', checkInDistance: 22, status: 'ON_TIME' },
  { id: 715, date: '29/09/2026', shiftName: 'Ca tối', checkInAt: null, checkOutAt: null, checkInDistance: null, status: 'ABSENT' },
  { id: 716, date: '28/09/2026', shiftName: 'Ca chiều', checkInAt: '12:03', checkOutAt: null, checkInDistance: 47, status: 'MISSING_CHECK_OUT' },
  { id: 717, date: '27/09/2026', shiftName: 'Ca sáng', checkInAt: '07:00', checkOutAt: '12:00', checkInDistance: 29, status: 'COMPLETED' },
  { id: 718, date: '26/09/2026', shiftName: 'Ca tối', checkInAt: '16:58', checkOutAt: '22:01', checkInDistance: 31, status: 'ON_TIME' },
];

const AttendancePageMock = { todayAttendance, history };
export default AttendancePageMock;

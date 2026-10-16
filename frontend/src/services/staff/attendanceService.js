// ============================================================
// attendanceService.js — Service giả lập API chấm công GPS (Task 2.7)
// Đối ứng bảng `attendance_records` + store_profile.geofence_radius_m = 100m.
// Kịch bản mô phỏng:
//  - Check-in sớm hơn '11:45' → { success: false, message: 'Chưa tới giờ check-in...' }
//  - Khoảng cách GPS > 100m (ngoài geofence) → từ chối chấm công
// ============================================================

import { todayAttendance as initialToday, history as initialHistory } from '../../mock/staff/AttendancePage.mock.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Tham số cửa hàng (store_profile)
export const GEOFENCE_RADIUS_M = 100;
// Check-in cho phép từ 11:45 (sớm hơn giờ bắt đầu ca 12:00 đúng 15 phút)
const CHECKIN_OPEN_AT = '11:45';

// Bản sao dữ liệu trong "session"
let todayAttendance = { ...initialToday };
let history = initialHistory.map((r) => ({ ...r }));
let nextHistoryId = 800;

function nowHM() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function todayDmy() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// '11:45' → số phút trong ngày
function hmToMinutes(hm) {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
}

// Bản ghi chấm công hôm nay
export async function getTodayAttendance() {
  await delay(300);
  return { ...todayAttendance };
}

// Lịch sử chấm công
export async function getHistory() {
  await delay(300);
  return history.map((r) => ({ ...r }));
}

// CHECK IN: { distance } — khoảng cách GPS mô phỏng tới cửa hàng (m)
export async function checkIn({ distance } = {}) {
  await delay(800);
  if (Number(distance) > GEOFENCE_RADIUS_M) {
    return { success: false, message: `Ngoài vùng ${GEOFENCE_RADIUS_M}m — không thể chấm công. Vui lòng di chuyển đến cửa hàng.` };
  }
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  if (currentMinutes < hmToMinutes(CHECKIN_OPEN_AT)) {
    return { success: false, message: `Chưa tới giờ check-in (cho phép từ ${CHECKIN_OPEN_AT})` };
  }
  const time = nowHM();
  todayAttendance = {
    ...todayAttendance,
    checkedInAt: time,
    checkInDistance: distance,
    status: 'CHECKED_IN',
  };
  return { success: true, time, distance };
}

// CHECK OUT: { distance } — yêu cầu đã check-in trước đó
export async function checkOut({ distance } = {}) {
  await delay(800);
  if (Number(distance) > GEOFENCE_RADIUS_M) {
    return { success: false, message: `Ngoài vùng ${GEOFENCE_RADIUS_M}m — không thể chấm công. Vui lòng di chuyển đến cửa hàng.` };
  }
  if (todayAttendance.status !== 'CHECKED_IN') {
    return { success: false, message: 'Bạn chưa check-in trong ca này.' };
  }
  const time = nowHM();
  todayAttendance = {
    ...todayAttendance,
    checkedOutAt: time,
    checkOutDistance: distance,
    status: 'COMPLETED',
  };
  // Cập nhật vào lịch sử chấm công
  history = [
    {
      id: nextHistoryId++,
      date: todayDmy(),
      shiftName: todayAttendance.shiftName,
      checkInAt: todayAttendance.checkedInAt,
      checkOutAt: time,
      checkInDistance: todayAttendance.checkInDistance,
      status: 'COMPLETED',
    },
    ...history,
  ];
  return { success: true, time, distance };
}

const attendanceService = { getTodayAttendance, getHistory, checkIn, checkOut, GEOFENCE_RADIUS_M };
export default attendanceService;

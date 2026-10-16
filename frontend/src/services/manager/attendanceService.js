// ============================================================
// SERVICE: Chấm công (Manager) — giả lập API với setTimeout
// Dữ liệu gốc từ mock, thao tác trên store module-level
// (mô phỏng DB: sau khi sửa, dữ liệu giữ nguyên trạng thái giữa các lần gọi)
// ============================================================

import { mockAttendanceRecords } from '../../mock/manager/AttendancePage.mock.js';

// Store module-level (giống DB trong phiên chạy)
let store = [...mockAttendanceRecords];

// Tham số nghiệp vụ từ schema / system_settings
const GEOFENCE_RADIUS_M = 100; // store_profile.geofence_radius_m
const GRACE_MINUTES = 5; // system_settings 'attendance.grace_minutes'

// Hàm phụ trợ: chờ giả lập độ trễ mạng
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Hàm phụ trợ: hiệu số phút giữa 2 mốc giờ dạng "HH:MM"
function minutesBetween(from, to) {
  const [fromH, fromM] = from.split(':').map(Number);
  const [toH, toM] = to.split(':').map(Number);
  return toH * 60 + toM - (fromH * 60 + fromM);
}

// Hàm phụ trợ: tự xác định lại trạng thái sau khi Manager sửa giờ.
// - ABSENT / INVALID_LOCATION chỉ tự đổi khi có đủ giờ vào/ra (xác nhận có đi làm);
//   riêng INVALID_LOCATION giữ nguyên vì lỗi GPS phải xử lý theo luồng riêng.
function resolveStatus(record) {
  const { checkInAt, checkOutAt } = record;
  if (record.status === 'INVALID_LOCATION') return 'INVALID_LOCATION';
  if (!checkInAt) return record.status === 'ABSENT' ? 'ABSENT' : 'NOT_CHECKED_IN';
  if (!checkOutAt) return 'MISSING_CHECK_OUT';
  // Có đủ giờ vào/ra → đối chiếu với giờ lịch (grace 5 phút)
  if (minutesBetween(record.scheduledStart, checkInAt) > GRACE_MINUTES) return 'LATE';
  if (minutesBetween(checkOutAt, record.scheduledEnd) > GRACE_MINUTES) return 'EARLY_DEPARTURE';
  return 'ON_TIME';
}

// Danh sách bản ghi chấm công, có bộ lọc theo ngày / trạng thái / từ khóa tìm kiếm
export async function listAttendance({ date, status, search } = {}) {
  await delay(350);

  let results = [...store];
  if (date) {
    results = results.filter((r) => r.workDate === date);
  }
  if (status && status !== 'ALL') {
    results = results.filter((r) => r.status === status);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (r) => r.employeeName.toLowerCase().includes(q) || r.employeeCode.toLowerCase().includes(q)
    );
  }
  return structuredClone(results);
}

// Manager sửa giờ thủ công — bắt buộc có lý do để phục vụ audit.
// Cập nhật giờ vào/ra, đánh dấu manualEdited và ghi chú nguồn gốc thay đổi.
export async function updateAttendanceTime(id, { checkInAt, checkOutAt, reason }) {
  await delay(450);

  if (!reason || !String(reason).trim()) {
    throw new Error('Vui lòng nhập lý do sửa giờ');
  }

  const idx = store.findIndex((r) => r.id === id);
  if (idx === -1) {
    throw new Error('Không tìm thấy bản ghi chấm công.');
  }

  const newCheckIn = checkInAt ? String(checkInAt) : null;
  const newCheckOut = checkOutAt ? String(checkOutAt) : null;

  if (newCheckIn && newCheckOut && minutesBetween(newCheckIn, newCheckOut) < 0) {
    throw new Error('Giờ check-out phải sau giờ check-in.');
  }

  const record = store[idx];
  const trimmedReason = String(reason).trim();
  const baseNote = record.note ? record.note : '';

  store[idx] = {
    ...record,
    checkInAt: newCheckIn,
    checkOutAt: newCheckOut,
    status: resolveStatus({ ...record, checkInAt: newCheckIn, checkOutAt: newCheckOut }),
    manualEdited: true,
    note: `${baseNote} [Sửa tay: ${trimmedReason}]`.trim(),
  };

  return structuredClone(store[idx]);
}

// Thống kê tổng quan theo trạng thái (cho hàng thẻ thống kê trên đầu trang)
export async function getAttendanceSummary() {
  await delay(250);

  const counts = {
    ON_TIME: 0,
    LATE: 0,
    ABSENT: 0,
    MISSING_CHECK_OUT: 0,
    EARLY_DEPARTURE: 0,
    NOT_CHECKED_IN: 0,
    INVALID_LOCATION: 0,
  };
  for (const record of store) {
    if (counts[record.status] !== undefined) counts[record.status] += 1;
  }

  return {
    total: store.length,
    counts,
    // Số bản ghi check-in ngoài vùng geofence 100m
    outOfGeofence: store.filter((r) => (r.checkInDistance ?? 0) > GEOFENCE_RADIUS_M).length,
    // Số bản ghi đã bị sửa tay
    manualEdited: store.filter((r) => r.manualEdited).length,
  };
}

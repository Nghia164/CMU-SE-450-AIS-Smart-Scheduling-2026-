// ============================================================
// SERVICE: Đăng ký lịch rảnh (Staff) — giả lập API với setTimeout
// ============================================================
import {
  mockAvailabilityEntries,
  mockDeadlineInfo,
  DAY_OPTIONS,
  SLOT_OPTIONS,
} from '../../mock/staff/AvailabilityPage.mock.js';

let store = structuredClone(mockAvailabilityEntries);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Danh sách khung giờ rảnh/bận + thông tin hạn nộp
export async function getAvailability() {
  await delay(350);
  return {
    entries: structuredClone(store),
    deadlineInfo: structuredClone(mockDeadlineInfo),
    days: DAY_OPTIONS,
    slots: SLOT_OPTIONS,
  };
}

// Thêm hoặc sửa khung giờ — validate không trùng khung trong cùng ngày
export async function saveAvailabilityEntry({ id, dayOfWeek, slot, type, note }) {
  await delay(450);
  if (!dayOfWeek || !slot) throw new Error('Vui lòng chọn ngày và khung giờ.');
  const [startTime, endTime] = slot.split('–');
  const duplicate = store.some(
    (e) => e.dayOfWeek === dayOfWeek && e.startTime === startTime && e.id !== id
  );
  if (duplicate) throw new Error('Ngày này đã có khung giờ trùng. Hãy xóa khung cũ trước.');

  if (id) {
    const idx = store.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Không tìm thấy khung giờ cần sửa.');
    store[idx] = { ...store[idx], dayOfWeek, startTime, endTime, type, note: note ?? '' };
    return structuredClone(store[idx]);
  }

  const newId = Math.max(...store.map((e) => e.id), 0) + 1;
  const created = { id: newId, dayOfWeek, startTime, endTime, type, note: note ?? '' };
  store.push(created);
  return structuredClone(created);
}

// Xóa khung giờ đã đăng ký
export async function removeAvailabilityEntry(id) {
  await delay(300);
  const idx = store.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Không tìm thấy khung giờ.');
  store.splice(idx, 1);
  return id;
}

export default { getAvailability, saveAvailabilityEntry, removeAvailabilityEntry };

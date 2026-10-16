// ============================================================
// SERVICE: Lịch làm của tôi (Staff) — giả lập API với setTimeout
// ============================================================
import { mockMySchedule, mockScheduleMeta } from '../../mock/staff/SchedulePage.mock.js';

let store = structuredClone(mockMySchedule);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Danh sách ca cá nhân (chỉ từ lịch PUBLISHED) + thông tin lịch
export async function getMySchedule() {
  await delay(400);
  return { assignments: structuredClone(store), meta: structuredClone(mockScheduleMeta) };
}

// Xác nhận 1 ca: ASSIGNED → CONFIRMED
export async function confirmAssignment(id) {
  await delay(350);
  const idx = store.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Không tìm thấy ca trong lịch.');
  if (store[idx].status !== 'ASSIGNED') throw new Error('Ca này đã được xác nhận trước đó.');
  store[idx] = { ...store[idx], status: 'CONFIRMED' };
  return structuredClone(store[idx]);
}

export default { getMySchedule, confirmAssignment };

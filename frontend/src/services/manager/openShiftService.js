// ============================================================
// SERVICE: Quản lý ca mở (Manager) — giả lập API với setTimeout
// Store module-level giữ trạng thái giữa các lần gọi (mô phỏng DB)
// ============================================================
import { mockOpenShifts } from '../../mock/manager/OpenShiftsPage.mock.js';

let store = structuredClone(mockOpenShifts);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Danh sách ca mở + thống kê nhanh cho các thẻ đầu trang
export async function listOpenShifts() {
  await delay(350);
  const stats = {
    open: store.filter((s) => s.status === 'OPEN').length,
    claimedToday: store.filter(
      (s) => s.status === 'CLAIMED' && (s.claimedAt ?? '').startsWith('2026-10-14')
    ).length,
    closingSoon: store.filter((s) => s.status === 'OPEN' && s.workDate <= '2026-10-15').length,
  };
  return { shifts: structuredClone(store), stats };
}

// Tạo ca mở mới — bám schema open_shifts + shift_requirements
export async function createOpenShift(payload) {
  await delay(450);
  if (!payload.workDate || !payload.shiftName || !payload.position) {
    throw new Error('Vui lòng điền đủ ngày, ca và vị trí.');
  }
  if (!payload.requiredHeadcount || payload.requiredHeadcount < 1) {
    throw new Error('Số lượng cần nhận phải ≥ 1.');
  }
  const maxId = Math.max(...store.map((s) => s.id), 0);
  const created = {
    id: maxId + 1,
    shiftName: payload.shiftName,
    workDate: payload.workDate,
    timeRange: payload.timeRange ?? '07:00–12:00',
    position: payload.position,
    skillRequired: payload.skillRequired ?? 'Chăm sóc khách hàng',
    minSkillLevel: payload.minSkillLevel ?? 2,
    requiredHeadcount: payload.requiredHeadcount,
    filledCount: 0,
    status: 'OPEN',
    claimedBy: null,
    claimedAt: null,
    bonusNote: payload.bonusNote || null,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    note: payload.note || '',
    candidates: [],
  };
  store.unshift(created);
  return structuredClone(created);
}

// Đóng ca mở (không nhận thêm người)
export async function closeOpenShift(id) {
  await delay(300);
  const idx = store.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error('Không tìm thấy ca mở.');
  if (store[idx].status !== 'OPEN') throw new Error('Chỉ có thể đóng ca đang mở.');
  store[idx] = { ...store[idx], status: 'CLOSED', note: `${store[idx].note} [Đóng bởi Quản lý]`.trim() };
  return structuredClone(store[idx]);
}

// Gửi mời nhận ca tới danh sách ứng viên được chọn
export async function sendInvite(shiftId, candidateIds) {
  await delay(400);
  const idx = store.findIndex((s) => s.id === shiftId);
  if (idx === -1) throw new Error('Không tìm thấy ca mở.');
  if (!candidateIds?.length) throw new Error('Chọn ít nhất một ứng viên để gửi mời.');

  const inviteNames = candidateIds.length;
  const baseNote = store[idx].note.replace(/\s*\[Đã gửi mời.*?\]/g, '').trim();
  store[idx] = {
    ...store[idx],
    note: `${baseNote} [Đã gửi mời tới ${inviteNames} ứng viên]`.trim(),
  };
  return structuredClone(store[idx]);
}

// Đánh dấu nhân viên đã nhận ca (first-come-first-served)
export async function claimShift(id, employeeName) {
  await delay(500);
  const idx = store.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error('Không tìm thấy ca mở.');
  if (store[idx].status !== 'OPEN') throw new Error('Ca này đã đóng hoặc đã có người nhận.');

  store[idx] = {
    ...store[idx],
    filledCount: store[idx].filledCount + 1,
    claimedBy: employeeName,
    claimedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    status: store[idx].filledCount + 1 >= store[idx].requiredHeadcount ? 'CLAIMED' : 'OPEN',
  };
  return structuredClone(store[idx]);
}

export default { listOpenShifts, createOpenShift, closeOpenShift, sendInvite, claimShift };

// ============================================================
// swapService.js — Service giả lập API cho trang "Đổi ca" (Task 2.5)
// Đối ứng bảng `shift_swap_requests` (status: PENDING, ACCEPTED_BY_STAFF,
// APPROVED, REJECTED, CANCELLED) — Laravel REST API sẽ thay thế sau này.
// ============================================================

import {
  myShifts,
  colleagues,
  swapRequests as initialSwapRequests,
  incomingRequests as initialIncomingRequests,
} from '../../mock/staff/SwapPage.mock.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Bản sao dữ liệu trong "session" để mô phỏng thao tác CRUD
let swapRequests = initialSwapRequests.map((r) => ({ ...r }));
let incomingRequests = initialIncomingRequests.map((r) => ({ ...r }));
let nextId = 1000;

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Lấy toàn bộ dữ liệu trang Đổi ca
export async function getSwapData() {
  await delay(450);
  return {
    myShifts: myShifts.map((s) => ({ ...s })),
    colleagues: colleagues.map((c) => ({ ...c })),
    swapRequests: swapRequests.map((r) => ({ ...r })),
    incomingRequests: incomingRequests.map((r) => ({ ...r })),
  };
}

// Tạo yêu cầu đổi ca: payload { myShiftId, targetId, reason, targetShiftLabel? }
export async function createSwapRequest({ myShiftId, targetId, reason, targetShiftLabel } = {}) {
  await delay(500);
  const myShift = myShifts.find((s) => s.id === Number(myShiftId));
  if (!myShift) throw new Error('Vui lòng chọn ca của bạn.');
  const colleague = colleagues.find((c) => c.id === Number(targetId));
  if (!colleague) throw new Error('Vui lòng chọn đồng nghiệp.');
  if (!reason || !reason.trim()) throw new Error('Vui lòng nhập lý do');

  const request = {
    id: nextId++,
    myShiftId: myShift.id,
    myShiftLabel: `${myShift.shiftName} · ${myShift.date}`,
    targetName: colleague.name,
    targetShiftLabel: targetShiftLabel || `Ca chiều · ${myShift.date}`,
    reason: reason.trim(),
    status: 'PENDING',
    createdAt: nowStamp(),
    reviewedNote: null,
  };
  swapRequests = [request, ...swapRequests];
  return { ...request };
}

// Hủy yêu cầu đổi ca do chính mình gửi (chỉ khi PENDING)
export async function cancelSwapRequest(id) {
  await delay(400);
  const found = swapRequests.find((r) => r.id === Number(id));
  if (!found) throw new Error('Không tìm thấy yêu cầu đổi ca.');
  if (found.status !== 'PENDING') throw new Error('Chỉ có thể hủy yêu cầu đang chờ phản hồi.');
  found.status = 'CANCELLED';
  return { ...found };
}

// Phản hồi yêu cầu đến từ đồng nghiệp: accept = true → ACCEPTED_BY_STAFF, false → REJECTED
export async function respondIncoming(id, accept) {
  await delay(450);
  const found = incomingRequests.find((r) => r.id === Number(id));
  if (!found) throw new Error('Không tìm thấy yêu cầu đổi ca.');
  if (found.status !== 'PENDING') throw new Error('Yêu cầu này đã được phản hồi.');
  found.status = accept ? 'ACCEPTED_BY_STAFF' : 'REJECTED';
  return { ...found };
}

const swapService = { getSwapData, createSwapRequest, cancelSwapRequest, respondIncoming };
export default swapService;

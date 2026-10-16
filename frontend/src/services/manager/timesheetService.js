// ============================================================
// SERVICE: Bảng công (Manager) — giả lập API với setTimeout
// Duyệt / từ chối / duyệt hàng loạt trên store module-level
// ============================================================
import { mockTimesheets } from '../../mock/manager/TimesheetsPage.mock.js';

let store = structuredClone(mockTimesheets);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const nowStamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `2026-10-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Danh sách bảng công có bộ lọc trạng thái + tìm kiếm tên/mã
export async function listTimesheets({ status, search } = {}) {
  await delay(350);
  let results = [...store];
  if (status && status !== 'ALL') {
    results = results.filter((t) => t.status === status);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (t) => t.employeeName.toLowerCase().includes(q) || t.employeeCode.toLowerCase().includes(q)
    );
  }
  return structuredClone(results);
}

// Duyệt 1 bảng công đang chờ
export async function approveTimesheet(id) {
  await delay(400);
  const idx = store.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Không tìm thấy bảng công.');
  if (store[idx].status !== 'PENDING_APPROVAL') {
    throw new Error('Chỉ duyệt được bảng công ở trạng thái "Chờ duyệt".');
  }
  store[idx] = {
    ...store[idx],
    status: 'APPROVED',
    approvedBy: 'Quản lý cửa hàng',
    approvedAt: nowStamp(),
  };
  return structuredClone(store[idx]);
}

// Từ chối bảng công — bắt buộc có lý do
export async function rejectTimesheet(id, reason) {
  await delay(400);
  if (!reason || !String(reason).trim()) {
    throw new Error('Vui lòng nhập lý do từ chối.');
  }
  const idx = store.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Không tìm thấy bảng công.');
  if (store[idx].status !== 'PENDING_APPROVAL') {
    throw new Error('Chỉ từ chối được bảng công ở trạng thái "Chờ duyệt".');
  }
  store[idx] = {
    ...store[idx],
    status: 'REJECTED',
    adjustmentReason: String(reason).trim(),
  };
  return structuredClone(store[idx]);
}

// Duyệt hàng loạt toàn bộ bản ghi đang chờ — trả về số dòng đã duyệt
export async function bulkApprove(ids = null) {
  await delay(700);
  const targets = ids
    ? store.filter((t) => ids.includes(t.id) && t.status === 'PENDING_APPROVAL')
    : store.filter((t) => t.status === 'PENDING_APPROVAL');
  const stamp = nowStamp();
  for (const t of targets) {
    const idx = store.findIndex((x) => x.id === t.id);
    store[idx] = {
      ...store[idx],
      status: 'APPROVED',
      approvedBy: 'Quản lý cửa hàng',
      approvedAt: stamp,
    };
  }
  return targets.length;
}

// Thống kê tổng hợp cho các thẻ đầu trang
export async function getSummary() {
  await delay(250);
  const totalRegular = store.reduce((s, t) => s + (t.regularHours ?? 0), 0);
  const totalOvertime = store.reduce((s, t) => s + (t.overtimeHours ?? 0), 0);
  const totalAmount = store
    .filter((t) => t.status !== 'REJECTED')
    .reduce((s, t) => s + (t.estimatedAmount ?? 0), 0);
  return {
    totalRegularHours: Math.round(totalRegular * 100) / 100,
    totalOvertimeHours: Math.round(totalOvertime * 100) / 100,
    totalAmount,
    pendingCount: store.filter((t) => t.status === 'PENDING_APPROVAL').length,
  };
}

export default { listTimesheets, approveTimesheet, rejectTimesheet, bulkApprove, getSummary };

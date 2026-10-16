// ============================================================
// leaveService.js — Service giả lập API cho trang "Xin nghỉ phép" (Task 2.6)
// Đối ứng bảng `leave_requests` (leave_type: ANNUAL, SICK, PERSONAL, UNPAID,
// EMERGENCY, OTHER — status: PENDING, APPROVED, REJECTED, CANCELLED).
// ============================================================

import { leaveBalance, myLeaveRequests as initialLeaveRequests } from '../../mock/staff/LeavePage.mock.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const LEAVE_TYPE_LABELS = {
  ANNUAL: 'Nghỉ phép năm',
  SICK: 'Nghỉ ốm',
  PERSONAL: 'Nghỉ việc riêng',
  UNPAID: 'Nghỉ không lương',
  EMERGENCY: 'Nghỉ khẩn cấp',
  OTHER: 'Lý do khác',
};

// Bản sao dữ liệu trong "session"
let myLeaveRequests = initialLeaveRequests.map((r) => ({ ...r }));
let nextId = 500;

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 'dd/MM/yyyy' → Date
function parseDmy(dmy) {
  const [d, m, y] = dmy.split('/').map(Number);
  return new Date(y, m - 1, d);
}

// Lấy dữ liệu trang nghỉ phép
export async function getLeaveData() {
  await delay(400);
  return {
    leaveBalance: {
      annual: { ...leaveBalance.annual },
      sick: { ...leaveBalance.sick },
      personal: { ...leaveBalance.personal },
    },
    myLeaveRequests: myLeaveRequests.map((r) => ({ ...r })),
  };
}

// Tạo đơn xin nghỉ: { leaveType, startDate, endDate, reason } (dd/MM/yyyy)
export async function createLeaveRequest({ leaveType, startDate, endDate, reason } = {}) {
  await delay(500);
  if (!leaveType || !LEAVE_TYPE_LABELS[leaveType]) throw new Error('Vui lòng chọn loại nghỉ.');
  if (!startDate || !endDate) throw new Error('Vui lòng chọn ngày bắt đầu và ngày kết thúc.');
  const start = parseDmy(startDate);
  const end = parseDmy(endDate);
  // Validate ở service: ngày kết thúc phải sau ngày bắt đầu
  if (end < start) throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
  if (!reason || !reason.trim()) throw new Error('Vui lòng nhập lý do nghỉ phép.');

  const days = Math.round((end - start) / 86400000) + 1;
  const request = {
    id: nextId++,
    leaveType,
    typeLabel: LEAVE_TYPE_LABELS[leaveType],
    startDate,
    endDate,
    days,
    reason: reason.trim(),
    status: 'PENDING',
    reviewedNote: null,
    createdAt: nowStamp(),
  };
  myLeaveRequests = [request, ...myLeaveRequests];
  return { ...request };
}

// Hủy đơn xin nghỉ (chỉ khi PENDING)
export async function cancelLeaveRequest(id) {
  await delay(400);
  const found = myLeaveRequests.find((r) => r.id === Number(id));
  if (!found) throw new Error('Không tìm thấy đơn xin nghỉ.');
  if (found.status !== 'PENDING') throw new Error('Chỉ có thể hủy đơn đang chờ duyệt.');
  found.status = 'CANCELLED';
  return { ...found };
}

const leaveService = { getLeaveData, createLeaveRequest, cancelLeaveRequest };
export default leaveService;

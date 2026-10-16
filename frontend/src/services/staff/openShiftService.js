// ============================================================
// SERVICE: Nhận ca mở (Staff) — giả lập API với setTimeout
// First-come-first-served: ca id=6 mô phỏng bị "giành mất" khi nhận
// ============================================================
import { mockStaffOpenShifts, mockMyClaims } from '../../mock/staff/OpenShiftsPage.mock.js';

let shiftStore = structuredClone(mockStaffOpenShifts);
let claimStore = structuredClone(mockMyClaims);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Danh sách ca mở hợp lệ + ca tôi đã nhận
export async function listOpenShifts() {
  await delay(350);
  return {
    shifts: structuredClone(shiftStore),
    myClaims: structuredClone(claimStore),
  };
}

// Nhận ca — first-come-first-served
export async function claimShift(id) {
  await delay(600);
  const idx = shiftStore.findIndex((s) => s.id === id);
  if (idx === -1) {
    return { success: false, message: 'Không tìm thấy ca mở.' };
  }
  const target = shiftStore[idx];

  // Mô phỏng ca hot bị người khác nhận trước (ca tối 17/10 Barista cấp 4 hoặc ca id nhỏ chậm tay)
  if (target.id === 5) {
    return { success: false, message: 'Ca vừa được người khác nhận. Bạn đã chậm tay.' };
  }
  if (target.status !== 'OPEN') {
    return { success: false, message: 'Ca này đã đóng hoặc đã có người nhận.' };
  }
  if (target.eligibility !== 'ELIGIBLE') {
    return { success: false, message: target.eligibilityLabel ?? 'Bạn không đủ điều kiện nhận ca này.' };
  }

  // Cập nhật ca
  const claimed = {
    ...target,
    status: 'CLAIMED',
    claimedBy: 'Nhân viên mẫu',
    eligibility: 'ALREADY_CLAIMED',
    eligibilityLabel: 'Bạn đã nhận ca này',
  };
  shiftStore[idx] = claimed;

  // Thêm vào danh sách ca tôi đã nhận
  claimStore.unshift({
    id: target.id,
    shiftName: target.shiftName,
    date: target.date,
    startTime: target.startTime,
    endTime: target.endTime,
    position: target.position,
    bonusNote: target.bonusNote,
    status: 'CLAIMED',
    claimedAt: '2026-10-14 22:00',
  });

  return {
    success: true,
    message: `Đã nhận ca ${target.shiftName} ngày ${target.date} thành công!`,
    shift: structuredClone(claimed),
  };
}

export default { listOpenShifts, claimShift };

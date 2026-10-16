// File này cung cấp các hàm lấy dữ liệu xếp lịch, chạy bộ giải OR-Tools, chỉnh sửa lịch nháp và chốt lịch chính thức.
import { mockSchedulingData } from '../../mock/manager/SchedulingPage.mock.js';

// Lưu trạng thái lịch trong bộ nhớ phiên để Manager chỉnh sửa bản nháp hoặc chốt lịch.
let store = structuredClone(mockSchedulingData);

// Hàm này tải dữ liệu cấu hình ca, danh sách 30 nhân viên và bảng phân công hiện tại.
export async function getSchedulingData() {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return structuredClone(store);
}

// Hàm này mô phỏng chạy công cụ OR-Tools CP-SAT để sinh bản nháp lịch làm việc tuần.
export async function runScheduler() {
  await new Promise((resolve) => setTimeout(resolve, 600));
  store.scheduleStatus = 'DRAFT';
  return structuredClone(store);
}

// Hàm này cập nhật danh sách nhân viên trong một ô (ca/ngày) của lịch nháp khi Manager chỉnh sửa thủ công.
export async function updateDraftCellStaff(shiftKey, dayIdx, nextStaffList) {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const cell = store.grid[shiftKey]?.[dayIdx];
  if (cell) {
    cell.staff = [...nextStaffList];
    cell.a = cell.staff.length;
  }
  return structuredClone(store);
}

// Hàm này chốt bản nháp thành lịch làm việc chính thức (PUBLISHED) để thông báo cho nhân viên.
export async function publishSchedule() {
  await new Promise((resolve) => setTimeout(resolve, 350));
  store.scheduleStatus = 'PUBLISHED';
  return structuredClone(store);
}
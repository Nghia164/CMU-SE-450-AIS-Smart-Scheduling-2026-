// ============================================================
// timesheetService.js — Service giả lập API "Bảng công" STAFF (Task 2.8)
// Đối ứng bảng `timesheets` (status: DRAFT, PENDING_APPROVAL, APPROVED,
// REJECTED, ADJUSTED) — staff chỉ XEM, không có quyền sửa.
// ============================================================

import { summary, timesheets as initialTimesheets } from '../../mock/staff/TimesheetsPage.mock.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Bảng công + tổng hợp của nhân sự đang đăng nhập
export async function getMyTimesheets() {
  await delay(400);
  return {
    summary: { ...summary },
    timesheets: initialTimesheets.map((t) => ({ ...t })),
  };
}

const timesheetService = { getMyTimesheets };
export default timesheetService;

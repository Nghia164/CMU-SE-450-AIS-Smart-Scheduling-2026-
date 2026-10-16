// ============================================================
// TimesheetsPage.mock.js — Dữ liệu giả lập trang "Bảng công" STAFF (Task 2.8)
// Bám sát bảng `timesheets` trong database/01_schema.sql
// Trạng thái: DRAFT | PENDING_APPROVAL | APPROVED | REJECTED | ADJUSTED
// Kỳ công: 01–15/10/2026 · Lương giờ snapshot: 25.000₫/h · OT x1.5
// ============================================================

// Tổng hợp kỳ công hiện tại
export const summary = {
  periodLabel: 'Chu kỳ 01–15/10/2026',
  regularHours: 68.5,     // Giờ thường
  overtimeHours: 6.0,     // Giờ tăng ca
  approvedHours: 62.0,    // Đã được duyệt
  pendingHours: 12.5,     // Đang chờ duyệt
  estimatedPay: 2142500,  // Ước tính lương nhận kỳ này (VND)
};

// 16 bản ghi chi tiết giờ công (mới nhất → cũ nhất)
export const timesheets = [
  { id: 601, workDate: '15/10/2026', shiftName: 'Ca chiều', actualStart: '12:00', actualEnd: '17:05', breakMinutes: 30, regularHours: 4.5, overtimeHours: 0.5, estimatedAmount: 131250, status: 'DRAFT', adjustmentReason: null },
  { id: 602, workDate: '14/10/2026', shiftName: 'Ca sáng', actualStart: '07:02', actualEnd: '12:00', breakMinutes: 30, regularHours: 4.5, overtimeHours: 0, estimatedAmount: 112500, status: 'PENDING_APPROVAL', adjustmentReason: null },
  { id: 603, workDate: '13/10/2026', shiftName: 'Ca chiều', actualStart: '11:58', actualEnd: '17:05', breakMinutes: 30, regularHours: 4.5, overtimeHours: 0.5, estimatedAmount: 131250, status: 'PENDING_APPROVAL', adjustmentReason: null },
  { id: 604, workDate: '12/10/2026', shiftName: 'Ca sáng', actualStart: '07:14', actualEnd: '12:02', breakMinutes: 30, regularHours: 4.3, overtimeHours: 0, estimatedAmount: 107500, status: 'PENDING_APPROVAL', adjustmentReason: null },
  { id: 605, workDate: '11/10/2026', shiftName: 'Ca tối', actualStart: '17:00', actualEnd: '22:30', breakMinutes: 30, regularHours: 5.0, overtimeHours: 0, estimatedAmount: 125000, status: 'PENDING_APPROVAL', adjustmentReason: null },
  { id: 606, workDate: '10/10/2026', shiftName: 'Ca chiều', actualStart: '11:55', actualEnd: '17:00', breakMinutes: 30, regularHours: 4.5, overtimeHours: 0, estimatedAmount: 112500, status: 'APPROVED', adjustmentReason: null },
  { id: 607, workDate: '09/10/2026', shiftName: 'Ca sáng', actualStart: '06:52', actualEnd: '12:10', breakMinutes: 30, regularHours: 4.5, overtimeHours: 0.5, estimatedAmount: 131250, status: 'APPROVED', adjustmentReason: null },
  { id: 608, workDate: '08/10/2026', shiftName: 'Ca tối', actualStart: '16:57', actualEnd: '22:05', breakMinutes: 30, regularHours: 4.5, overtimeHours: 0.5, estimatedAmount: 131250, status: 'APPROVED', adjustmentReason: null },
  { id: 609, workDate: '07/10/2026', shiftName: 'Ca chiều', actualStart: '12:11', actualEnd: '17:00', breakMinutes: 30, regularHours: 4.2, overtimeHours: 0, estimatedAmount: 105000, status: 'APPROVED', adjustmentReason: null },
  { id: 610, workDate: '06/10/2026', shiftName: 'Ca sáng', actualStart: '06:58', actualEnd: '12:30', breakMinutes: 30, regularHours: 5.0, overtimeHours: 0, estimatedAmount: 125000, status: 'APPROVED', adjustmentReason: null },
  { id: 611, workDate: '05/10/2026', shiftName: 'Ca tối', actualStart: '17:02', actualEnd: '22:35', breakMinutes: 30, regularHours: 5.0, overtimeHours: 0.5, estimatedAmount: 143750, status: 'APPROVED', adjustmentReason: null },
  { id: 612, workDate: '04/10/2026', shiftName: 'Ca chiều', actualStart: '11:56', actualEnd: '17:40', breakMinutes: 45, regularHours: 4.5, overtimeHours: 1.0, estimatedAmount: 168750, status: 'APPROVED', adjustmentReason: null },
  { id: 613, workDate: '03/10/2026', shiftName: 'Ca sáng', actualStart: '07:21', actualEnd: '12:00', breakMinutes: 30, regularHours: 4.2, overtimeHours: 0, estimatedAmount: 105000, status: 'REJECTED', adjustmentReason: 'Không có đơn xin đi muộn, cần bổ sung xác nhận trước khi duyệt.' },
  { id: 614, workDate: '02/10/2026', shiftName: 'Ca tối', actualStart: '16:55', actualEnd: '22:00', breakMinutes: 30, regularHours: 4.5, overtimeHours: 0, estimatedAmount: 112500, status: 'REJECTED', adjustmentReason: 'Trùng dữ liệu chấm công ngày 27/09, đã yêu cầu đối chiếu lại.' },
  { id: 615, workDate: '01/10/2026', shiftName: 'Ca chiều', actualStart: '11:59', actualEnd: '17:02', breakMinutes: 30, regularHours: 4.5, overtimeHours: 0, estimatedAmount: 112500, status: 'ADJUSTED', adjustmentReason: 'Quản lý chỉnh nghỉ giữa ca từ 30 phút thành 35 phút theo thực tế.' },
  { id: 616, workDate: '30/09/2026', shiftName: 'Ca sáng', actualStart: '06:54', actualEnd: '12:03', breakMinutes: 30, regularHours: 4.5, overtimeHours: 0, estimatedAmount: 112500, status: 'DRAFT', adjustmentReason: null },
];

const TimesheetsPageMock = { summary, timesheets };
export default TimesheetsPageMock;

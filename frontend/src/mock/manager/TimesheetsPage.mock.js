// ============================================================
// MOCK: Bảng công (Manager) — bám schema dbo.timesheets
// Chu kỳ: tuần 13–19/10/2026
// estimatedAmount = regularHours*rate + overtimeHours*rate*1.5
// Phân bố 30 bản ghi: 12 PENDING_APPROVAL, 12 APPROVED, 3 REJECTED, 3 ADJUSTED
// ============================================================

export const STATUS_LABELS = {
  DRAFT: 'Nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  ADJUSTED: 'Đã điều chỉnh',
};

// (employeeCode, employeeName, hourlyRate)
const STAFF = [
  ['NV001', 'Nguyễn Văn An', 30000],
  ['NV002', 'Trần Thị Bích', 28000],
  ['NV003', 'Lê Hoàng Cường', 35000],
  ['NV004', 'Phạm Thu Dung', 25000],
  ['NV005', 'Hoàng Văn Em', 27000],
  ['NV006', 'Vũ Ngọc Phương', 32000],
  ['NV007', 'Đặng Minh Giang', 26000],
  ['NV008', 'Bùi Thanh Hà', 30000],
  ['NV009', 'Ngô Đức Anh', 25000],
  ['NV010', 'Dương Thị Khanh', 28000],
  ['NV011', 'Lý Thành Long', 33000],
  ['NV012', 'Trịnh Bảo Mai', 30000],
  ['NV013', 'Phan Quốc Cường', 27000],
  ['NV014', 'Hà Kim Trang', 32000],
  ['NV015', 'Đỗ Trung Kiên', 26000],
];

// Sinh 1 bản ghi timesheet
function ts(id, staffIdx, day, shiftName, actualStart, actualEnd, breakMinutes, regular, overtime, status, extra = {}) {
  const [code, name, rate] = STAFF[staffIdx];
  return {
    id,
    employeeCode: code,
    employeeName: name,
    workDate: `2026-10-${String(day).padStart(2, '0')}`,
    shiftName,
    actualStart,
    actualEnd,
    breakMinutes,
    regularHours: regular,
    overtimeHours: overtime,
    hourlyRate: rate,
    estimatedAmount: Math.round((regular * rate + overtime * rate * 1.5) / 1000) * 1000,
    status,
    adjustmentReason: extra.adjustmentReason ?? null,
    approvedBy: status === 'APPROVED' || status === 'ADJUSTED' ? 'Quản lý cửa hàng' : null,
    approvedAt: status === 'APPROVED' || status === 'ADJUSTED' ? `2026-10-${String(day + 1).padStart(2, '0')} 09:00` : null,
    ...extra,
  };
}

export const mockTimesheets = [
  // ---------- PENDING_APPROVAL (12) ----------
  ts(1, 0, 13, 'Ca sáng', '06:55', '12:10', 30, 5.0, 0.0, 'PENDING_APPROVAL'),
  ts(2, 1, 13, 'Ca chiều', '11:58', '17:05', 30, 5.0, 0.0, 'PENDING_APPROVAL'),
  ts(3, 2, 14, 'Ca tối', '16:57', '22:30', 45, 5.0, 0.5, 'PENDING_APPROVAL'),
  ts(4, 3, 14, 'Ca sáng', '07:02', '12:00', 30, 4.5, 0.0, 'PENDING_APPROVAL'),
  ts(5, 4, 15, 'Ca chiều', '12:05', '17:00', 30, 4.5, 0.0, 'PENDING_APPROVAL'),
  ts(6, 5, 15, 'Ca tối', '17:00', '23:00', 45, 5.0, 1.0, 'PENDING_APPROVAL'),
  ts(7, 6, 16, 'Ca sáng', '06:50', '12:15', 30, 5.0, 0.0, 'PENDING_APPROVAL'),
  ts(8, 7, 16, 'Ca tối', '17:05', '22:00', 45, 4.5, 0.0, 'PENDING_APPROVAL'),
  ts(9, 8, 17, 'Ca chiều', '12:00', '17:30', 30, 5.0, 0.5, 'PENDING_APPROVAL'),
  ts(10, 9, 18, 'Ca sáng', '07:00', '12:00', 30, 5.0, 0.0, 'PENDING_APPROVAL'),
  ts(11, 10, 18, 'Ca tối', '16:55', '22:45', 45, 5.0, 0.75, 'PENDING_APPROVAL'),
  ts(12, 11, 19, 'Ca chiều', '12:03', '17:00', 30, 4.5, 0.0, 'PENDING_APPROVAL'),

  // ---------- APPROVED (12) ----------
  ts(13, 12, 13, 'Ca tối', '17:00', '22:00', 45, 4.5, 0.0, 'APPROVED'),
  ts(14, 13, 13, 'Ca sáng', '06:58', '12:00', 30, 5.0, 0.0, 'APPROVED'),
  ts(15, 14, 14, 'Ca chiều', '12:00', '17:00', 30, 5.0, 0.0, 'APPROVED'),
  ts(16, 0, 15, 'Ca tối', '17:02', '22:10', 45, 5.0, 0.0, 'APPROVED'),
  ts(17, 1, 16, 'Ca sáng', '07:00', '12:00', 30, 5.0, 0.0, 'APPROVED'),
  ts(18, 2, 16, 'Ca chiều', '12:00', '17:00', 30, 5.0, 0.0, 'APPROVED'),
  ts(19, 3, 17, 'Ca tối', '17:00', '22:00', 45, 4.5, 0.0, 'APPROVED'),
  ts(20, 4, 17, 'Ca sáng', '06:52', '12:00', 30, 5.0, 0.0, 'APPROVED'),
  ts(21, 5, 18, 'Ca chiều', '12:00', '17:20', 30, 5.0, 0.0, 'APPROVED'),
  ts(22, 6, 18, 'Ca tối', '17:00', '22:00', 45, 4.5, 0.0, 'APPROVED'),
  ts(23, 7, 19, 'Ca sáng', '07:05', '12:00', 30, 4.5, 0.0, 'APPROVED'),
  ts(24, 8, 19, 'Ca tối', '17:00', '22:15', 45, 5.0, 0.0, 'APPROVED'),

  // ---------- REJECTED (3) ----------
  ts(25, 9, 14, 'Ca tối', null, null, 0, 0.0, 0.0, 'REJECTED', {
    adjustmentReason: 'Không có dữ liệu check-in GPS — không thể xác nhận giờ công.',
  }),
  ts(26, 10, 15, 'Ca sáng', '08:40', '12:00', 30, 3.0, 0.0, 'REJECTED', {
    adjustmentReason: 'Check-in GPS cách cửa hàng 145m (ngoài geofence) — cần đối chiếu camera.',
  }),
  ts(27, 11, 17, 'Ca chiều', '12:00', '15:20', 30, 3.0, 0.0, 'REJECTED', {
    adjustmentReason: 'Về sớm không lý do — chờ giải trình của nhân viên.',
  }),

  // ---------- ADJUSTED (3) ----------
  ts(28, 12, 15, 'Ca chiều', '12:00', '17:00', 30, 5.0, 0.0, 'ADJUSTED', {
    adjustmentReason: 'Quên check-out — camera xác nhận ra về 17:02, sửa giờ thủ công.',
  }),
  ts(29, 13, 16, 'Ca tối', '17:00', '22:00', 45, 4.5, 0.0, 'ADJUSTED', {
    adjustmentReason: 'Sự cố GPS lúc check-in — đối chiếu lịch sử camera, cộng đủ giờ.',
  }),
  ts(30, 14, 19, 'Ca chiều', '12:00', '17:05', 30, 5.0, 0.0, 'ADJUSTED', {
    adjustmentReason: 'Nghỉ việc riêng được duyệt nửa ca — điều chỉnh còn 2.5 giờ.',
    regularHours: 2.5,
    estimatedAmount: Math.round((2.5 * 26000) / 1000) * 1000,
  }),
];

export default mockTimesheets;

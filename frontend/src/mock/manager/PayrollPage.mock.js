// File này chứa dữ liệu kỳ lương và bảng công từ dữ liệu chấm công của 30 nhân viên cho trang Tính lương.
export const mockPayrollPeriods = [
  { key: '2026-10', label: 'Tháng 10/2026 (01/10 – 31/10)' },
  { key: '2026-09', label: 'Tháng 09/2026 (01/09 – 30/09)' },
  { key: '2026-08', label: 'Tháng 08/2026 (01/08 – 31/08)' },
];

// Danh sách 30 nhân viên cùng đơn giá giờ và dữ liệu công chuẩn cho kỳ hiện tại (2026-10)
const BASE_EMPLOYEES_OCT = [
  { employeeId: 1, code: 'NV001', name: 'Nguyễn Văn An', role: 'Ca trưởng', employmentType: 'FULL_TIME', hourlyRate: 45000, reg: 95, ot: 10, pending: 0 },
  { employeeId: 2, code: 'NV002', name: 'Trần Thị Bích Ngọc', role: 'Ca trưởng', employmentType: 'FULL_TIME', hourlyRate: 45000, reg: 90, ot: 5, pending: 1 },
  { employeeId: 3, code: 'NV003', name: 'Lê Hoàng Nam', role: 'Ca trưởng', employmentType: 'FULL_TIME', hourlyRate: 42000, reg: 88, ot: 8, pending: 0 },
  { employeeId: 4, code: 'NV004', name: 'Phạm Minh Tuấn', role: 'Barista', employmentType: 'FULL_TIME', hourlyRate: 35000, reg: 92, ot: 6, pending: 0 },
  { employeeId: 5, code: 'NV005', name: 'Hoàng Thu Trang', role: 'Barista', employmentType: 'FULL_TIME', hourlyRate: 35000, reg: 85, ot: 4, pending: 1 },
  { employeeId: 6, code: 'NV006', name: 'Vũ Đức Thắng', role: 'Barista', employmentType: 'FULL_TIME', hourlyRate: 34000, reg: 86, ot: 5, pending: 0 },
  { employeeId: 7, code: 'NV007', name: 'Đặng Ngọc Mai', role: 'Barista', employmentType: 'PART_TIME', hourlyRate: 28000, reg: 55, ot: 5, pending: 0 },
  { employeeId: 8, code: 'NV008', name: 'Bùi Quốc Khánh', role: 'Barista', employmentType: 'PART_TIME', hourlyRate: 28000, reg: 50, ot: 4, pending: 1 },
  { employeeId: 9, code: 'NV009', name: 'Đỗ Thanh Tâm', role: 'Barista', employmentType: 'PART_TIME', hourlyRate: 28000, reg: 58, ot: 0, pending: 0 },
  { employeeId: 10, code: 'NV010', name: 'Ngô Gia Bảo', role: 'Barista', employmentType: 'PART_TIME', hourlyRate: 27000, reg: 48, ot: 6, pending: 0 },
  { employeeId: 11, code: 'NV011', name: 'Dương Mỹ Linh', role: 'Barista', employmentType: 'PART_TIME', hourlyRate: 27000, reg: 52, ot: 2, pending: 0 },
  { employeeId: 12, code: 'NV012', name: 'Lý Tuấn Kiệt', role: 'Barista', employmentType: 'PART_TIME', hourlyRate: 27000, reg: 45, ot: 5, pending: 1 },
  { employeeId: 13, code: 'NV013', name: 'Mai Phương Thúy', role: 'Thu ngân', employmentType: 'FULL_TIME', hourlyRate: 33000, reg: 90, ot: 4, pending: 0 },
  { employeeId: 14, code: 'NV014', name: 'Trương Đình Phong', role: 'Thu ngân', employmentType: 'FULL_TIME', hourlyRate: 33000, reg: 94, ot: 6, pending: 0 },
  { employeeId: 15, code: 'NV015', name: 'Đinh Hương Giang', role: 'Thu ngân', employmentType: 'PART_TIME', hourlyRate: 26000, reg: 54, ot: 4, pending: 0 },
  { employeeId: 16, code: 'NV016', name: 'Lâm Chí Công', role: 'Thu ngân', employmentType: 'PART_TIME', hourlyRate: 26000, reg: 46, ot: 0, pending: 1 },
  { employeeId: 17, code: 'NV017', name: 'Hà Kiều Anh', role: 'Thu ngân', employmentType: 'PART_TIME', hourlyRate: 26000, reg: 50, ot: 5, pending: 0 },
  { employeeId: 18, code: 'NV018', name: 'Trịnh Công Sơn', role: 'Thu ngân', employmentType: 'PART_TIME', hourlyRate: 26000, reg: 42, ot: 3, pending: 0 },
  { employeeId: 19, code: 'NV019', name: 'Lương Bích Hữu', role: 'Phục vụ', employmentType: 'FULL_TIME', hourlyRate: 30000, reg: 88, ot: 5, pending: 0 },
  { employeeId: 20, code: 'NV020', name: 'Cao Thái Sơn', role: 'Phục vụ', employmentType: 'FULL_TIME', hourlyRate: 30000, reg: 84, ot: 8, pending: 0 },
  { employeeId: 21, code: 'NV021', name: 'Phan Mạnh Quỳnh', role: 'Phục vụ', employmentType: 'PART_TIME', hourlyRate: 24000, reg: 50, ot: 4, pending: 1 },
  { employeeId: 22, code: 'NV022', name: 'Võ Hạ Trâm', role: 'Phục vụ', employmentType: 'PART_TIME', hourlyRate: 24000, reg: 48, ot: 2, pending: 0 },
  { employeeId: 23, code: 'NV023', name: 'Đoàn Văn Hậu', role: 'Phục vụ', employmentType: 'PART_TIME', hourlyRate: 24000, reg: 52, ot: 5, pending: 0 },
  { employeeId: 24, code: 'NV024', name: 'Nguyễn Quang Hải', role: 'Phục vụ', employmentType: 'PART_TIME', hourlyRate: 24000, reg: 45, ot: 3, pending: 0 },
  { employeeId: 25, code: 'NV025', name: 'Châu Bùi', role: 'Phục vụ', employmentType: 'PART_TIME', hourlyRate: 25000, reg: 56, ot: 4, pending: 0 },
  { employeeId: 26, code: 'NV026', name: 'Quách Ngọc Ngoan', role: 'Phục vụ', employmentType: 'PART_TIME', hourlyRate: 24000, reg: 40, ot: 0, pending: 1 },
  { employeeId: 27, code: 'NV027', name: 'Tạ Quang Thắng', role: 'Phục vụ', employmentType: 'PART_TIME', hourlyRate: 24000, reg: 47, ot: 5, pending: 0 },
  { employeeId: 28, code: 'NV028', name: 'Nghiêm Xuân Tú', role: 'Phục vụ', employmentType: 'PART_TIME', hourlyRate: 24000, reg: 38, ot: 2, pending: 0 },
  { employeeId: 29, code: 'NV029', name: 'Bạch Công Khanh', role: 'Phục vụ', employmentType: 'PART_TIME', hourlyRate: 24000, reg: 44, ot: 4, pending: 1 },
  { employeeId: 30, code: 'NV030', name: 'Kiều Minh Tuấn', role: 'Phục vụ', employmentType: 'PART_TIME', hourlyRate: 25000, reg: 50, ot: 5, pending: 0 },
];

// Hàm tạo danh sách timesheets chi tiết cho từng nhân viên theo hệ số kỳ lương
function buildPeriodRows(scaleRegular, scaleOt, includePending) {
  return BASE_EMPLOYEES_OCT.map((emp) => {
    const regularTotal = Math.round(emp.reg * scaleRegular * 2) / 2;
    const otTotal = Math.round(emp.ot * scaleOt * 2) / 2;
    const halfReg = Math.floor(regularTotal / 2);

    const timesheets = [
      { id: `${emp.employeeId}-ts-1`, regularHours: halfReg, overtimeHours: otTotal, status: 'APPROVED' },
      { id: `${emp.employeeId}-ts-2`, regularHours: regularTotal - halfReg, overtimeHours: 0, status: 'APPROVED' },
    ];

    if (includePending && emp.pending > 0) {
      timesheets.push({
        id: `${emp.employeeId}-ts-pending`,
        regularHours: 5,
        overtimeHours: 0,
        status: 'PENDING_APPROVAL',
      });
    }

    return {
      employeeId: emp.employeeId,
      code: emp.code,
      name: `${emp.code} - ${emp.name}`,
      role: emp.role,
      employmentType: emp.employmentType,
      hourlyRate: emp.hourlyRate,
      timesheets,
    };
  });
}

export const mockPayrollByPeriod = {
  '2026-10': buildPeriodRows(1, 1, true),
  '2026-09': buildPeriodRows(1.65, 1.4, false),
  '2026-08': buildPeriodRows(1.6, 1.2, false),
};
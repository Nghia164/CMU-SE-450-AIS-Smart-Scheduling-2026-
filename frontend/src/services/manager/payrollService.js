// File này cung cấp dịch vụ truy xuất danh sách kỳ lương và dữ liệu lương tính từ chấm công của 30 nhân viên.
import { mockPayrollByPeriod, mockPayrollPeriods } from '../../mock/manager/PayrollPage.mock.js';

// Hàm này lấy danh sách các kỳ lương để hiển thị trong bộ chọn.
export async function getPayrollPeriods() {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return structuredClone(mockPayrollPeriods);
}

// Hàm này lấy bảng dữ liệu lương và giờ công của 30 nhân viên theo kỳ được chọn.
export async function getPayroll(periodKey) {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const rows = mockPayrollByPeriod[periodKey] ?? mockPayrollByPeriod['2026-10'] ?? [];
  return structuredClone(rows);
}
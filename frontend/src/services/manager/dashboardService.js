// File này cung cấp các hàm lấy dữ liệu thống kê tổng quan cho trang Dashboard của Manager.
import { mockDashboardData } from '../../mock/manager/DashboardPage.mock.js';

// Hàm này lấy toàn bộ số liệu thống kê, biểu đồ và lịch làm việc tuần cho trang Tổng quan.
export async function getDashboardStats() {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return structuredClone(mockDashboardData);
}
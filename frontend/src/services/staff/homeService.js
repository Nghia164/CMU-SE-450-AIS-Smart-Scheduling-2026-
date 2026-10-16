// ============================================================
// SERVICE: Trang chủ Staff — giả lập API với setTimeout
// ============================================================
import {
  mockNextShift,
  mockMyStats,
  mockNotifications,
  mockQuickActions,
} from '../../mock/staff/HomePage.mock.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Dữ liệu tổng hợp trang chủ: ca tiếp theo + thống kê + thông báo
export async function getHomeData() {
  await delay(400);
  return {
    nextShift: structuredClone(mockNextShift),
    myStats: structuredClone(mockMyStats),
    notifications: structuredClone(mockNotifications),
    quickActions: structuredClone(mockQuickActions),
  };
}

// Đánh dấu 1 thông báo đã đọc
export async function markNotificationRead(id) {
  await delay(200);
  return id;
}

export default { getHomeData, markNotificationRead };

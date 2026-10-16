// ============================================================
// MOCK: Trang chủ Staff — ca tiếp theo, thống kê tuần, thông báo
// Bám schema: schedule_assignments, notifications
// ============================================================

// Ca làm tiếp theo của nhân viên mẫu (dùng "Nhân viên mẫu" khớp AuthContext)
export const mockNextShift = {
  id: 901,
  shiftName: 'Ca chiều',
  date: '2026-10-15',
  startTime: '12:00',
  endTime: '17:00',
  position: 'Phục vụ',
  store: 'STORE-01 · Quận 1',
  checkInWindow: '11:45–12:15',
  status: 'ASSIGNED',
};

export const mockMyStats = {
  hoursThisWeek: 24,
  shiftsThisWeek: 4,
  pendingRequests: 1,
  approvedLeave: 2,
};

// Thông báo: 12 bản ghi, 4 chưa đọc
export const mockNotifications = [
  { id: 1, type: 'OPEN_SHIFT', title: 'Ca mở mới khớp với bạn', message: 'Ca tối 17/10 (Barista, phụ cấp 30k/giờ) vừa được mở — ai nhanh tay người đó được.', isRead: false, createdAt: '2026-10-14 21:40' },
  { id: 2, type: 'SCHEDULE', title: 'Lịch tuần 43 đã xuất bản', message: 'Lịch làm việc tuần 20–26/10/2026 đã được xuất bản. Vào "Lịch làm của tôi" để xác nhận ca.', isRead: false, createdAt: '2026-10-14 18:00' },
  { id: 3, type: 'SHIFT_SWAP', title: 'Đồng nghiệp muốn đổi ca', message: 'Trần Thị Bích muốn đổi ca sáng 16/10 lấy ca chiều 17/10 của bạn.', isRead: false, createdAt: '2026-10-14 15:22' },
  { id: 4, type: 'LEAVE', title: 'Đơn nghỉ phép đã được duyệt', message: 'Đơn nghỉ phép năm 20/10 của bạn đã được quản lý duyệt.', isRead: false, createdAt: '2026-10-14 09:10' },
  { id: 5, type: 'ATTENDANCE', title: 'Cảnh báo thiếu check-out', message: 'Ca chiều 13/10 của bạn thiếu check-out. Quản lý đã sửa giờ theo camera.', isRead: true, createdAt: '2026-10-13 22:30' },
  { id: 6, type: 'SCHEDULE', title: 'Ca của bạn được xác nhận', message: 'Ca sáng 14/10 đã chuyển sang trạng thái "Đã xác nhận".', isRead: true, createdAt: '2026-10-13 11:05' },
  { id: 7, type: 'TIMESHEET', title: 'Bảng công chờ duyệt', message: 'Giờ công tuần 41 của bạn đã được tổng hợp, chờ quản lý duyệt.', isRead: true, createdAt: '2026-10-12 19:45' },
  { id: 8, type: 'OPEN_SHIFT', title: 'Ca mở bạn nhận đã đủ người', message: 'Ca sáng 12/10 đã đủ người — cảm ơn bạn đã quan tâm.', isRead: true, createdAt: '2026-10-11 08:00' },
  { id: 9, type: 'SYSTEM', title: 'Bảo trì hệ thống', message: 'Hệ thống bảo trì từ 23:00 đến 23:30 ngày 15/10. Chức năng chấm công có thể gián đoạn.', isRead: true, createdAt: '2026-10-10 16:20' },
  { id: 10, type: 'SCHEDULE', title: 'Nhắc hạn đăng ký lịch rảnh', message: 'Hạn đăng ký lịch rảnh cho tuần 43: Chủ nhật 20/10 trước 22:00.', isRead: true, createdAt: '2026-10-10 09:00' },
  { id: 11, type: 'LEAVE', title: 'Đơn xin nghỉ bị từ chối', message: 'Đơn nghỉ việc riêng 05/10 bị từ chối do thiếu người ca tối. Chi tiết trong "Xin nghỉ phép".', isRead: true, createdAt: '2026-10-09 14:15' },
  { id: 12, type: 'SYSTEM', title: 'Chào mừng bạn!', message: 'Chào mừng đến Smart Scheduling. Đổi mật khẩu lần đầu trong Hồ sơ cá nhân.', isRead: true, createdAt: '2026-10-01 08:00' },
];

// Hành động nhanh trên trang chủ
export const mockQuickActions = [
  { id: 1, label: 'Chấm công', path: '/staff/attendance', icon: 'mapPin' },
  { id: 2, label: 'Nhận ca mở', path: '/staff/open-shifts', icon: 'plus' },
  { id: 3, label: 'Đổi ca', path: '/staff/swap', icon: 'swap' },
  { id: 4, label: 'Xin nghỉ', path: '/staff/leave', icon: 'minusCircle' },
];

export default { mockNextShift, mockMyStats, mockNotifications, mockQuickActions };

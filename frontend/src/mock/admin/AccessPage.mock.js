// ============================================================
// MOCK DATA — Task 3.2 AccessPage (Phân quyền truy cập theo Role)
// Bám schema: bảng `users` (role) + bảng `audit_logs` (lịch sử thay đổi quyền).
// 3 vai trò, 16 quyền chia theo nhóm, 10 bản ghi nhật ký gần nhất.
// ============================================================

export const roles = [
  {
    id: 'ADMIN',
    name: 'Quản trị hệ thống',
    desc: 'Toàn quyền quản lý tài khoản, phân quyền, cấu hình và giám sát hạ tầng.',
    memberCount: 2,
    color: 'amber',
  },
  {
    id: 'MANAGER',
    name: 'Quản lý cửa hàng',
    desc: 'Điều hành xếp lịch, duyệt nghỉ/đổi ca, chấm công và bảng công của cửa hàng.',
    memberCount: 1,
    color: 'matcha',
  },
  {
    id: 'STAFF',
    name: 'Nhân viên cửa hàng',
    desc: 'Xem lịch làm việc, đăng ký lịch rảnh, nhận ca mở và chấm công GPS.',
    memberCount: 18,
    color: 'muted',
  },
];

// 16 quyền — grants: quyền được cấp cho từng vai trò
export const permissions = [
  // Nhóm Tài khoản
  { id: 'view_employees', group: 'Tài khoản', name: 'Xem danh sách nhân viên', grants: { ADMIN: true, MANAGER: true, STAFF: true } },
  { id: 'manage_employees', group: 'Tài khoản', name: 'Tạo/sửa nhân viên', grants: { ADMIN: true, MANAGER: true, STAFF: false } },
  { id: 'manage_accounts', group: 'Tài khoản', name: 'Quản lý tài khoản', grants: { ADMIN: true, MANAGER: false, STAFF: false } },
  { id: 'manage_roles', group: 'Tài khoản', name: 'Phân quyền', grants: { ADMIN: true, MANAGER: false, STAFF: false } },

  // Nhóm Lịch làm
  { id: 'view_schedule', group: 'Lịch làm', name: 'Xem lịch làm việc', grants: { ADMIN: true, MANAGER: true, STAFF: true } },
  { id: 'auto_schedule', group: 'Lịch làm', name: 'Xếp lịch', grants: { ADMIN: true, MANAGER: true, STAFF: false } },
  { id: 'publish_schedule', group: 'Lịch làm', name: 'Xuất bản lịch', grants: { ADMIN: true, MANAGER: true, STAFF: false } },
  { id: 'approve_requests', group: 'Lịch làm', name: 'Duyệt nghỉ/đổi ca', grants: { ADMIN: true, MANAGER: true, STAFF: false } },
  { id: 'create_open_shift', group: 'Lịch làm', name: 'Tạo ca mở', grants: { ADMIN: true, MANAGER: true, STAFF: false } },

  // Nhóm Chấm công
  { id: 'checkin_gps', group: 'Chấm công', name: 'Check-in/out GPS', grants: { ADMIN: false, MANAGER: true, STAFF: true } },
  { id: 'edit_attendance', group: 'Chấm công', name: 'Sửa giờ chấm công', grants: { ADMIN: true, MANAGER: true, STAFF: false } },

  // Nhóm Bảng công
  { id: 'view_timesheet', group: 'Bảng công', name: 'Xem bảng công', grants: { ADMIN: true, MANAGER: true, STAFF: true } },
  { id: 'approve_timesheet', group: 'Bảng công', name: 'Duyệt bảng công', grants: { ADMIN: true, MANAGER: true, STAFF: false } },

  // Nhóm Báo cáo
  { id: 'export_report', group: 'Báo cáo', name: 'Xuất báo cáo', grants: { ADMIN: true, MANAGER: true, STAFF: false } },

  // Nhóm Hệ thống
  { id: 'system_settings', group: 'Hệ thống', name: 'Cấu hình hệ thống', grants: { ADMIN: true, MANAGER: false, STAFF: false } },
  { id: 'view_health', group: 'Hệ thống', name: 'Xem trạng thái dịch vụ', grants: { ADMIN: true, MANAGER: false, STAFF: false } },
];

// 10 bản ghi thay đổi gần đây (bảng audit_logs)
export const auditLog = [
  { id: 1, actor: 'Nguyễn Văn An', action: 'Cấp quyền Duyệt nghỉ/đổi ca cho MANAGER', at: '2026-10-13T16:42:00' },
  { id: 2, actor: 'Nguyễn Văn An', action: 'Vô hiệu hóa tài khoản: dangminhgiang', at: '2026-10-13T15:08:00' },
  { id: 3, actor: 'Lê Minh Châu', action: 'Cấu hình hệ thống: Bán kính Geofence 200m → 100m', at: '2026-10-12T10:26:00' },
  { id: 4, actor: 'Nguyễn Văn An', action: 'Đặt lại mật khẩu cho: hoangvanem', at: '2026-10-11T09:14:00' },
  { id: 5, actor: 'Lê Minh Châu', action: 'Gỡ quyền Xuất báo cáo khỏi STAFF', at: '2026-10-09T14:51:00' },
  { id: 6, actor: 'Nguyễn Văn An', action: 'Tạo tài khoản mới: vuongkhanhlinh (STAFF)', at: '2026-10-08T11:37:00' },
  { id: 7, actor: 'Nguyễn Văn An', action: 'Khóa tài khoản: duongthikhanh', at: '2026-10-06T17:03:00' },
  { id: 8, actor: 'Lê Minh Châu', action: 'Kích hoạt lại tài khoản: phanquoccuong', at: '2026-10-04T08:29:00' },
  { id: 9, actor: 'Nguyễn Văn An', action: 'Cấp quyền Sửa giờ chấm công cho MANAGER', at: '2026-09-30T10:44:00' },
  { id: 10, actor: 'Lê Minh Châu', action: 'Gỡ quyền Cấu hình hệ thống khỏi MANAGER', at: '2026-09-26T15:19:00' },
];

export default { roles, permissions, auditLog };

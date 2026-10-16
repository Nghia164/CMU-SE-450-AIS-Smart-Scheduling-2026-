// ============================================================
// MOCK DATA — Task 3.4 SettingsPage (Cài đặt hệ thống)
// Bám schema bảng `dbo.system_settings` (setting_key, setting_value, description)
// + lịch sử thay đổi cấu hình (audit_logs).
// Giá trị lưu dạng chuỗi ('100', 'SUNDAY', 'true') như trong DB.
// ============================================================

// 10 cấu hình hệ thống
export const settings = [
  {
    key: 'store.geofence_radius_m',
    value: '100',
    label: 'Bán kính Geofence chấm công (m)',
    type: 'number',
    min: 50,
    max: 500,
    step: 1,
    desc: 'Nhân viên chỉ check-in được khi ở trong bán kính này quanh cửa hàng',
    group: 'Chấm công',
  },
  {
    key: 'store.max_gps_accuracy_m',
    value: '50',
    label: 'Độ chính xác GPS tối đa (m)',
    type: 'number',
    min: 10,
    max: 200,
    step: 1,
    desc: 'Từ chối điểm danh nếu sai số GPS của thiết bị vượt ngưỡng này',
    group: 'Chấm công',
  },
  {
    key: 'attendance.grace_minutes',
    value: '5',
    label: 'Phút grace trước khi tính đi trễ',
    type: 'number',
    min: 0,
    max: 30,
    step: 1,
    desc: 'Số phút vào muộn được chấp nhận trước khi ghi nhận trạng thái LATE',
    group: 'Chấm công',
  },
  {
    key: 'availability.deadline_day',
    value: 'SUNDAY',
    label: 'Hạn nộp lịch rảnh (ngày)',
    type: 'select',
    options: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
    desc: 'Nhân viên phải gửi lịch rảnh cho tuần kế tiếp trước ngày này',
    group: 'Xếp lịch',
  },
  {
    key: 'availability.deadline_time',
    value: '22:00',
    label: 'Giờ hạn nộp',
    type: 'time',
    desc: 'Mốc giờ chốt nhận lịch rảnh trong ngày hạn nộp',
    group: 'Xếp lịch',
  },
  {
    key: 'schedule.publish_lock_hours',
    value: '24',
    label: 'Khóa sửa lịch trước giờ xuất bản (giờ)',
    type: 'number',
    min: 0,
    max: 72,
    step: 1,
    desc: 'Không cho phép sửa/xóa phân công trong X giờ trước khi ca bắt đầu',
    group: 'Xếp lịch',
  },
  {
    key: 'scheduling.max_solve_seconds',
    value: '15',
    label: 'Thời gian giải tối đa (giây)',
    type: 'number',
    min: 5,
    max: 60,
    step: 1,
    desc: 'Giới hạn thời gian chạy bộ giải OR-Tools cho mỗi lần xếp lịch',
    group: 'Bộ giải',
  },
  {
    key: 'payroll.overtime_multiplier',
    value: '1.5',
    label: 'Hệ số lương tăng ca',
    type: 'number',
    min: 1,
    max: 3,
    step: 0.1,
    desc: 'Lương giờ tăng ca = lương giờ cơ bản × hệ số này',
    group: 'Lương',
  },
  {
    key: 'payroll.cycle_day',
    value: '1',
    label: 'Ngày bắt đầu chu kỳ lương',
    type: 'number',
    min: 1,
    max: 28,
    step: 1,
    desc: 'Ngày bắt đầu kỳ tính lương hằng tháng (1 – 28)',
    group: 'Lương',
  },
  {
    key: 'notifications.enabled',
    value: 'true',
    label: 'Bật thông báo đẩy',
    type: 'toggle',
    desc: 'Gửi thông báo lịch mới, ca mở, duyệt nghỉ tới ứng dụng nhân viên',
    group: 'Hệ thống',
  },
];

// Giá trị mặc định cho chức năng "Khôi phục mặc định"
export const defaultValues = {
  'store.geofence_radius_m': '100',
  'store.max_gps_accuracy_m': '50',
  'attendance.grace_minutes': '5',
  'availability.deadline_day': 'SUNDAY',
  'availability.deadline_time': '22:00',
  'schedule.publish_lock_hours': '24',
  'scheduling.max_solve_seconds': '15',
  'payroll.overtime_multiplier': '1.5',
  'payroll.cycle_day': '1',
  'notifications.enabled': 'true',
};

// 8 bản ghi thay đổi cấu hình gần đây
export const changeLog = [
  { id: 1, actor: 'Lê Minh Châu', key: 'scheduling.max_solve_seconds', oldValue: '10', newValue: '15', at: '2026-10-10T16:20:00' },
  { id: 2, actor: 'Nguyễn Văn An', key: 'store.geofence_radius_m', oldValue: '200', newValue: '100', at: '2026-10-08T09:45:00' },
  { id: 3, actor: 'Nguyễn Văn An', key: 'availability.deadline_day', oldValue: 'SATURDAY', newValue: 'SUNDAY', at: '2026-09-30T11:02:00' },
  { id: 4, actor: 'Lê Minh Châu', key: 'payroll.overtime_multiplier', oldValue: '2', newValue: '1.5', at: '2026-09-25T14:37:00' },
  { id: 5, actor: 'Nguyễn Văn An', key: 'attendance.grace_minutes', oldValue: '10', newValue: '5', at: '2026-09-18T08:12:00' },
  { id: 6, actor: 'Nguyễn Văn An', key: 'notifications.enabled', oldValue: 'false', newValue: 'true', at: '2026-09-10T10:30:00' },
  { id: 7, actor: 'Lê Minh Châu', key: 'store.max_gps_accuracy_m', oldValue: '30', newValue: '50', at: '2026-09-05T15:55:00' },
  { id: 8, actor: 'Nguyễn Văn An', key: 'schedule.publish_lock_hours', oldValue: '12', newValue: '24', at: '2026-08-28T13:08:00' },
];

export default { settings, defaultValues, changeLog };

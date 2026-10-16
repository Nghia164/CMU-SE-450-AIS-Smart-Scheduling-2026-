// ============================================================
// MOCK: Đăng ký lịch rảnh (Staff) — bám schema dbo.availability_entries
// Khung giờ mẫu theo operating_hours: Sáng/Chiều/Tối/Tối muộn
// ============================================================

export const DAY_OPTIONS = [
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
  { value: 7, label: 'Chủ nhật' },
];

export const SLOT_OPTIONS = [
  { value: '07:00–12:00', label: 'Sáng · 07:00–12:00' },
  { value: '12:00–17:00', label: 'Chiều · 12:00–17:00' },
  { value: '17:00–22:00', label: 'Tối · 17:00–22:00' },
  { value: '22:00–00:00', label: 'Tối muộn · 22:00–00:00' },
];

// Thông tin hạn nộp cho kỳ tiếp theo
export const mockDeadlineInfo = {
  deadlineDay: 'Chủ nhật',
  deadlineTime: '22:00',
  nextPeriod: 'Tuần 43 · 20/10–26/10',
};

// 12 khung giờ đã đăng ký sẵn
export const mockAvailabilityEntries = [
  { id: 1, dayOfWeek: 1, startTime: '07:00', endTime: '12:00', type: 'AVAILABLE', note: '' },
  { id: 2, dayOfWeek: 1, startTime: '17:00', endTime: '22:00', type: 'AVAILABLE', note: '' },
  { id: 3, dayOfWeek: 2, startTime: '12:00', endTime: '17:00', type: 'AVAILABLE', note: 'Ưu tiên ca chiều' },
  { id: 4, dayOfWeek: 3, startTime: '07:00', endTime: '12:00', type: 'AVAILABLE', note: '' },
  { id: 5, dayOfWeek: 3, startTime: '17:00', endTime: '22:00', type: 'UNAVAILABLE', note: 'Học buổi tối' },
  { id: 6, dayOfWeek: 4, startTime: '12:00', endTime: '17:00', type: 'AVAILABLE', note: '' },
  { id: 7, dayOfWeek: 5, startTime: '07:00', endTime: '12:00', type: 'AVAILABLE', note: '' },
  { id: 8, dayOfWeek: 5, startTime: '12:00', endTime: '17:00', type: 'AVAILABLE', note: '' },
  { id: 9, dayOfWeek: 6, startTime: '07:00', endTime: '12:00', type: 'UNAVAILABLE', note: 'Việc gia đình định kỳ' },
  { id: 10, dayOfWeek: 6, startTime: '17:00', endTime: '22:00', type: 'AVAILABLE', note: '' },
  { id: 11, dayOfWeek: 7, startTime: '12:00', endTime: '17:00', type: 'AVAILABLE', note: '' },
  { id: 12, dayOfWeek: 7, startTime: '17:00', endTime: '22:00', type: 'AVAILABLE', note: 'Chấp nhận nhận thêm' },
];

export default { mockAvailabilityEntries, mockDeadlineInfo, DAY_OPTIONS, SLOT_OPTIONS };

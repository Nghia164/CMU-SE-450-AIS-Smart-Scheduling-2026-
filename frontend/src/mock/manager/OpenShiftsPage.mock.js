// ============================================================
// MOCK: Quản lý ca mở (Manager) — bám schema dbo.open_shifts
// Tuần phủ: 14/10/2026 → 25/10/2026
// Mỗi ca mở gắn shift_requirement (vị trí + kỹ năng + số người)
// ============================================================

export const STATUS_LABELS = {
  OPEN: 'Đang mở',
  CLAIMED: 'Đã nhận',
  CLOSED: 'Đã đóng',
};

// Bộ tên nhân viên dùng chung toàn dự án
const NV = [
  'Nguyễn Văn An', 'Trần Thị Bích', 'Lê Hoàng Cường', 'Phạm Thu Dung', 'Hoàng Văn Em',
  'Vũ Ngọc Phương', 'Đặng Minh Giang', 'Bùi Thanh Hà', 'Ngô Đức Anh', 'Dương Thị Khanh',
  'Lý Thành Long', 'Trịnh Bảo Mai', 'Phan Quốc Cường', 'Hà Kim Trang', 'Đỗ Trung Kiên',
  'Võ Thị Hồng Nhung', 'Bùi Gia Huy', 'Phạm Mỹ Linh', 'Tạ Văn Tùng', 'Chu Ngọc Diệp',
];

// Sinh ứng viên cho một ca: {id, name, position, skillLevel, available, skillOk, reasons}
function makeCandidates(seed, shiftPosition, shiftSkill, minLevel) {
  const roster = [
    { name: NV[seed % 20], skillLevel: minLevel + 1, available: true, skillOk: true, reasons: ['Đã đăng ký rảnh khung giờ này'] },
    { name: NV[(seed + 3) % 20], skillLevel: minLevel, available: true, skillOk: true, reasons: ['Kỹ năng đạt yêu cầu', 'Tuần này còn thiếu 12 giờ'] },
    { name: NV[(seed + 7) % 20], skillLevel: minLevel + 2, available: true, skillOk: true, reasons: ['Kỹ năng vượt yêu cầu', 'Không trùng ca liền kề'] },
    { name: NV[(seed + 11) % 20], skillLevel: Math.max(1, minLevel - 1), available: true, skillOk: false, reasons: [`Cấp kỹ năng ${Math.max(1, minLevel - 1)} chưa đạt ${minLevel}`] },
    { name: NV[(seed + 15) % 20], skillLevel: minLevel + 1, available: false, skillOk: true, reasons: ['Không đăng ký rảnh khung giờ này'] },
    { name: NV[(seed + 18) % 20], skillLevel: minLevel, available: false, skillOk: false, reasons: ['Đã có ca trùng giờ', 'Chưa đạt kỹ năng yêu cầu'] },
  ];
  return roster.map((c, i) => ({ id: seed * 10 + i, position: shiftPosition, skillName: shiftSkill, ...c }));
}

// 26 ca mở: 16 OPEN, 6 CLAIMED, 4 CLOSED
export const mockOpenShifts = [
  {
    id: 1, shiftName: 'Ca sáng', workDate: '2026-10-15', timeRange: '07:00–12:00',
    position: 'Barista', skillRequired: 'Chế biến cà phê', minSkillLevel: 3,
    requiredHeadcount: 2, filledCount: 1, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: null, createdAt: '2026-10-13 09:12',
    note: 'Thiếu 1 Barista do An nghỉ phép.',
    candidates: makeCandidates(1, 'Barista', 'Chế biến cà phê', 3),
  },
  {
    id: 2, shiftName: 'Ca chiều', workDate: '2026-10-15', timeRange: '12:00–17:00',
    position: 'Phục vụ', skillRequired: 'Chăm sóc khách hàng', minSkillLevel: 2,
    requiredHeadcount: 2, filledCount: 0, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: null, createdAt: '2026-10-13 09:20',
    note: '',
    candidates: makeCandidates(2, 'Phục vụ', 'Chăm sóc khách hàng', 2),
  },
  {
    id: 3, shiftName: 'Ca tối', workDate: '2026-10-15', timeRange: '17:00–22:00',
    position: 'Thu ngân', skillRequired: 'Thu ngân', minSkillLevel: 3,
    requiredHeadcount: 1, filledCount: 0, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: 'Phụ cấp 20k/giờ ca tối', createdAt: '2026-10-13 10:05',
    note: 'Cuối tuần lượng khách cao.',
    candidates: makeCandidates(3, 'Thu ngân', 'Thu ngân', 3),
  },
  {
    id: 4, shiftName: 'Ca sáng', workDate: '2026-10-16', timeRange: '07:00–12:00',
    position: 'Bếp phụ', skillRequired: 'Chế biến đồ ăn', minSkillLevel: 2,
    requiredHeadcount: 2, filledCount: 1, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: null, createdAt: '2026-10-13 11:00',
    note: '',
    candidates: makeCandidates(4, 'Bếp phụ', 'Chế biến đồ ăn', 2),
  },
  {
    id: 5, shiftName: 'Ca chiều', workDate: '2026-10-16', timeRange: '12:00–17:00',
    position: 'Barista', skillRequired: 'Chế biến cà phê', minSkillLevel: 3,
    requiredHeadcount: 1, filledCount: 0, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: null, createdAt: '2026-10-13 11:15',
    note: '',
    candidates: makeCandidates(5, 'Barista', 'Chế biến cà phê', 3),
  },
  {
    id: 6, shiftName: 'Ca tối', workDate: '2026-10-16', timeRange: '17:00–22:00',
    position: 'Phục vụ', skillRequired: 'Chăm sóc khách hàng', minSkillLevel: 2,
    requiredHeadcount: 3, filledCount: 1, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: 'Phụ cấp 30k/giờ ca cuối tuần', createdAt: '2026-10-13 13:40',
    note: 'Thứ 7 đông khách, cần tăng cường.',
    candidates: makeCandidates(6, 'Phục vụ', 'Chăm sóc khách hàng', 2),
  },
  {
    id: 7, shiftName: 'Ca sáng', workDate: '2026-10-17', timeRange: '07:00–12:00',
    position: 'Phục vụ', skillRequired: 'Chăm sóc khách hàng', minSkillLevel: 2,
    requiredHeadcount: 2, filledCount: 0, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: 'Phụ cấp 25k/giờ ca cuối tuần', createdAt: '2026-10-13 14:00',
    note: '',
    candidates: makeCandidates(7, 'Phục vụ', 'Chăm sóc khách hàng', 2),
  },
  {
    id: 8, shiftName: 'Ca chiều', workDate: '2026-10-17', timeRange: '12:00–17:00',
    position: 'Thu ngân', skillRequired: 'Thu ngân', minSkillLevel: 3,
    requiredHeadcount: 1, filledCount: 0, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: 'Phụ cấp 25k/giờ ca cuối tuần', createdAt: '2026-10-13 14:22',
    note: '',
    candidates: makeCandidates(8, 'Thu ngân', 'Thu ngân', 3),
  },
  {
    id: 9, shiftName: 'Ca tối', workDate: '2026-10-17', timeRange: '17:00–22:00',
    position: 'Barista', skillRequired: 'Chế biến cà phê', minSkillLevel: 4,
    requiredHeadcount: 1, filledCount: 0, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: 'Phụ cấp 30k/giờ + thưởng doanh số', createdAt: '2026-10-13 15:10',
    note: 'Cần Barista cấp cao phụ trách khu espresso cuối tuần.',
    candidates: makeCandidates(9, 'Barista', 'Chế biến cà phê', 4),
  },
  {
    id: 10, shiftName: 'Ca sáng', workDate: '2026-10-18', timeRange: '07:00–12:00',
    position: 'Bếp phụ', skillRequired: 'Chế biến đồ ăn', minSkillLevel: 2,
    requiredHeadcount: 1, filledCount: 0, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: null, createdAt: '2026-10-13 15:30',
    note: 'CN buổi sáng có brunch.',
    candidates: makeCandidates(10, 'Bếp phụ', 'Chế biến đồ ăn', 2),
  },
  {
    id: 11, shiftName: 'Ca tối', workDate: '2026-10-18', timeRange: '17:00–22:00',
    position: 'Phục vụ', skillRequired: 'Chăm sóc khách hàng', minSkillLevel: 2,
    requiredHeadcount: 2, filledCount: 1, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: null, createdAt: '2026-10-13 16:00',
    note: '',
    candidates: makeCandidates(11, 'Phục vụ', 'Chăm sóc khách hàng', 2),
  },
  {
    id: 12, shiftName: 'Ca sáng', workDate: '2026-10-19', timeRange: '07:00–12:00',
    position: 'Barista', skillRequired: 'Chế biến cà phê', minSkillLevel: 3,
    requiredHeadcount: 2, filledCount: 0, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: null, createdAt: '2026-10-14 08:00',
    note: 'Đầu tuần thiếu người thường xuyên.',
    candidates: makeCandidates(12, 'Barista', 'Chế biến cà phê', 3),
  },
  {
    id: 13, shiftName: 'Ca chiều', workDate: '2026-10-20', timeRange: '12:00–17:00',
    position: 'Phục vụ', skillRequired: 'Chăm sóc khách hàng', minSkillLevel: 2,
    requiredHeadcount: 1, filledCount: 0, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: null, createdAt: '2026-10-14 08:30',
    note: '',
    candidates: makeCandidates(13, 'Phục vụ', 'Chăm sóc khách hàng', 2),
  },
  {
    id: 14, shiftName: 'Ca tối', workDate: '2026-10-21', timeRange: '17:00–22:00',
    position: 'Thu ngân', skillRequired: 'Thu ngân', minSkillLevel: 3,
    requiredHeadcount: 1, filledCount: 0, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: null, createdAt: '2026-10-14 09:00',
    note: '',
    candidates: makeCandidates(14, 'Thu ngân', 'Thu ngân', 3),
  },
  {
    id: 15, shiftName: 'Ca sáng', workDate: '2026-10-22', timeRange: '07:00–12:00',
    position: 'Phục vụ', skillRequired: 'Chăm sóc khách hàng', minSkillLevel: 2,
    requiredHeadcount: 2, filledCount: 1, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: null, createdAt: '2026-10-14 09:40',
    note: '',
    candidates: makeCandidates(15, 'Phục vụ', 'Chăm sóc khách hàng', 2),
  },
  {
    id: 16, shiftName: 'Ca chiều', workDate: '2026-10-23', timeRange: '12:00–17:00',
    position: 'Barista', skillRequired: 'Chế biến cà phê', minSkillLevel: 3,
    requiredHeadcount: 1, filledCount: 0, status: 'OPEN',
    claimedBy: null, claimedAt: null, bonusNote: 'Phụ cấp 30k/giờ ca cuối tuần', createdAt: '2026-10-14 10:00',
    note: '',
    candidates: makeCandidates(16, 'Barista', 'Chế biến cà phê', 3),
  },
  // ---------- Đã nhận ----------
  {
    id: 17, shiftName: 'Ca tối', workDate: '2026-10-14', timeRange: '17:00–22:00',
    position: 'Phục vụ', skillRequired: 'Chăm sóc khách hàng', minSkillLevel: 2,
    requiredHeadcount: 2, filledCount: 2, status: 'CLAIMED',
    claimedBy: 'Lý Thành Long', claimedAt: '2026-10-13 20:15', bonusNote: null, createdAt: '2026-10-13 08:00',
    note: 'Đã đủ người.',
    candidates: makeCandidates(17, 'Phục vụ', 'Chăm sóc khách hàng', 2),
  },
  {
    id: 18, shiftName: 'Ca sáng', workDate: '2026-10-14', timeRange: '07:00–12:00',
    position: 'Barista', skillRequired: 'Chế biến cà phê', minSkillLevel: 3,
    requiredHeadcount: 1, filledCount: 1, status: 'CLAIMED',
    claimedBy: 'Trịnh Bảo Mai', claimedAt: '2026-10-13 07:44', bonusNote: null, createdAt: '2026-10-12 18:30',
    note: '',
    candidates: makeCandidates(18, 'Barista', 'Chế biến cà phê', 3),
  },
  {
    id: 19, shiftName: 'Ca chiều', workDate: '2026-10-14', timeRange: '12:00–17:00',
    position: 'Thu ngân', skillRequired: 'Thu ngân', minSkillLevel: 3,
    requiredHeadcount: 1, filledCount: 1, status: 'CLAIMED',
    claimedBy: 'Hà Kim Trang', claimedAt: '2026-10-13 12:02', bonusNote: null, createdAt: '2026-10-12 19:00',
    note: '',
    candidates: makeCandidates(19, 'Thu ngân', 'Thu ngân', 3),
  },
  {
    id: 20, shiftName: 'Ca tối', workDate: '2026-10-16', timeRange: '17:00–22:00',
    position: 'Bếp phụ', skillRequired: 'Chế biến đồ ăn', minSkillLevel: 2,
    requiredHeadcount: 1, filledCount: 1, status: 'CLAIMED',
    claimedBy: 'Tạ Văn Tùng', claimedAt: '2026-10-14 06:50', bonusNote: 'Phụ cấp 30k/giờ ca cuối tuần', createdAt: '2026-10-13 17:00',
    note: '',
    candidates: makeCandidates(20, 'Bếp phụ', 'Chế biến đồ ăn', 2),
  },
  {
    id: 21, shiftName: 'Ca sáng', workDate: '2026-10-19', timeRange: '07:00–12:00',
    position: 'Thu ngân', skillRequired: 'Thu ngân', minSkillLevel: 3,
    requiredHeadcount: 1, filledCount: 1, status: 'CLAIMED',
    claimedBy: 'Chu Ngọc Diệp', claimedAt: '2026-10-14 07:30', bonusNote: null, createdAt: '2026-10-13 21:00',
    note: '',
    candidates: makeCandidates(21, 'Thu ngân', 'Thu ngân', 3),
  },
  {
    id: 22, shiftName: 'Ca chiều', workDate: '2026-10-19', timeRange: '12:00–17:00',
    position: 'Phục vụ', skillRequired: 'Chăm sóc khách hàng', minSkillLevel: 2,
    requiredHeadcount: 1, filledCount: 1, status: 'CLAIMED',
    claimedBy: 'Bùi Gia Huy', claimedAt: '2026-10-14 08:05', bonusNote: null, createdAt: '2026-10-13 21:10',
    note: '',
    candidates: makeCandidates(22, 'Phục vụ', 'Chăm sóc khách hàng', 2),
  },
  // ---------- Đã đóng ----------
  {
    id: 23, shiftName: 'Ca tối', workDate: '2026-10-13', timeRange: '17:00–22:00',
    position: 'Phục vụ', skillRequired: 'Chăm sóc khách hàng', minSkillLevel: 2,
    requiredHeadcount: 2, filledCount: 2, status: 'CLOSED',
    claimedBy: 'Phan Quốc Cường', claimedAt: '2026-10-12 09:00', bonusNote: null, createdAt: '2026-10-11 15:00',
    note: 'Đóng sau khi đủ người.',
    candidates: makeCandidates(23, 'Phục vụ', 'Chăm sóc khách hàng', 2),
  },
  {
    id: 24, shiftName: 'Ca sáng', workDate: '2026-10-13', timeRange: '07:00–12:00',
    position: 'Bếp phụ', skillRequired: 'Chế biến đồ ăn', minSkillLevel: 2,
    requiredHeadcount: 1, filledCount: 1, status: 'CLOSED',
    claimedBy: 'Đỗ Trung Kiên', claimedAt: '2026-10-12 10:20', bonusNote: null, createdAt: '2026-10-11 16:00',
    note: '',
    candidates: makeCandidates(24, 'Bếp phụ', 'Chế biến đồ ăn', 2),
  },
  {
    id: 25, shiftName: 'Ca chiều', workDate: '2026-10-13', timeRange: '12:00–17:00',
    position: 'Barista', skillRequired: 'Chế biến cà phê', minSkillLevel: 3,
    requiredHeadcount: 1, filledCount: 0, status: 'CLOSED',
    claimedBy: null, claimedAt: null, bonusNote: null, createdAt: '2026-10-11 17:00',
    note: 'Đóng do thay đổi nhu cầu — không cần thêm người.',
    candidates: makeCandidates(25, 'Barista', 'Chế biến cà phê', 3),
  },
  {
    id: 26, shiftName: 'Ca tối', workDate: '2026-10-15', timeRange: '17:00–22:00',
    position: 'Bếp phụ', skillRequired: 'Chế biến đồ ăn', minSkillLevel: 2,
    requiredHeadcount: 1, filledCount: 1, status: 'CLOSED',
    claimedBy: 'Võ Thị Hồng Nhung', claimedAt: '2026-10-13 19:30', bonusNote: null, createdAt: '2026-10-12 20:00',
    note: '',
    candidates: makeCandidates(26, 'Bếp phụ', 'Chế biến đồ ăn', 2),
  },
];

export default mockOpenShifts;

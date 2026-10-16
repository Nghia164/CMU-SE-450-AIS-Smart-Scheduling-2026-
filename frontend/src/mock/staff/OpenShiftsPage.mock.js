// ============================================================
// MOCK: Nhận ca mở (Staff) — bám schema dbo.open_shifts
// First-come-first-served: ai bấm "Nhận ca" trước thì được ca
// eligibility: ELIGIBLE | SKILL_MISMATCH | TIME_CONFLICT | ALREADY_CLAIMED
// ============================================================

// 14 ca mở hợp lệ cho nhân viên mẫu
export const mockStaffOpenShifts = [
  {
    id: 1, shiftName: 'Ca tối', date: '2026-10-15', startTime: '17:00', endTime: '22:00',
    position: 'Thu ngân', skillRequired: 'Thu ngân', minSkillLevel: 3,
    bonusNote: 'Phụ cấp 20k/giờ ca tối', status: 'OPEN', claimedBy: null,
    eligibility: 'ELIGIBLE', eligibilityLabel: null,
  },
  {
    id: 2, shiftName: 'Ca sáng', date: '2026-10-16', startTime: '07:00', endTime: '12:00',
    position: 'Barista', skillRequired: 'Chế biến cà phê', minSkillLevel: 3,
    bonusNote: null, status: 'OPEN', claimedBy: null,
    eligibility: 'ELIGIBLE', eligibilityLabel: null,
  },
  {
    id: 3, shiftName: 'Ca tối', date: '2026-10-16', startTime: '17:00', endTime: '22:00',
    position: 'Phục vụ', skillRequired: 'Chăm sóc khách hàng', minSkillLevel: 2,
    bonusNote: 'Phụ cấp 30k/giờ ca cuối tuần', status: 'OPEN', claimedBy: null,
    eligibility: 'ELIGIBLE', eligibilityLabel: null,
  },
  {
    id: 4, shiftName: 'Ca sáng', date: '2026-10-17', startTime: '07:00', endTime: '12:00',
    position: 'Phục vụ', skillRequired: 'Chăm sóc khách hàng', minSkillLevel: 2,
    bonusNote: 'Phụ cấp 25k/giờ ca cuối tuần', status: 'OPEN', claimedBy: null,
    eligibility: 'TIME_CONFLICT', eligibilityLabel: 'Trùng ca sáng đã có trong lịch',
  },
  {
    id: 5, shiftName: 'Ca chiều', date: '2026-10-17', startTime: '12:00', endTime: '17:00',
    position: 'Thu ngân', skillRequired: 'Thu ngân', minSkillLevel: 3,
    bonusNote: 'Phụ cấp 25k/giờ ca cuối tuần', status: 'OPEN', claimedBy: null,
    eligibility: 'ELIGIBLE', eligibilityLabel: null,
  },
  {
    id: 6, shiftName: 'Ca tối', date: '2026-10-17', startTime: '17:00', endTime: '22:00',
    position: 'Barista', skillRequired: 'Chế biến cà phê', minSkillLevel: 4,
    bonusNote: 'Phụ cấp 30k/giờ + thưởng doanh số', status: 'OPEN', claimedBy: null,
    eligibility: 'SKILL_MISMATCH', eligibilityLabel: 'Cần Barista cấp 4 — bạn đang cấp 3',
  },
  {
    id: 7, shiftName: 'Ca sáng', date: '2026-10-18', startTime: '07:00', endTime: '12:00',
    position: 'Bếp phụ', skillRequired: 'Chế biến đồ ăn', minSkillLevel: 2,
    bonusNote: null, status: 'OPEN', claimedBy: null,
    eligibility: 'SKILL_MISMATCH', eligibilityLabel: 'Bạn chưa có kỹ năng bếp',
  },
  {
    id: 8, shiftName: 'Ca tối', date: '2026-10-18', startTime: '17:00', endTime: '22:00',
    position: 'Phục vụ', skillRequired: 'Chăm sóc khách hàng', minSkillLevel: 2,
    bonusNote: null, status: 'OPEN', claimedBy: null,
    eligibility: 'ELIGIBLE', eligibilityLabel: null,
  },
  {
    id: 9, shiftName: 'Ca sáng', date: '2026-10-19', startTime: '07:00', endTime: '12:00',
    position: 'Barista', skillRequired: 'Chế biến cà phê', minSkillLevel: 3,
    bonusNote: null, status: 'OPEN', claimedBy: null,
    eligibility: 'TIME_CONFLICT', eligibilityLabel: 'Trùng ca sáng trong lịch của bạn',
  },
  {
    id: 10, shiftName: 'Ca chiều', date: '2026-10-20', startTime: '12:00', endTime: '17:00',
    position: 'Phục vụ', skillRequired: 'Chăm sóc khách hàng', minSkillLevel: 2,
    bonusNote: null, status: 'OPEN', claimedBy: null,
    eligibility: 'ELIGIBLE', eligibilityLabel: null,
  },
  {
    id: 11, shiftName: 'Ca tối', date: '2026-10-21', startTime: '17:00', endTime: '22:00',
    position: 'Thu ngân', skillRequired: 'Thu ngân', minSkillLevel: 3,
    bonusNote: null, status: 'OPEN', claimedBy: null,
    eligibility: 'ELIGIBLE', eligibilityLabel: null,
  },
  {
    id: 12, shiftName: 'Ca sáng', date: '2026-10-22', startTime: '07:00', endTime: '12:00',
    position: 'Phục vụ', skillRequired: 'Chăm sóc khách hàng', minSkillLevel: 2,
    bonusNote: null, status: 'OPEN', claimedBy: null,
    eligibility: 'ELIGIBLE', eligibilityLabel: null,
  },
  {
    id: 13, shiftName: 'Ca chiều', date: '2026-10-23', startTime: '12:00', endTime: '17:00',
    position: 'Barista', skillRequired: 'Chế biến cà phê', minSkillLevel: 3,
    bonusNote: 'Phụ cấp 30k/giờ ca cuối tuần', status: 'CLAIMED', claimedBy: 'Trần Thị Bích',
    eligibility: 'ALREADY_CLAIMED', eligibilityLabel: 'Đã có người nhận',
  },
  {
    id: 14, shiftName: 'Ca tối', date: '2026-10-16', startTime: '17:00', endTime: '22:00',
    position: 'Bếp phụ', skillRequired: 'Chế biến đồ ăn', minSkillLevel: 2,
    bonusNote: 'Phụ cấp 30k/giờ ca cuối tuần', status: 'CLAIMED', claimedBy: 'Tạ Văn Tùng',
    eligibility: 'ALREADY_CLAIMED', eligibilityLabel: 'Đã có người nhận',
  },
];

// Ca tôi đã nhận thành công
export const mockMyClaims = [
  {
    id: 21, shiftName: 'Ca chiều', date: '2026-10-15', startTime: '12:00', endTime: '17:00',
    position: 'Phục vụ', bonusNote: null, status: 'CLAIMED', claimedAt: '2026-10-14 09:12',
  },
  {
    id: 22, shiftName: 'Ca tối', date: '2026-10-14', startTime: '17:00', endTime: '22:00',
    position: 'Phục vụ', bonusNote: null, status: 'CLAIMED', claimedAt: '2026-10-13 20:15',
  },
];

export default { mockStaffOpenShifts, mockMyClaims };

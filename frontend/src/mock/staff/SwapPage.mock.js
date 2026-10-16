// ============================================================
// SwapPage.mock.js — Dữ liệu giả lập trang "Đổi ca" (Task 2.5)
// Bám sát bảng `shift_swap_requests` trong database/01_schema.sql
// Trạng thái: PENDING | ACCEPTED_BY_STAFF | APPROVED | REJECTED | CANCELLED
// ============================================================

// 8 ca làm của tôi trong 14 ngày tới (lấy từ schedule_assignments đã PUBLISHED)
export const myShifts = [
  { id: 101, date: '15/10', dayLabel: 'Thứ Năm', shiftName: 'Ca sáng', startTime: '07:00', endTime: '12:00', position: 'Phục vụ' },
  { id: 102, date: '16/10', dayLabel: 'Thứ Sáu', shiftName: 'Ca chiều', startTime: '12:00', endTime: '17:00', position: 'Thu ngân' },
  { id: 103, date: '17/10', dayLabel: 'Thứ Bảy', shiftName: 'Ca tối', startTime: '17:00', endTime: '22:00', position: 'Phục vụ' },
  { id: 104, date: '18/10', dayLabel: 'Chủ Nhật', shiftName: 'Ca sáng', startTime: '07:00', endTime: '12:00', position: 'Barista' },
  { id: 105, date: '20/10', dayLabel: 'Thứ Ba', shiftName: 'Ca chiều', startTime: '12:00', endTime: '17:00', position: 'Phục vụ' },
  { id: 106, date: '22/10', dayLabel: 'Thứ Năm', shiftName: 'Ca tối', startTime: '17:00', endTime: '22:00', position: 'Thu ngân' },
  { id: 107, date: '25/10', dayLabel: 'Chủ Nhật', shiftName: 'Ca sáng', startTime: '07:00', endTime: '12:00', position: 'Barista' },
  { id: 108, date: '27/10', dayLabel: 'Thứ Ba', shiftName: 'Ca chiều', startTime: '12:00', endTime: '17:00', position: 'Phục vụ' },
];

// 10 đồng nghiệp trong cửa hàng (bảng employees)
export const colleagues = [
  { id: 1, name: 'Trần Thị Bích', position: 'Barista chính', status: 'Đang làm' },
  { id: 2, name: 'Nguyễn Văn Hậu', position: 'Phục vụ', status: 'Đang làm' },
  { id: 3, name: 'Lê Minh Tuấn', position: 'Ca trưởng', status: 'Đang làm' },
  { id: 4, name: 'Phạm Thu Trang', position: 'Thu ngân', status: 'Đang làm' },
  { id: 5, name: 'Hoàng Quốc Duy', position: 'Barista', status: 'Đang làm' },
  { id: 6, name: 'Vũ Ngọc Mai', position: 'Phục vụ', status: 'Đang làm' },
  { id: 7, name: 'Đặng Thanh Phong', position: 'Bếp chính', status: 'Đang làm' },
  { id: 8, name: 'Bùi Hải Yến', position: 'Thu ngân', status: 'Đang làm' },
  { id: 9, name: 'Ngô Trọng Nghĩa', position: 'Phục vụ', status: 'Đang làm' },
  { id: 10, name: 'Dương Thảo Vy', position: 'Barista', status: 'Nghỉ thai sản' },
];

// 14 yêu cầu đổi ca tôi đã gửi (shift_swap_requests — requester là tôi)
export const swapRequests = [
  { id: 201, myShiftId: 101, myShiftLabel: 'Ca sáng · 15/10', targetName: 'Trần Thị Bích', targetShiftLabel: 'Ca chiều · 15/10', reason: 'Sáng 15/10 mình có việc gia đình không đi sớm được, chị Bích đổi giúp mình với.', status: 'PENDING', createdAt: '13/10/2026 09:12', reviewedNote: null },
  { id: 202, myShiftId: 102, myShiftLabel: 'Ca chiều · 16/10', targetName: 'Nguyễn Văn Hậu', targetShiftLabel: 'Ca sáng · 16/10', reason: 'Trùng lịch học buổi chiều, cần người thay.', status: 'PENDING', createdAt: '13/10/2026 08:40', reviewedNote: null },
  { id: 203, myShiftId: 106, myShiftLabel: 'Ca tối · 22/10', targetName: 'Đặng Thanh Phong', targetShiftLabel: 'Ca sáng · 22/10', reason: 'Tối 22/10 mình phải về quê lo chuyện nhà.', status: 'PENDING', createdAt: '12/10/2026 21:15', reviewedNote: null },
  { id: 204, myShiftId: 103, myShiftLabel: 'Ca tối · 17/10', targetName: 'Lê Minh Tuấn', targetShiftLabel: 'Ca sáng · 18/10', reason: 'Đổi ca cuối tuần cho tiện di chuyển về xa.', status: 'ACCEPTED_BY_STAFF', createdAt: '11/10/2026 20:05', reviewedNote: null },
  { id: 205, myShiftId: 104, myShiftLabel: 'Ca sáng · 18/10', targetName: 'Phạm Thu Trang', targetShiftLabel: 'Ca chiều · 18/10', reason: 'Bị cảm, muốn nghỉ buổi sáng chủ nhật.', status: 'ACCEPTED_BY_STAFF', createdAt: '11/10/2026 10:32', reviewedNote: null },
  { id: 206, myShiftId: 107, myShiftLabel: 'Ca sáng · 25/10', targetName: 'Vũ Ngọc Mai', targetShiftLabel: 'Ca chiều · 25/10', reason: 'Nhận xe gửi bảo dưỡng buổi sáng.', status: 'APPROVED', createdAt: '10/10/2026 16:44', reviewedNote: 'Quản lý đã duyệt. Hai bên nhớ đối chiếu lại lịch trên app.' },
  { id: 207, myShiftId: 105, myShiftLabel: 'Ca chiều · 20/10', targetName: 'Hoàng Quốc Duy', targetShiftLabel: 'Ca tối · 20/10', reason: 'Có hẹn khám bệnh định kỳ.', status: 'APPROVED', createdAt: '09/10/2026 09:20', reviewedNote: 'Đã duyệt, cập nhật vào schedule tuần 20/10.' },
  { id: 208, myShiftId: 108, myShiftLabel: 'Ca chiều · 27/10', targetName: 'Ngô Trọng Nghĩa', targetShiftLabel: 'Ca sáng · 28/10', reason: 'Đổi ca sang ngày 28 cho phù hợp chuyến xe.', status: 'APPROVED', createdAt: '08/10/2026 14:02', reviewedNote: 'Duyệt, lưu ý cả hai ca đủ nhân sự.' },
  { id: 209, myShiftId: 102, myShiftLabel: 'Ca chiều · 16/10', targetName: 'Bùi Hải Yến', targetShiftLabel: 'Ca sáng · 17/10', reason: 'Muốn gộp ca để đi học sớm hơn.', status: 'REJECTED', createdAt: '07/10/2026 11:30', reviewedNote: 'Ca sáng 17/10 đã đủ người, không thể thêm.' },
  { id: 210, myShiftId: 103, myShiftLabel: 'Ca tối · 17/10', targetName: 'Dương Thảo Vy', targetShiftLabel: 'Ca sáng · 17/10', reason: 'Tối 17/10 nhà có đám cưới họ hàng.', status: 'REJECTED', createdAt: '06/10/2026 18:55', reviewedNote: 'Vy đang nghỉ thai sản, không thể nhận ca thay.' },
  { id: 211, myShiftId: 104, myShiftLabel: 'Ca sáng · 18/10', targetName: 'Nguyễn Văn Hậu', targetShiftLabel: 'Ca tối · 17/10', reason: 'Hỏi đổi ca thử cho khớp lịch xe.', status: 'CANCELLED', createdAt: '05/10/2026 08:10', reviewedNote: null },
  { id: 212, myShiftId: 105, myShiftLabel: 'Ca chiều · 20/10', targetName: 'Lê Minh Tuấn', targetShiftLabel: 'Ca sáng · 20/10', reason: 'Đổi ca để đưa bé đi tiêm.', status: 'CANCELLED', createdAt: '04/10/2026 15:27', reviewedNote: null },
  { id: 213, myShiftId: 106, myShiftLabel: 'Ca tối · 22/10', targetName: 'Phạm Thu Trang', targetShiftLabel: 'Ca chiều · 22/10', reason: 'Đổi sang ca chiều ngày 22.', status: 'CANCELLED', createdAt: '03/10/2026 19:48', reviewedNote: null },
  { id: 214, myShiftId: 107, myShiftLabel: 'Ca sáng · 25/10', targetName: 'Hoàng Quốc Duy', targetShiftLabel: 'Ca tối · 25/10', reason: 'Muốn nghỉ sáng chủ nhật tuần cuối tháng.', status: 'CANCELLED', createdAt: '02/10/2026 10:05', reviewedNote: null },
];

// 3 yêu cầu đổi ca mà đồng nghiệp gửi tới tôi (incoming)
export const incomingRequests = [
  { id: 301, fromName: 'Vũ Ngọc Mai', fromShiftLabel: 'Ca sáng · 19/10', wantShiftLabel: 'Ca sáng · 25/10', message: 'Ngày 25/10 mình có việc đám cưới họ, đổi ca sáng giúp mình với nha!', status: 'PENDING' },
  { id: 302, fromName: 'Đặng Thanh Phong', fromShiftLabel: 'Ca tối · 21/10', wantShiftLabel: 'Ca tối · 22/10', message: 'Mình cần về quê ngày 22, hai đứa đổi ca tối cho nhau nhé. Cảm ơn cậu!', status: 'PENDING' },
  { id: 303, fromName: 'Bùi Hải Yến', fromShiftLabel: 'Ca chiều · 24/10', wantShiftLabel: 'Ca chiều · 26/10', message: 'Yến bị trùng lịch thi cuối kỳ, đổi giúp Yến ca chiều được không?', status: 'PENDING' },
];

const SwapPageMock = { myShifts, colleagues, swapRequests, incomingRequests };
export default SwapPageMock;

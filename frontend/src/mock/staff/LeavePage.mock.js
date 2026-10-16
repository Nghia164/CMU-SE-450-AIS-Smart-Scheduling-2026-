// ============================================================
// LeavePage.mock.js — Dữ liệu giả lập trang "Xin nghỉ phép" (Task 2.6)
// Bám sát bảng `leave_requests` trong database/01_schema.sql
// Trạng thái: PENDING | APPROVED | REJECTED | CANCELLED
// ============================================================

// Số dư nghỉ phép của tôi (leave_balance)
// sick.total = 0 nghĩa là KHÔNG giới hạn (nghỉ ốm theo thực tế)
export const leaveBalance = {
  annual: { used: 5, total: 12 },  // Phép năm: còn 7/12
  sick: { used: 1, total: 0 },     // Nghỉ ốm: không giới hạn
  personal: { used: 2, total: 3 }, // Việc riêng: còn 1/3
};

// 12 đơn xin nghỉ của tôi (myLeaveRequests)
export const myLeaveRequests = [
  { id: 401, leaveType: 'ANNUAL', typeLabel: 'Nghỉ phép năm', startDate: '20/10/2026', endDate: '21/10/2026', days: 2, reason: 'Du lịch gia đình đã đặt tour từ trước.', status: 'PENDING', reviewedNote: null, createdAt: '13/10/2026 09:30' },
  { id: 402, leaveType: 'SICK', typeLabel: 'Nghỉ ốm', startDate: '16/10/2026', endDate: '16/10/2026', days: 1, reason: 'Đau răng hẹn nha sĩ buổi sáng, chiều về làm bình thường.', status: 'PENDING', reviewedNote: null, createdAt: '13/10/2026 08:12' },
  { id: 403, leaveType: 'PERSONAL', typeLabel: 'Nghỉ việc riêng', startDate: '23/10/2026', endDate: '23/10/2026', days: 1, reason: 'Đi học hội cha mẹ học sinh cho con.', status: 'PENDING', reviewedNote: null, createdAt: '12/10/2026 20:44' },
  { id: 404, leaveType: 'ANNUAL', typeLabel: 'Nghỉ phép năm', startDate: '02/11/2026', endDate: '04/11/2026', days: 3, reason: 'Cưới hỏi họ hàng ở quê, xin nghỉ 3 ngày.', status: 'APPROVED', reviewedNote: 'Duyệt. Bộ phận đã sắp người thay ca.', createdAt: '10/10/2026 15:20' },
  { id: 405, leaveType: 'SICK', typeLabel: 'Nghỉ ốm', startDate: '05/10/2026', endDate: '05/10/2026', days: 1, reason: 'Sốt nhẹ, có đơn khám bệnh kèm theo.', status: 'APPROVED', reviewedNote: 'Đã duyệt, GET WELL SOON!', createdAt: '04/10/2026 07:05' },
  { id: 406, leaveType: 'UNPAID', typeLabel: 'Nghỉ không lương', startDate: '12/12/2026', endDate: '13/12/2026', days: 2, reason: 'Về quê ăn giỗ họ nội.', status: 'APPROVED', reviewedNote: 'Còn ít đơn xin nghỉ cuối năm, duyệt sớm.', createdAt: '02/10/2026 10:30' },
  { id: 407, leaveType: 'ANNUAL', typeLabel: 'Nghỉ phép năm', startDate: '30/09/2026', endDate: '01/10/2026', days: 2, reason: 'Nghỉ phép năm đợt tháng 9.', status: 'APPROVED', reviewedNote: null, createdAt: '25/09/2026 09:15' },
  { id: 408, leaveType: 'EMERGENCY', typeLabel: 'Nghỉ khẩn cấp', startDate: '08/10/2026', endDate: '08/10/2026', days: 1, reason: 'Con bị sốt cao phải đưa đi viện gấp.', status: 'REJECTED', reviewedNote: 'Ngày 08/10 thiếu người ca tối, đề nghị đổi sang hôm khác.', createdAt: '07/10/2026 18:40' },
  { id: 409, leaveType: 'PERSONAL', typeLabel: 'Nghỉ việc riêng', startDate: '28/09/2026', endDate: '28/09/2026', days: 1, reason: 'Giấy tờ hành chính bắt buộc xử lý trong giờ hành chính.', status: 'REJECTED', reviewedNote: 'Tuần đó đang cao điểm, bạn sắp lại giúp mình.', createdAt: '27/09/2026 11:02' },
  { id: 410, leaveType: 'ANNUAL', typeLabel: 'Nghỉ phép năm', startDate: '15/10/2026', endDate: '15/10/2026', days: 1, reason: 'Xin nghỉ 1 ngày đầu kỳ mới.', status: 'CANCELLED', reviewedNote: null, createdAt: '12/10/2026 14:25' },
  { id: 411, leaveType: 'OTHER', typeLabel: 'Lý do khác', startDate: '07/10/2026', endDate: '07/10/2026', days: 1, reason: 'Trùng lịch thi lý thuyết bằng lái A1.', status: 'CANCELLED', reviewedNote: null, createdAt: '06/10/2026 16:50' },
  { id: 412, leaveType: 'UNPAID', typeLabel: 'Nghỉ không lương', startDate: '21/09/2026', endDate: '21/09/2026', days: 1, reason: 'Đưa bố mẹ đi khám định kỳ.', status: 'CANCELLED', reviewedNote: null, createdAt: '20/09/2026 08:35' },
];

const LeavePageMock = { leaveBalance, myLeaveRequests };
export default LeavePageMock;

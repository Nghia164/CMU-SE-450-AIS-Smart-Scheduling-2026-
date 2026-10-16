// File này chứa dữ liệu mẫu cho trang Trợ lý AI (AssistantPage) của Manager.
// LƯU Ý: Trợ lý AI hoạt động ở chế độ CHỈ ĐỌC — mock chỉ gồm hội thoại mẫu,
// gợi ý câu hỏi nhanh và lời chào mặc định. KHÔNG chứa bất kỳ hàm hay dữ liệu
// nào phục vụ việc ghi / sửa / xóa dữ liệu hệ thống.

// 6 gợi ý nhanh (suggested prompts) hiển thị dạng chip cuộn ngang phía trên ô nhập
export const SUGGESTED_PROMPTS = [
  'Tuần này còn ca nào thiếu người?',
  'Ai có tỷ lệ đi trễ cao nhất?',
  'Tổng chi phí lương tuần này',
  'Đề xuất nhân viên thay ca tối thứ 6',
  'Tóm tắt tình hình chấm công tháng này',
  'Nhân viên nào làm nhiều giờ nhất?',
];

// 5 hội thoại mẫu { id, title, updatedAt } — updatedAt là mốc thời gian để hiển thị
// thời gian tương đối ("2 giờ trước", "Hôm qua"...). Tạo bằng Date.now() - offset
// nên luôn "tươi" mỗi lần tải lại trang.
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const CONVERSATIONS = [
  { id: 'conv-1', title: 'Ca thiếu người tuần 42', updatedAt: new Date(Date.now() - 2 * HOUR) },
  { id: 'conv-2', title: 'Đi trễ nhiều nhất tháng 10', updatedAt: new Date(Date.now() - 5 * HOUR) },
  { id: 'conv-3', title: 'Chi phí lương tuần 42', updatedAt: new Date(Date.now() - 26 * HOUR) },
  { id: 'conv-4', title: 'Đề xuất thay ca tối thứ 6', updatedAt: new Date(Date.now() - 2 * DAY) },
  { id: 'conv-5', title: 'Nhân viên làm nhiều giờ nhất', updatedAt: new Date(Date.now() - 4 * DAY) },
];

// Tin nhắn chào mừng mặc định của AI khi mở / tạo một hội thoại mới.
// role: 'ai' để UI hiển thị bằng bubble của trợ lý.
export const WELCOME_MESSAGE = {
  role: 'ai',
  text: [
    'Xin chào! Tôi là Trợ lý AI của Smart Scheduling.',
    'Tôi có thể đọc và phân tích dữ liệu lịch làm, chấm công và chi phí của cửa hàng — ví dụ: ca còn thiếu người, tỷ lệ đi trễ, tổng chi phí lương tuần, hoặc đề xuất ứng viên phù hợp để thay ca.',
    'Lưu ý: tôi hoạt động ở chế độ CHỈ ĐỌC, không thể tạo hay chỉnh sửa bất kỳ dữ liệu nào. Mọi thao tác thêm / sửa bạn vui lòng thực hiện trên các trang quản lý tương ứng.',
  ].join('\n\n'),
};

// Export mặc định để nơi khác có thể import gọn cả bộ
export default { SUGGESTED_PROMPTS, CONVERSATIONS, WELCOME_MESSAGE };

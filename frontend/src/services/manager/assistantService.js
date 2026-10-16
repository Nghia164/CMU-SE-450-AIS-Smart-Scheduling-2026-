// ============================================================================
// assistantService — Dịch vụ Trợ lý AI cho trang AssistantPage (role MANAGER)
//
// QUAN TRỌNG — CHẾ ĐỘ CHỈ ĐỌC (READ-ONLY):
// Trợ lý AI chỉ được ĐỌC và PHÂN TÍCH dữ liệu cửa hàng (lịch làm, chấm công,
// chi phí). Do đó service này CỐ TÌNH KHÔNG cung cấp bất kỳ hàm ghi / sửa / xóa
// dữ liệu nào (không tạo lịch, không sửa công, không xóa ca...). Mọi phản hồi
// đều là văn bản phân tích sinh từ dữ liệu tổng quan đã có của cửa hàng.
// ============================================================================

import { CONVERSATIONS } from '../../mock/manager/AssistantPage.mock.js';

// ---------------------------------------------------------------------------
// Dữ liệu tổng quan cửa hàng (bám sát DashboardPage.mock.js) dùng để sinh câu trả lời
// ---------------------------------------------------------------------------
const STORE_STATS = {
  weekLabel: 'Tuần 42 • 12/10/2026 – 18/10/2026',
  totalEmployees: 30,
  // Chấm công tháng 10 (tính đến 14/10/2026)
  attendance: { total: 439, onTime: 412, late: 21, outOfZone: 6 },
  // Chi phí lương tuần (ước tính)
  avgHourlyRate: 27000, // ₫/giờ — mức lương giờ trung bình của cửa hàng
  regularHours: 640,
  overtimeHours: 115,
  overtimeMultiplier: 1.5,
  previousWeekCost: 20400000,
};

// Ca thiếu người tuần 42 (đồng bộ với understaffed của Dashboard)
const UNDERSTAFFED_SHIFTS = [
  { date: 'Thứ 4 (14/10)', shift: 'Ca chiều (12:00 – 17:00)', required: 6, assigned: 5, missing: 1 },
  { date: 'Thứ 6 (16/10)', shift: 'Ca tối (17:00 – 22:00)', required: 7, assigned: 5, missing: 2 },
  { date: 'Thứ 7 (17/10)', shift: 'Ca sáng (07:00 – 12:00)', required: 6, assigned: 5, missing: 1 },
  { date: 'Chủ nhật (18/10)', shift: 'Ca tối (17:00 – 22:00)', required: 7, assigned: 6, missing: 1 },
];

// Định dạng tiền tệ VND theo chuẩn vi-VN
const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

// Định dạng phần trăm kiểu Việt Nam (dấu phẩy thập phân): 93,8
function pct(value, total) {
  return ((value / total) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
}

// ---------------------------------------------------------------------------
// Các bộ sinh câu trả lời theo chủ đề (có xuống dòng \n\n giữa các đoạn)
// ---------------------------------------------------------------------------

// "thiếu" / "ca mở" → danh sách ca thiếu người + gợi ý tạo ca mở
function buildUnderstaffedReply() {
  const totalMissing = UNDERSTAFFED_SHIFTS.reduce((sum, s) => sum + s.missing, 0);
  const lines = UNDERSTAFFED_SHIFTS.map(
    (s) => `• ${s.date} — ${s.shift}: thiếu ${s.missing} người (đủ ${s.assigned}/${s.required})`
  );
  const worst = UNDERSTAFFED_SHIFTS.reduce((a, b) => (b.missing > a.missing ? b : a));
  return [
    `Tôi đã rà soát lịch ${STORE_STATS.weekLabel} và phát hiện ${UNDERSTAFFED_SHIFTS.length} ca còn thiếu nhân sự:`,
    lines.join('\n'),
    `Tổng cộng còn thiếu ${totalMissing} lượt ca, nghiêm trọng nhất là ${worst.shift.toLowerCase()} ${worst.date.toLowerCase()}. Gợi ý: bạn nên Tạo ca mở để mời nhân viên nhận — hệ thống sẽ ưu tiên nhân viên đủ kỹ năng và còn hạn mức giờ trong tuần.`,
  ].join('\n\n');
}

// "trễ" / "chấm công" → tóm tắt tỷ lệ đúng giờ + top người đi trễ
function buildAttendanceReply() {
  const { total, onTime, late, outOfZone } = STORE_STATS.attendance;
  return [
    'Tình hình chấm công tháng 10 (tính đến 14/10/2026):',
    [
      `• Tổng số lượt chấm công: ${total}`,
      `• Đúng giờ: ${onTime} lượt (chiếm ${pct(onTime, total)}%)`,
      `• Đi trễ: ${late} lượt (${pct(late, total)}%)`,
      `• Ngoài khu vực GPS: ${outOfZone} lượt (${pct(outOfZone, total)}%)`,
    ].join('\n'),
    [
      '3 nhân viên đi trễ nhiều nhất:',
      '1. Ngô Gia Bảo (NV010) — 5 lần, tập trung vào ca sáng đầu tuần',
      '2. Cao Thái Sơn (NV020) — 4 lần, trung bình trễ khoảng 12 phút',
      '3. Vũ Đức Thắng (NV006) — 3 lần, thường trễ sau ca cuối tuần',
    ].join('\n'),
    'Gợi ý: bạn nên trao đổi riêng với 2 bạn đứng đầu, hoặc tạm đổi ca sáng của họ sang ca chiều trong 2 tuần tới để theo dõi cải thiện.',
  ].join('\n\n');
}

// "thay ca" / "đề xuất" → gợi ý 2–3 ứng viên kèm lý do
function buildSwapSuggestionReply() {
  return [
    'Nhằm lấp chỗ trống cho ca tối thứ 6 (16/10, 17:00 – 22:00) đang thiếu 2 người, tôi đề xuất 3 ứng viên phù hợp nhất:',
    [
      '1. Cao Thái Sơn (NV020) — Pha chế cấp 4 • Thứ 6 không có ca nào • Đã nhận ca tối ổn định 2 tuần gần nhất',
      '2. Lâm Chí Công (NV016) — Phục vụ cấp 3 • Tuần này mới nhận 4 ca, còn dư hạn mức giờ • Lịch rảnh đã đăng ký cả tối thứ 6',
      '3. Châu Bùi (NV025) — Pha chế + Thu ngân • Có kinh nghiệm ca tối cuối tuần • Không trùng giờ với ca hiện tại',
    ].join('\n'),
    'Bạn có thể tạo ca mở và gửi lời mời trực tiếp cho 3 bạn trên từ trang "Quản lý ca mở". Tôi chỉ đọc dữ liệu nên sẽ không gửi lời mời thay bạn.',
  ].join('\n\n');
}

// "chi phí" / "lương" → giờ thường, tăng ca, chi phí ước tính VND
function buildPayrollReply() {
  const { avgHourlyRate, regularHours, overtimeHours, overtimeMultiplier, previousWeekCost } = STORE_STATS;
  const regularCost = regularHours * avgHourlyRate;
  const overtimeCost = Math.round(overtimeHours * avgHourlyRate * overtimeMultiplier);
  const totalCost = regularCost + overtimeCost;
  const totalHours = regularHours + overtimeHours;
  const delta = pct(totalCost - previousWeekCost, previousWeekCost);
  return [
    `Ước tính chi phí lương ${STORE_STATS.weekLabel} (dựa trên lịch đã duyệt và bảng công hiện tại):`,
    [
      `• Tổng giờ làm dự kiến: ${totalHours} giờ (giờ thường ${regularHours} giờ + tăng ca ${overtimeHours} giờ)`,
      `• Chi phí giờ thường: ${regularHours} giờ × ${vnd.format(avgHourlyRate)}/giờ = ${vnd.format(regularCost)}`,
      `• Chi phí tăng ca (hệ số ${overtimeMultiplier.toLocaleString('vi-VN')}): ${vnd.format(overtimeCost)}`,
      `• Tổng chi phí lương tuần: ${vnd.format(totalCost)}`,
    ].join('\n'),
    `So với tuần trước (khoảng ${vnd.format(previousWeekCost)}), tuần này cao hơn ~${delta}% do hai ca tối cuối tuần cần nhân sự dày hơn. Lưu ý: đây là con số ước tính, chưa bao gồm phụ cấp ca đêm và thưởng năng suất.`,
  ].join('\n\n');
}

// "nhiều giờ" → top nhân viên theo giờ làm trong tuần
function buildTopHoursReply() {
  return [
    'Top 5 nhân viên có số giờ làm nhiều nhất tuần 42:',
    [
      '1. Phạm Minh Tuấn (NV004) — 38 giờ',
      '2. Đỗ Thanh Tâm (NV009) — 36 giờ',
      '3. Nguyễn Văn An (NV001) — 35 giờ',
      '4. Trương Đình Phong (NV014) — 35 giờ',
      '5. Trần Thị Bích Ngọc (NV002) — 32 giờ',
    ].join('\n'),
    'Lưu ý: Phạm Minh Tuấn và Đỗ Thanh Tâm đang gần chạm hạn mức 40 giờ/tuần. Nếu tiếp tục nhận thêm ca, phần vượt hạn mức sẽ được tính vào giờ tăng ca và làm tăng chi phí lương tuần sau.',
  ].join('\n\n');
}

// Mặc định → trả lời lịch sự + gợi ý các câu hỏi có thể hỏi
function buildDefaultReply() {
  return [
    'Xin chào! Tôi là Trợ lý AI của cửa hàng, hoạt động ở chế độ chỉ đọc — tôi có thể phân tích dữ liệu nhưng không thể tạo hay sửa bất kỳ thông tin nào.',
    [
      'Hiện tại tôi có thể giúp bạn:',
      '• Kiểm tra các ca còn thiếu người trong tuần',
      '• Tóm tắt tình hình chấm công và tỷ lệ đúng giờ',
      '• Ước tính tổng chi phí lương theo tuần',
      '• Đề xuất ứng viên phù hợp để thay ca',
      '• Xem nhân viên đang làm nhiều giờ nhất',
    ].join('\n'),
    'Bạn muốn bắt đầu với câu hỏi nào?',
  ].join('\n\n');
}

// Điều phối câu trả lời theo từ khóa trong câu hỏi của người dùng
function buildReply(rawText) {
  const text = String(rawText || '').toLowerCase();
  if (text.includes('thiếu') || text.includes('ca mở')) return buildUnderstaffedReply();
  if (text.includes('trễ') || text.includes('chấm công')) return buildAttendanceReply();
  if (text.includes('thay ca') || text.includes('đề xuất')) return buildSwapSuggestionReply();
  if (text.includes('chi phí') || text.includes('lương')) return buildPayrollReply();
  if (text.includes('nhiều giờ')) return buildTopHoursReply();
  return buildDefaultReply();
}

// ---------------------------------------------------------------------------
// API công khai (chỉ đọc)
// ---------------------------------------------------------------------------

// Lấy danh sách hội thoại mẫu cho panel bên trái
export async function listConversations() {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return structuredClone(CONVERSATIONS);
}

// Gửi câu hỏi và nhận câu trả lời của AI (giả lập).
// conversationId: giữ trong chữ ký để tương thích API thật sau này; hiện tại
// câu trả lời chỉ phụ thuộc nội dung câu hỏi.
// Trả về: { reply: string (có xuống dòng \n\n), replyAt: string (ISO time) }
export async function sendMessage(conversationId, text) {
  // Giả lập thời gian AI "suy nghĩ": 900 – 1400ms
  const delay = 900 + Math.floor(Math.random() * 501);
  await new Promise((resolve) => setTimeout(resolve, delay));
  const reply = buildReply(text);
  return { reply, replyAt: new Date().toISOString() };
}

// LƯU Ý LẦN CUỐI: Không có và sẽ không có hàm ghi / sửa / xóa dữ liệu nào ở đây —
// trang AssistantPage là trợ lý AI chỉ đọc theo đúng đặc thù của Task 1.6.
export default { listConversations, sendMessage };

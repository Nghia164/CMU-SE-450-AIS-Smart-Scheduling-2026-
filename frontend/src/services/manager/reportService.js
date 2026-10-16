// ============================================================
// SERVICE: Báo cáo vận hành (Manager) — giả lập API với setTimeout
// Tạo báo cáo (1.5s giả lập render file) + quản lý lịch sử
// ============================================================
import { REPORT_TYPES, mockReportHistory } from '../../mock/manager/ReportsPage.mock.js';

let historyStore = structuredClone(mockReportHistory);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Danh sách loại báo cáo cho grid thẻ
export async function listReportTypes() {
  await delay(200);
  return structuredClone(REPORT_TYPES);
}

// Lịch sử các báo cáo đã tạo
export async function listReportHistory() {
  await delay(300);
  return structuredClone(historyStore);
}

// Tạo báo cáo mới — giả lập render 1.5s rồi thêm vào lịch sử
export async function generateReport({ typeId, periodFrom, periodTo, format }) {
  await delay(1500);
  const type = REPORT_TYPES.find((t) => t.id === typeId);
  if (!type) throw new Error('Loại báo cáo không hợp lệ.');
  if (!type.formats.includes(format)) {
    throw new Error(`Báo cáo "${type.name}" chỉ hỗ trợ định dạng ${type.formats.join(', ')}.`);
  }
  if (!periodFrom || !periodTo) throw new Error('Vui lòng chọn đầy đủ kỳ báo cáo (từ/đến).');
  if (periodTo < periodFrom) throw new Error('Ngày kết thúc phải sau ngày bắt đầu.');

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const maxId = Math.max(...historyStore.map((r) => r.id), 0);
  const record = {
    id: maxId + 1,
    type: typeId,
    name: type.name,
    periodLabel: `${periodFrom} → ${periodTo}`,
    format,
    generatedBy: 'Quản lý cửa hàng',
    generatedAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
    fileSizeKb: 120 + Math.floor(Math.random() * 2200),
    status: 'READY',
  };
  historyStore.unshift(record);
  return structuredClone(record);
}

// Xóa một báo cáo khỏi lịch sử
export async function deleteReport(id) {
  await delay(350);
  const idx = historyStore.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Không tìm thấy báo cáo trong lịch sử.');
  historyStore.splice(idx, 1);
  return true;
}

// Giả lập tải file xuống: sinh blob text và trigger download trình duyệt
export function downloadReport(record) {
  const content = [
    `SMART SCHEDULING — ${record.name.toUpperCase()}`,
    `Kỳ báo cáo: ${record.periodLabel}`,
    `Định dạng: ${record.format}`,
    `Tạo bởi: ${record.generatedBy} lúc ${record.generatedAt}`,
    '---',
    '(Nội dung mô phỏng — khi nối API thật, endpoint sẽ trả file PDF/EXCEL nhị phân.)',
  ].join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${record.name.replace(/\s+/g, '-')}-${record.id}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default { listReportTypes, listReportHistory, generateReport, deleteReport, downloadReport };

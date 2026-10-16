// File này cung cấp dịch vụ lấy danh sách yêu cầu nghỉ phép/đổi ca, gợi ý người thay ca và lưu quyết định duyệt/từ chối.
import { mockRequests } from '../../mock/manager/RequestsPage.mock.js';

let requestStore = structuredClone(mockRequests);

// Hàm này trả về danh sách toàn bộ yêu cầu nghỉ phép, đổi ca và lịch sử.
export async function listRequests() {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return structuredClone(requestStore);
}

// Hàm này lọc và đề xuất tối đa 3 ứng viên đủ điều kiện thay ca kèm lý do chi tiết.
export function suggestReplacements(candidates = []) {
  const picks = [];
  const rejected = [];

  for (const c of candidates) {
    const eligible = Boolean(c.available && c.skillOk);
    if (eligible) {
      picks.push({
        id: c.id,
        name: c.name,
        reasons: c.reasons?.length
          ? c.reasons
          : [c.note || 'Đủ kỹ năng và đã đăng ký rảnh trong khung giờ của ca'],
      });
    } else {
      const fallbackReasons = [];
      if (!c.available) fallbackReasons.push('Không đăng ký rảnh hoặc trùng ca liền kề');
      if (!c.skillOk) fallbackReasons.push('Chưa đạt yêu cầu kỹ năng của vị trí');
      rejected.push({
        id: c.id,
        name: c.name,
        reasons: c.reasons?.length ? c.reasons : fallbackReasons,
      });
    }
  }

  return {
    total: candidates.length,
    picks: picks.slice(0, 3),
    rejected,
  };
}

// Hàm này xử lý quyết định Duyệt (APPROVE) hoặc Từ chối (REJECT) của Manager cho một yêu cầu.
export async function decideRequest(id, decision, payload = {}) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const idx = requestStore.findIndex((item) => item.id === id);
  if (idx === -1) {
    throw new Error('Không tìm thấy yêu cầu cần xử lý.');
  }

  const current = requestStore[idx];
  const chosenCandidate = current.candidates?.find((c) => c.id === payload.replacementId);

  const updated = {
    ...current,
    status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
    reviewedAt: new Date().toISOString(),
    reviewedBy: 'Quản lý cửa hàng',
    reviewNote: payload.note?.trim() || (decision === 'APPROVE' ? 'Đã duyệt yêu cầu.' : 'Từ chối yêu cầu.'),
    replacementName: decision === 'APPROVE' && chosenCandidate ? chosenCandidate.name : current.replacementName ?? null,
  };

  requestStore[idx] = updated;
  return structuredClone(updated);
}
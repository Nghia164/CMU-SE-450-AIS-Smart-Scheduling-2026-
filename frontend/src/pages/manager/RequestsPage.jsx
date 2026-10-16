// File này là trang Duyệt nghỉ & Đổi ca: danh sách cuộn độc lập, chi tiết yêu cầu, danh sách người có thể thay ca và lịch sử đã xử lý.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { listRequests, decideRequest, suggestReplacements } from '../../services/manager/requestService.js';

// Các tab ở đầu trang: nghỉ phép, đổi ca và lịch sử.
const TABS = [
  { key: 'LEAVE', label: 'Nghỉ phép' },
  { key: 'SWAP', label: 'Đổi ca' },
  { key: 'HISTORY', label: 'Lịch sử' },
];

// Class thanh kéo hiển thị cố định, hỗ trợ cả Chrome/Edge (WebKit) và Firefox cho cả 3 tab.
const CARD_LIST_SCROLL_CLASS =
  'overflow-y-scroll [scrollbar-width:thin] [scrollbar-color:#d5c8b4_#f6f1e7] ' +
  '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-crema ' +
  '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d5c8b4] hover:[&::-webkit-scrollbar-thumb]:bg-amber/70';

// Hàm này cho biết yêu cầu còn đang chờ xử lý hay không.
function isOpen(item) {
  return item.status === 'PENDING' || item.status === 'ACCEPTED_BY_STAFF';
}

// Hàm này cho biết Manager có thể duyệt yêu cầu hay không: nghỉ phép khi đang chờ, đổi ca khi đồng nghiệp đã đồng ý.
function canDecide(item) {
  if (item.type === 'LEAVE') return item.status === 'PENDING';
  return item.status === 'ACCEPTED_BY_STAFF';
}

// Hàm này trả về nhãn trạng thái tiếng Việt của một yêu cầu.
function statusText(item) {
  if (item.status === 'APPROVED') return 'Đã duyệt';
  if (item.status === 'REJECTED') return 'Đã từ chối';
  if (item.status === 'ACCEPTED_BY_STAFF') return 'Chờ Manager duyệt';
  if (item.type === 'SWAP') return 'Chờ đồng nghiệp';
  return 'Chờ duyệt';
}

// Hàm này chọn class màu cho nhãn trạng thái của một yêu cầu.
function statusClass(item) {
  if (item.status === 'APPROVED') return 'bg-matcha/15 text-matcha';
  if (item.status === 'REJECTED') return 'bg-danger/10 text-danger';
  return 'bg-amber/15 text-amber';
}

// Hàm này đổi thời điểm sang chuỗi ngày giờ theo chuẩn Việt Nam.
function formatDateTime(iso) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Hàm này lấy thời điểm dùng để sắp xếp: thời điểm xử lý nếu có, nếu không thì thời điểm gửi.
function sortTime(item) {
  return item.reviewedAt ?? item.createdAt;
}

// Hàm này lấy tên người xử lý, mặc định là Quản lý cửa hàng nếu dữ liệu không ghi rõ.
function reviewerName(item) {
  return item.reviewedBy ?? 'Quản lý cửa hàng';
}

// Component này hiển thị một thẻ yêu cầu trong danh sách; tô sáng khi đang được chọn và hiển thị thời điểm phù hợp với tab.
function RequestCard({ item, active, showDecision, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full shrink-0 flex-col gap-1.5 rounded-xl border p-3.5 text-left transition-colors ${
        active ? 'border-amber/50 bg-amber/5' : 'border-line bg-paper hover:bg-crema'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-ink">{item.employeeName}</span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass(item)}`}>
          {statusText(item)}
        </span>
      </div>
      <span className="text-xs text-muted">{item.summary}</span>
      <span className="font-mono text-[10px] text-muted">
        {showDecision ? `Xử lý: ${formatDateTime(sortTime(item))}` : `Gửi: ${formatDateTime(item.createdAt)}`}
      </span>
    </button>
  );
}

// Component này hiển thị một dòng thông tin gồm nhãn và giá trị trong chi tiết yêu cầu.
function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-sm font-medium text-ink sm:text-right">{value ?? '—'}</span>
    </div>
  );
}

// Component này hiển thị một dòng kiểm tra điều kiện đổi ca, có dấu đạt hoặc không đạt.
function CheckRow({ label, ok, note }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${
          ok ? 'bg-matcha' : 'bg-danger'
        }`}
      >
        {ok ? '✓' : '!'}
      </span>
      <span>
        <span className="font-medium text-ink">{label}</span>
        {note && <span className="block text-xs text-muted">{note}</span>}
      </span>
    </div>
  );
}

// Component này hiển thị danh sách ứng viên thay ca; chỉ chọn được người đủ điều kiện.
function CandidateList({ candidates, selectedId, onSelect }) {
  return (
    <div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
      {candidates.map((c) => {
        const eligible = c.available && c.skillOk;
        const selected = selectedId === c.id;
        return (
          <button
            key={c.id}
            type="button"
            disabled={!eligible}
            onClick={() => onSelect(selected ? null : c.id)}
            className={`flex shrink-0 items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              selected ? 'border-matcha bg-matcha/10' : 'border-line bg-white hover:bg-crema'
            }`}
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">{c.name}</span>
              <span className="block text-xs text-muted">{c.note}</span>
            </span>
            <span className={`shrink-0 text-xs font-semibold ${eligible ? 'text-matcha' : 'text-danger'}`}>
              {eligible ? (selected ? 'Đã chọn' : 'Đủ điều kiện') : 'Không đủ điều kiện'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Component này hiển thị hộp thoại gợi ý tối đa 3 người thay ca kèm lý do; nếu không ai đủ điều kiện thì báo không có ai và nêu lý do từng ứng viên.
function SuggestModal({ open, candidates, onClose, onPick }) {
  const result = suggestReplacements(candidates);
  const noneEligible = result.picks.length === 0;

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggest-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-paper p-6 shadow-[0_24px_60px_rgba(24,20,17,0.25)]"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-amber">Gợi ý thay ca</p>
        <h3 id="suggest-title" className="mt-1 font-display text-xl font-semibold text-ink">
          {noneEligible ? 'Không có ai phù hợp' : `Đề xuất ${result.picks.length} người thay ca`}
        </h3>
        <p className="mt-1 text-sm text-muted">
          Chỉ đề xuất người đủ kỹ năng và rảnh trong khung giờ của ca.
        </p>

        {noneEligible ? (
          <div className="mt-5 flex flex-col gap-3">
            <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
              {result.total === 0
                ? 'Chưa có ứng viên nào trong danh sách.'
                : 'Không có ứng viên nào đủ điều kiện thay ca này. Bạn có thể đăng ca mở để nhân viên khác nhận.'}
            </p>
            {result.rejected.length > 0 && (
              <ul className="flex flex-col gap-2">
                {result.rejected.map((r) => (
                  <li key={r.id} className="rounded-xl border border-line bg-white px-3.5 py-2.5">
                    <p className="text-sm font-semibold text-ink">{r.name}</p>
                    <p className="text-xs text-muted">{r.reasons.join(' • ')}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <ol className="mt-5 flex flex-col gap-3">
            {result.picks.map((c, index) => (
              <li key={c.id} className="rounded-xl border border-line bg-white p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {index + 1}. {c.name}
                    </p>
                    <ul className="mt-1.5 flex flex-col gap-1">
                      {c.reasons.map((reason) => (
                        <li key={reason} className="flex gap-2 text-xs text-muted">
                          <span className="text-matcha">✓</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => onPick(c.id)}
                    className="h-9 shrink-0 cursor-pointer rounded-lg bg-ink px-3.5 text-xs font-semibold text-crema hover:bg-amber hover:text-white"
                  >
                    Chọn
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}

        {!noneEligible && result.rejected.length > 0 && (
          <details className="mt-5 text-sm">
            <summary className="cursor-pointer font-medium text-muted">
              Không đề xuất ({result.rejected.length})
            </summary>
            <ul className="mt-2 flex flex-col gap-2">
              {result.rejected.map((r) => (
                <li key={r.id} className="rounded-xl bg-crema px-3.5 py-2.5">
                  <p className="text-sm font-semibold text-ink">{r.name}</p>
                  <p className="text-xs text-muted">{r.reasons.join(' • ')}</p>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 cursor-pointer rounded-xl border border-line px-4 text-sm font-semibold text-ink hover:bg-crema"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// Component này hiển thị chi tiết yêu cầu đang chờ xử lý: thông tin, chọn người thay ca, kiểm tra điều kiện đổi ca, ghi chú và nút duyệt.
function DetailPanel({ item, busy, onDecide }) {
  const [note, setNote] = useState('');
  const [replacementId, setReplacementId] = useState(null);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const isLeave = item.type === 'LEAVE';
  const decidable = canDecide(item);
  const candidates = item.candidates ?? [];
  const chosen = candidates.find((c) => c.id === replacementId);
  const closeSuggest = useCallback(() => setSuggestOpen(false), []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-amber">
            {isLeave ? 'Xin nghỉ phép' : 'Yêu cầu đổi ca'}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{item.employeeName}</h2>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass(item)}`}>
          {statusText(item)}
        </span>
      </div>

      <div className="divide-y divide-line rounded-xl border border-line bg-white px-4">
        {isLeave ? (
          <>
            <InfoRow label="Loại nghỉ" value={item.leaveLabel} />
            <InfoRow label="Ca bị ảnh hưởng" value={item.shiftLabel} />
          </>
        ) : (
          <>
            <InfoRow label="Ca của người gửi" value={item.shiftA} />
            <InfoRow label="Đổi với" value={item.targetName} />
            <InfoRow label="Ca của người nhận" value={item.shiftB} />
          </>
        )}
        <InfoRow label="Lý do" value={item.reason} />
      </div>

      {isLeave ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Danh sách người có thể thay ca</p>
              <p className="text-xs text-muted">Không bắt buộc. Có thể chọn người thay hoặc để trống khi duyệt.</p>
            </div>
            {decidable && (
              <button
                type="button"
                onClick={() => setSuggestOpen(true)}
                className="h-9 cursor-pointer rounded-lg border border-matcha/40 bg-matcha/10 px-3.5 text-xs font-semibold text-matcha transition-colors hover:bg-matcha/20"
              >
                Lọc nhanh người đủ điều kiện
              </button>
            )}
          </div>

          {chosen && (
            <p className="rounded-lg bg-matcha/10 px-3 py-2 text-xs font-medium text-matcha">
              Đã chọn người thay ca: {chosen.name}
            </p>
          )}

          {candidates.length > 0 ? (
            <CandidateList candidates={candidates} selectedId={replacementId} onSelect={setReplacementId} />
          ) : (
            <p className="rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted">
              Chưa có ứng viên nào trong danh sách.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-ink">Kiểm tra trước khi duyệt</p>
          {item.checks.map((c) => (
            <CheckRow key={c.label} {...c} />
          ))}
        </div>
      )}

      {decidable ? (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-ink">Ghi chú (không bắt buộc)</span>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-xl border-[1.5px] border-line bg-white px-3.5 py-2.5 text-sm focus:border-amber focus:outline-none"
            />
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecide('REJECT', { note })}
              className="h-11 cursor-pointer rounded-xl border border-danger/40 px-5 text-sm font-semibold text-danger transition-colors hover:bg-danger/10 disabled:opacity-60"
            >
              Từ chối
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecide('APPROVE', { note, replacementId })}
              className="h-11 cursor-pointer rounded-xl bg-ink px-5 text-sm font-semibold text-crema transition-colors hover:bg-amber hover:text-white disabled:opacity-60"
            >
              {busy ? 'Đang xử lý...' : 'Duyệt'}
            </button>
          </div>
        </>
      ) : (
        <p className="rounded-xl bg-crema px-4 py-3 text-sm text-muted">
          {item.status === 'PENDING' && !isLeave
            ? 'Đang chờ nhân viên nhận đổi ca đồng ý.'
            : `Yêu cầu đã được xử lý: ${statusText(item).toLowerCase()}.`}
        </p>
      )}

      {isLeave && (
        <SuggestModal
          open={suggestOpen}
          candidates={candidates}
          onClose={closeSuggest}
          onPick={(id) => {
            setReplacementId(id);
            setSuggestOpen(false);
          }}
        />
      )}
    </div>
  );
}

// Component này hiển thị chi tiết một yêu cầu đã xử lý: thông tin, kết quả, người xử lý, thời điểm xử lý và ghi chú.
function HistoryDetail({ item }) {
  const isLeave = item.type === 'LEAVE';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-amber">
            {isLeave ? 'Xin nghỉ phép' : 'Yêu cầu đổi ca'}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{item.employeeName}</h2>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass(item)}`}>
          {statusText(item)}
        </span>
      </div>

      <div className="divide-y divide-line rounded-xl border border-line bg-white px-4">
        {isLeave ? (
          <>
            <InfoRow label="Loại nghỉ" value={item.leaveLabel} />
            <InfoRow label="Ca bị ảnh hưởng" value={item.shiftLabel} />
          </>
        ) : (
          <>
            <InfoRow label="Ca của người gửi" value={item.shiftA} />
            <InfoRow label="Đổi với" value={item.targetName} />
            <InfoRow label="Ca của người nhận" value={item.shiftB} />
          </>
        )}
        <InfoRow label="Lý do" value={item.reason} />
        <InfoRow label="Gửi lúc" value={formatDateTime(item.createdAt)} />
        <InfoRow
          label="Xử lý lúc"
          value={item.reviewedAt ? formatDateTime(item.reviewedAt) : formatDateTime(item.createdAt)}
        />
        <InfoRow label="Người xử lý" value={reviewerName(item)} />
        {item.replacementName && <InfoRow label="Người thay ca" value={item.replacementName} />}
        <InfoRow label="Ghi chú" value={item.reviewNote} />
      </div>

      {!isLeave && item.checks && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-ink">Kết quả kiểm tra</p>
          {item.checks.map((c) => (
            <CheckRow key={c.label} {...c} />
          ))}
        </div>
      )}
    </div>
  );
}

// Component này là trang Duyệt nghỉ & Đổi ca: tải dữ liệu, chia theo tab, chọn yêu cầu và gửi quyết định lên dịch vụ.
export default function RequestsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('LEAVE');
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listRequests().then((data) => {
      if (cancelled) return;
      setItems(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    if (tab === 'HISTORY') {
      return items
        .filter((i) => !isOpen(i))
        .sort((a, b) => new Date(sortTime(b)) - new Date(sortTime(a)));
    }
    return items.filter((i) => i.type === tab && isOpen(i));
  }, [items, tab]);

  const selected = visible.find((i) => i.id === selectedId) ?? visible[0] ?? null;

  // Hàm này đếm số yêu cầu của một loại đang cần Manager xử lý.
  function countDecidable(type) {
    return items.filter((i) => i.type === type && canDecide(i)).length;
  }

  // Hàm này đổi tab, xóa lựa chọn và thông báo cũ.
  function handleTabChange(key) {
    setTab(key);
    setSelectedId(null);
    setMessage(null);
  }

  // Hàm này gửi quyết định duyệt hoặc từ chối cho yêu cầu đang chọn rồi cập nhật danh sách.
  async function handleDecide(decision, payload) {
    setBusy(true);
    setMessage(null);
    try {
      const updated = await decideRequest(selected.id, decision, payload);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setSelectedId(null);
      setMessage({
        type: 'success',
        text: decision === 'APPROVE' ? 'Đã duyệt yêu cầu.' : 'Đã từ chối yêu cầu.',
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="p-8">
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-amber">Điều phối</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Duyệt nghỉ & Đổi ca</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count = t.key === 'HISTORY' ? 0 : countDecidable(t.key);
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => handleTabChange(t.key)}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                active ? 'border-ink bg-ink text-crema' : 'border-line bg-paper text-ink hover:bg-crema'
              }`}
            >
              {t.label}
              {count > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    active ? 'bg-amber text-white' : 'bg-danger/10 text-danger'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-muted">Đang tải yêu cầu...</p>
      ) : (
        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[360px_1fr]">
          {/* Danh sách thẻ bên trái: có thanh kéo cố định cho cả Nghỉ phép, Đổi ca và Lịch sử */}
          <aside className="xl:sticky xl:top-6">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted">
                Danh sách ({visible.length})
              </span>
              <span className="text-[11px] text-muted">Cuộn để xem thêm</span>
            </div>

            <div
              key={tab}
              className={`flex h-[380px] max-h-[calc(100vh-260px)] flex-col gap-2.5 rounded-2xl border border-line bg-crema/40 p-2.5 pr-2 ${CARD_LIST_SCROLL_CLASS}`}
            >
              {visible.length === 0 && (
                <p className="rounded-xl border border-dashed border-line bg-paper p-6 text-center text-sm text-muted">
                  {tab === 'HISTORY' ? 'Chưa có yêu cầu nào đã xử lý.' : 'Không có yêu cầu nào.'}
                </p>
              )}
              {visible.map((item) => (
                <RequestCard
                  key={item.id}
                  item={item}
                  active={selected?.id === item.id}
                  showDecision={tab === 'HISTORY'}
                  onClick={() => {
                    setSelectedId(item.id);
                    setMessage(null);
                  }}
                />
              ))}
            </div>
          </aside>

          {/* Khung chi tiết bên phải: cuộn độc lập với danh sách */}
          <div
            className={`min-w-0 max-h-[calc(100vh-240px)] rounded-2xl border border-line bg-paper p-6 pr-5 shadow-[0_8px_24px_rgba(24,20,17,0.06)] ${CARD_LIST_SCROLL_CLASS}`}
          >
            {selected ? (
              <>
                {message && (
                  <p
                    role="status"
                    className={`mb-5 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium ${
                      message.type === 'success'
                        ? 'border-matcha/30 bg-matcha/10 text-matcha'
                        : 'border-[#f5c2bc] bg-[#fef2f0] text-danger'
                    }`}
                  >
                    {message.text}
                  </p>
                )}
                {tab === 'HISTORY' ? (
                  <HistoryDetail key={selected.id} item={selected} />
                ) : (
                  <DetailPanel key={selected.id} item={selected} busy={busy} onDecide={handleDecide} />
                )}
              </>
            ) : (
              <p className="text-sm text-muted">Chọn một yêu cầu để xem chi tiết.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
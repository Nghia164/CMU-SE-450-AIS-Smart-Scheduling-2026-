import { useEffect, useRef, useState } from 'react';
import { listConversations, sendMessage } from '../../services/manager/assistantService.js';
import { SUGGESTED_PROMPTS, WELCOME_MESSAGE } from '../../mock/manager/AssistantPage.mock.js';

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------
const PlusIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const SendIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" />
  </svg>
);
const SparkIcon = ({ className = 'h-3.5 w-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.5l1.9 5.7a2 2 0 001.26 1.26l5.7 1.9-5.7 1.9a2 2 0 00-1.26 1.26L12 20.2l-1.9-5.68a2 2 0 00-1.26-1.26L3.14 11.36l5.7-1.9A2 2 0 0010.1 8.2L12 2.5z" />
  </svg>
);

// ---------------------------------------------------------------------------
// Tiện ích
// ---------------------------------------------------------------------------
const MAX_INPUT_LENGTH = 500;
const timeFmt = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });

// Hiển thị giờ HH:MM
function formatTime(value) {
  return timeFmt.format(new Date(value));
}

// Hiển thị thời gian tương đối: "2 giờ trước", "Hôm qua"...
function formatRelativeTime(value) {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return new Date(value).toLocaleDateString('vi-VN');
}

// Tạo một tin nhắn mới cho state
function createMessage(role, text, at) {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    text,
    at: at || new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Trang Trợ lý AI — Giao diện Chatbot CHỈ ĐỌC
// ---------------------------------------------------------------------------
export default function AssistantPage() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messagesByConv, setMessagesByConv] = useState({}); // { [conversationId]: Message[] }
  const [input, setInput] = useState('');
  const [sendingConv, setSendingConv] = useState(null); // id hội thoại đang chờ AI trả lời
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null); // mốc cuộn xuống đáy khung chat
  const textareaRef = useRef(null);

  const activeMessages = messagesByConv[activeId] ?? [];
  const sending = sendingConv !== null;

  // Tải danh sách hội thoại mẫu và mở hội thoại đầu tiên (kèm lời chào của AI)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listConversations();
        if (cancelled) return;
        setConversations(list);
        if (list.length > 0) {
          setActiveId(list[0].id);
          setMessagesByConv((prev) => ({
            ...prev,
            [list[0].id]: [createMessage(WELCOME_MESSAGE.role, WELCOME_MESSAGE.text)],
          }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Tự động cuộn khung chat xuống đáy khi có tin nhắn mới / AI đang "suy nghĩ"
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [activeMessages.length, sendingConv, activeId]);

  // Chọn một hội thoại: nếu chưa có tin nhắn thì gắn lời chào mặc định của AI
  function handleSelectConversation(id) {
    if (id === activeId) return;
    setActiveId(id);
    setMessagesByConv((prev) =>
      prev[id] ? prev : { ...prev, [id]: [createMessage(WELCOME_MESSAGE.role, WELCOME_MESSAGE.text)] }
    );
  }

  // Tạo hội thoại mới (chỉ tạo hội thoại trên giao diện — không ghi dữ liệu hệ thống)
  function handleNewConversation() {
    const id = `conv-local-${Date.now()}`;
    setConversations((prev) => [{ id, title: 'Hội thoại mới', updatedAt: new Date().toISOString() }, ...prev]);
    setMessagesByConv((prev) => ({ ...prev, [id]: [createMessage(WELCOME_MESSAGE.role, WELCOME_MESSAGE.text)] }));
    setActiveId(id);
  }

  // Gửi tin nhắn (dùng cho cả ô nhập và các chip gợi ý nhanh)
  async function handleSend(promptText) {
    const text = (typeof promptText === 'string' ? promptText : input).trim();
    if (!text || sendingConv !== null || !activeId) return;

    const convId = activeId;
    // 1) Thêm tin nhắn của người dùng ngay lập tức
    setMessagesByConv((prev) => ({ ...prev, [convId]: [...(prev[convId] ?? []), createMessage('user', text)] }));
    // 2) Đặt tiêu đề hội thoại mới theo câu hỏi đầu tiên
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId && c.title === 'Hội thoại mới'
          ? { ...c, title: text.length > 42 ? `${text.slice(0, 42)}…` : text }
          : c
      )
    );
    // 3) Xóa ô nhập + reset chiều cao textarea
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setSendingConv(convId);

    try {
      // 4) Chờ AI "suy nghĩ" rồi thêm câu trả lời
      const { reply, replyAt } = await sendMessage(convId, text);
      setMessagesByConv((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] ?? []), createMessage(WELCOME_MESSAGE.role, reply, replyAt)],
      }));
      // 5) Cập nhật thời gian + đưa hội thoại có hoạt động mới lên đầu
      setConversations((prev) =>
        [...prev.map((c) => (c.id === convId ? { ...c, updatedAt: replyAt } : c))].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        )
      );
    } catch (err) {
      setMessagesByConv((prev) => ({
        ...prev,
        [convId]: [
          ...(prev[convId] ?? []),
          createMessage(WELCOME_MESSAGE.role, 'Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.'),
        ],
      }));
    } finally {
      setSendingConv(null);
    }
  }

  // Giới hạn 500 ký tự + tự giãn chiều cao textarea
  function handleInputChange(e) {
    setInput(e.target.value.slice(0, MAX_INPUT_LENGTH));
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  // Enter để gửi, Shift + Enter để xuống dòng
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <section className="p-8">
      {/* Header */}
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-amber">Trợ lý AI</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Trợ lý AI</h1>
        <p className="mt-1 text-sm text-muted">
          Chatbot phân tích lịch làm, chấm công và chi phí của cửa hàng. AI chỉ đọc dữ liệu, không thể tạo hoặc sửa.
        </p>
      </div>

      {/* Bố cục 2 cột: panel hội thoại + khung chat */}
      <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        {/* Cột trái: Danh sách hội thoại */}
        <aside className="flex h-[calc(100vh-320px)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
          <div className="flex items-center justify-between gap-2 border-b border-line bg-white px-4 py-3">
            <h2 className="font-display text-base font-semibold text-ink">Hội thoại</h2>
            <button
              type="button"
              onClick={handleNewConversation}
              className="flex items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-crema transition-colors hover:bg-amber hover:text-white"
            >
              <PlusIcon /> Hội thoại mới
            </button>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-2 [scrollbar-width:thin]">
            {loading && <p className="px-3 py-6 text-center text-xs text-muted">Đang tải hội thoại...</p>}
            {!loading && conversations.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-muted">Chưa có hội thoại nào.</p>
            )}
            {conversations.map((c) => {
              const isActive = c.id === activeId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectConversation(c.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    isActive ? 'border-amber/40 bg-amber/10' : 'border-transparent hover:bg-crema'
                  }`}
                >
                  <p className={`truncate text-[13px] font-medium ${isActive ? 'text-amber' : 'text-ink'}`}>{c.title}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted">{formatRelativeTime(c.updatedAt)}</p>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Cột phải: Khung chat */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
          {/* Header khung chat */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-white px-5 py-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber">
              AI chỉ đọc — không thể sửa dữ liệu
            </span>
            <span className="flex items-center gap-2 font-mono text-[11px] text-muted">
              <span className="h-2 w-2 animate-pulse rounded-full bg-matcha" />
              OR-Tools Insight · trực tuyến
            </span>
          </div>

          {/* Vùng tin nhắn */}
          <div className="h-[calc(100vh-320px)] min-h-[420px] overflow-y-auto bg-crema/40 px-5 py-5 [scrollbar-width:thin]">
            {activeMessages.length === 0 ? (
              /* Empty state khi hội thoại trống */
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/10 text-amber">
                  <SparkIcon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink">Trợ lý AI sẵn sàng</h3>
                <p className="max-w-sm text-sm leading-relaxed text-muted">
                  Tôi có thể đọc và phân tích dữ liệu lịch làm, chấm công và chi phí của cửa hàng.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {activeMessages.map((m) => {
                  const isUser = m.role === 'user';
                  return (
                    <div key={m.id} className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber/10 text-amber">
                          <SparkIcon />
                        </div>
                      )}
                      <div className={`flex max-w-[78%] flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`animate-in fade-in slide-in-from-bottom-1 px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                            isUser
                              ? 'rounded-2xl rounded-br-sm bg-amber text-white'
                              : 'rounded-2xl rounded-tl-sm border border-line bg-paper text-ink'
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="font-mono text-[10px] text-muted">{formatTime(m.at)}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator: AI đang "suy nghĩ" */}
                {sendingConv === activeId && (
                  <div className="flex items-end gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber/10 text-amber">
                      <SparkIcon />
                    </div>
                    <div className="animate-in fade-in rounded-2xl rounded-tl-sm border border-line bg-paper px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted/70"
                            style={{ animationDelay: `${i * 150}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} className="h-px shrink-0" />
              </div>
            )}
          </div>

          {/* Vùng nhập: gợi ý nhanh + ô nhập + nút gửi */}
          <div className="border-t border-line bg-white px-5 py-4">
            {/* Gợi ý nhanh (chip cuộn ngang) */}
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={sending}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap rounded-full border border-line bg-paper px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-amber/60 hover:bg-amber/10 hover:text-amber disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Ô nhập + nút gửi */}
            <div className="flex items-end gap-3 rounded-2xl border-[1.5px] border-line bg-paper px-4 py-2.5 transition-all focus-within:border-amber focus-within:shadow-[0_0_0_4px_rgba(217,107,39,0.16)]">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi về lịch làm, chấm công, chi phí..."
                className="max-h-[120px] flex-1 resize-none bg-transparent py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none"
              />
              <div className="flex items-center gap-2.5 pb-1">
                <span className="font-mono text-[10px] text-muted">
                  {input.length}/{MAX_INPUT_LENGTH}
                </span>
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={sending || !input.trim()}
                  title="Gửi tin nhắn"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber text-white transition-colors hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

# 🤖 LỆNH THỰC THI CHO AGENT ZCODE (SMART SCHEDULING FRONTEND)

**Tên dự án:** Smart Scheduling (Web & Mobile cho nhân sự ngành F&B).
**Vai trò của bạn (ZCode):** Senior React Frontend Developer kiêm UI/UX Expert.
**Nhiệm vụ:** Viết code hoàn thiện toàn bộ Frontend. Bạn phải đọc kỹ cấu trúc Database, tuân thủ nghiêm ngặt số lượng file/page đã khởi tạo, áp dụng "taste skill" để tạo ra UI tuyệt đẹp, và làm việc theo đúng lộ trình đã chia.

---

## 💾 1. HIỂU BẢN CHẤT DỮ LIỆU (BẮT BUỘC ĐỌC DATABASE SCHEMA)

Trước khi code bất kỳ file Mock hay UI nào, bạn **phải phân tích Database Schema** để hiểu mối quan hệ của các thực thể cốt lõi:
1. **Users & Employees:** Bảng `users` (Role: ADMIN, MANAGER, STAFF), `employees` (Loại: FULL_TIME, PART_TIME), `positions` (Ca trưởng, Barista, Phục vụ...), `skills` (Level 1-5), `employment_contracts`.
2. **Scheduling Engine:** Bảng `operating_hours`, `availability_entries` (Lịch rảnh của Staff), `shifts` (Ca mẫu: Sáng, Chiều, Tối), `shift_requirements` (Số lượng + Vị trí/Kỹ năng cần cho ca), `schedules` (Bản nháp/Chính thức), `schedule_assignments`.
3. **Requests:** Bảng `leave_requests` (Xin nghỉ), `shift_swap_requests` (Đổi ca), `open_shifts` (Ca mở do thiếu người - giành quyền nhận ca First-come-first-served).
4. **Attendance:** Bảng `attendance_records` (Check-in/out qua GPS Geofence 100m), `timesheets` (Bảng công tự động tính giờ thường + tăng ca).

---

## 🎨 2. QUY TẮC LẬP TRÌNH & UI/UX TASTE (STRICT REQUIREMENTS)

1. **Nguyên tắc "1 Page = 1 UI = Bộ 3 File":**
   Số lượng giao diện (UI) tạo ra **phải bằng chính xác** số page đang có trong thư mục `src/pages`.
   Khi nhận lệnh làm 1 trang (VD: `ShiftsPage`), bạn PHẢI output chính xác 3 file:
   - `src/mock/<role>/<PageName>.mock.js`: Data giả lập bám sát Database. Phải có ít nhất **20-30 bản ghi** (tên thuần Việt) để thể hiện UI có dữ liệu thực tế.
   - `src/services/<role>/<pageName>Service.js`: Hàm `async` gọi mock data, dùng `setTimeout` giả lập API.
   - `src/pages/<role>/<PageName>.jsx`: UI Component chính.

2. **Áp dụng "Taste Skill" (Đỉnh cao UI/UX):**
   - **BẮT BUỘC SỬA LẠI TRANG ĐĂNG NHẬP (`LoginPage.jsx`):** Phải thiết kế lại cực kỳ tinh tế, hiện đại, mang đậm phong cách hệ thống F&B cao cấp. Sử dụng gradient mượt mà, glassmorphism (hiệu ứng kính mờ), background pattern, và các animation chuyển động tinh tế.
   - **BỎ QUA:** Không cần làm trang Thông tin cá nhân (`ProfilePage`).
   - Kế thừa bộ màu: Nền (`bg-crema`, `bg-paper`, `bg-roast`), Chữ (`text-ink`, `text-muted`), Nhấn mạnh (`text-amber`), Trạng thái (`text-matcha`, `text-danger`).
   - Các bảng dữ liệu (Table) **BẮT BUỘC phải có Pagination (Phân trang tối đa 10 items/trang)**, có nút số trang/Trang trước/Trang sau để thao tác.
   - Các Form thêm/sửa phải dùng **Slide-in Modal** (trượt mượt mà từ cạnh phải màn hình sang).

---

## 🚀 3. LỘ TRÌNH THỰC THI (ROADMAP)

Bạn hãy thực thi các Task dưới đây theo đúng thứ tự. **Bắt buộc làm xong Phase 1 mới được chuyển sang Phase 2, rồi mới tới Phase 3.**

### 🟣 PHASE 0: UI/UX REVAMP
- [ ] **Task 0.1: Redesign `LoginPage.jsx`**
  - Dùng toàn bộ "Taste Skill" để làm lại trang đăng nhập cực đẹp, sáng tạo, chuyên nghiệp.

### 🟡 PHASE 1: MANAGER PAGES (Hoàn thiện 6 trang còn lại)
*(Lưu ý: Manager có tổng cộng 11 trang. 5 trang Dashboard, Scheduling, Requests, Payroll, Employees đã làm xong. Chỉ làm 6 trang dưới đây)*

- [ ] **Task 1.1: `ShiftsPage` (Quản lý ca làm)**
  - UI: Bảng quản lý `shifts` và cấu hình `shift_requirements`.
- [ ] **Task 1.2: `OpenShiftsPage` (Quản lý ca mở)**
  - UI: Danh sách `open_shifts`. Xem danh sách nhân sự đủ kỹ năng & rảnh để đẩy thông báo mời nhận ca.
- [ ] **Task 1.3: `AttendancePage` (Chấm công)**
  - UI: Đối chiếu `schedule_assignments` và `attendance_records`. Cho phép Manager sửa giờ nếu có lý do audit.
- [ ] **Task 1.4: `TimesheetsPage` (Xem bảng công)**
  - UI: Bảng `timesheets` tổng hợp giờ thường/tăng ca từ Attendance để duyệt.
- [ ] **Task 1.5: `ReportsPage` (Báo cáo vận hành)**
  - UI: Giao diện trích xuất PDF/Excel cho Lịch làm, Chấm công, Chi phí.
- [ ] **Task 1.6: `AssistantPage` (Trợ lý AI)**
  - UI: Giao diện Chatbot tư vấn, giải thích số liệu. (AI chỉ đọc, không có quyền sửa dữ liệu).

### 🔵 PHASE 2: STAFF PAGES (8 Trang - Giao diện Web Prototype Mobile)
*(Staff dùng Mobile App, nên bọc UI của Staff trong container max-width: 480px, đổ bóng, căn giữa màn hình)*

- [ ] **Task 2.1: `HomePage` (Trang chủ)**
  - UI: Hiển thị ca làm tiếp theo, thông báo mới nhất.
- [ ] **Task 2.2: `SchedulePage` (Lịch làm của tôi)**
  - UI: Xem `schedules` cá nhân dạng lịch tuần (chỉ hiện lịch đã PUBLISHED).
- [ ] **Task 2.3: `AvailabilityPage` (Đăng ký lịch rảnh)**
  - UI: Chọn `availability_entries` từ T2-CN.
- [ ] **Task 2.4: `OpenShiftsPage` (Nhận ca mở)**
  - UI: List `open_shifts` hợp lệ. Nút "Nhận ca" (First-come-first-served).
- [ ] **Task 2.5: `SwapPage` (Đổi ca)**
  - UI: Tạo `shift_swap_requests` gửi đồng nghiệp và quản lý.
- [ ] **Task 2.6: `LeavePage` (Xin nghỉ phép)**
  - UI: Form tạo `leave_requests`.
- [ ] **Task 2.7: `AttendancePage` (Chấm công)**
  - UI: Nút Check-in/Check-out GPS to, rõ ràng. Xem lịch sử điểm danh.
- [ ] **Task 2.8: `TimesheetsPage` (Xem bảng công)**
  - UI: Xem tổng giờ công đã duyệt trong kỳ.

### 🔴 PHASE 3: ADMIN PAGES (4 Trang - Quản trị hệ thống)
*(Admin quản lý cấp hệ thống, không nhúng tay vào việc xếp lịch cửa hàng)*

- [ ] **Task 3.1: `AccountsPage` (Quản lý tài khoản)**
  - UI: Bảng `users`. Chỉ Vô hiệu hóa, KHÔNG xóa cứng để giữ lịch sử.
- [ ] **Task 3.2: `AccessPage` (Phân quyền truy cập)**
  - UI: Giao diện cấp Role.
- [ ] **Task 3.3: `HealthPage` (Trạng thái dịch vụ)**
  - UI: Dashboard monitor Laravel, SQL Server, Redis, OR-Tools, AI.
- [ ] **Task 3.4: `SettingsPage` (Cài đặt)**
  - UI: Setup biến hệ thống (Geofence 100m, Deadline nộp lịch rảnh).

---

## ⚡ 4. QUY TRÌNH NHẬN LỆNH CỦA BẠN (ZCODE)
Khi người dùng ra lệnh (VD: *"Làm cho tôi Task 0.1 và Task 1.1"*), bạn BẮT BUỘC:
1. Đọc lại mô tả Task và Schema Database.
2. Generate ĐẦY ĐỦ code cho **3 file** (Mock, Service, JSX).
3. Đảm bảo UI đạt đỉnh cao thẩm mỹ, mọi bảng dữ liệu **phải có phân trang (Pagination tối đa 10 items)**. Không bao giờ được cắt xén code.
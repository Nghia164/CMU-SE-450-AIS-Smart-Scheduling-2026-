// File này là trang Tổng quan (Dashboard) của Manager: lấy dữ liệu qua service, hiển thị chỉ số, lịch 30 nhân viên, biểu đồ và ca thiếu người.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext.jsx';
import { getDashboardStats } from '../../services/manager/dashboardService.js';

// Các ngày trong tuần hiển thị ở đầu bảng lịch.
const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

// Màu nền và chữ cho từng ca, lấy từ theme của dự án.
const SHIFT_STYLE = {
  Sáng: 'bg-amber/10 text-amber',
  Chiều: 'bg-matcha/10 text-matcha',
  Tối: 'bg-ink/10 text-ink',
};
const DEFAULT_SHIFT_STYLE = 'bg-oat text-muted';

// Màu biểu đồ: đúng giờ, đi trễ, ngoài khu vực.
const ATTENDANCE_COLORS = ['#4f9d6e', '#e8a045', '#d9644f'];

// Thông số trục và lưới dùng chung cho các biểu đồ cột.
const AXIS_TICK = { fill: '#6e645b', fontSize: 12 };
const GRID_COLOR = '#dfd5c5';

// Component này hiển thị một khối nội dung có tiêu đề và mô tả nhỏ.
function Card({ title, subtitle, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-line bg-paper p-5 shadow-[0_8px_24px_rgba(24,20,17,0.06)] ${className}`}>
      <div className="mb-4">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// Component này hiển thị một thẻ số liệu gồm nhãn, giá trị và ghi chú; có thể bấm để chuyển trang nếu có đường dẫn.
function StatCard({ label, value, note, accent, to, noteTone = 'text-muted' }) {
  const content = (
    <>
      <span className={`block h-1 w-8 rounded-full ${accent}`} />
      <p className="mt-3 text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
      <p className={`mt-1 text-xs ${noteTone}`}>{note}</p>
    </>
  );

  const className =
    'block rounded-2xl border border-line bg-paper p-4 shadow-[0_8px_24px_rgba(24,20,17,0.06)] transition-colors';

  if (to) {
    return (
      <Link to={to} className={`${className} hover:border-amber/50`}>
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}

// Component này là trang Tổng quan: lấy dữ liệu qua service, hiển thị đang tải, lỗi hoặc nội dung đầy đủ.
export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getDashboardStats()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setError('Không tải được dữ liệu tổng quan.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <div className="p-8 text-sm text-danger">{error}</div>;
  }
  if (!data) {
    return <div className="p-8 text-sm text-muted">Đang tải dữ liệu...</div>;
  }

  const { stats } = data;

  return (
    <div className="space-y-5 p-8">
      <header className="rounded-2xl bg-roast px-7 py-6 text-crema shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-amber">Tổng quan</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Xin chào, {user.fullName}</h1>
        <p className="mt-1 text-sm text-crema/60">{data.weekLabel}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Tổng nhân viên"
          value={stats.totalEmployees}
          note={`${stats.newEmployees} người mới`}
          accent="bg-amber"
          to="/manager/employees"
        />
        <StatCard
          label="Đã đăng ký lịch rảnh"
          value={stats.availabilityRegistered}
          note="Tuần này"
          accent="bg-matcha"
          to="/manager/scheduling"
        />
        <StatCard
          label="Yêu cầu chờ duyệt"
          value={stats.pendingRequests}
          note="Nghỉ phép & đổi ca"
          accent="bg-ink"
          to="/manager/requests"
        />
        <StatCard
          label="Ca thiếu nhân viên"
          value={data.understaffed.length}
          note="Cần xử lý"
          accent="bg-danger"
          noteTone="text-danger"
          to="/manager/open-shifts"
        />
        <StatCard
          label="Tỷ lệ đi làm"
          value={`${stats.attendanceRate}%`}
          note="Tháng này"
          accent="bg-matcha"
          to="/manager/attendance"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card
          title="Lịch làm việc tuần"
          subtitle={`Xem nhanh ca của ${data.schedule.length} nhân viên (cuộn để xem thêm)`}
          className="xl:col-span-2"
        >
          <div className="max-h-[340px] overflow-auto pr-1 [scrollbar-width:thin]">
            <table className="w-full min-w-[620px] border-separate border-spacing-1">
              <thead className="sticky top-0 z-10 bg-paper">
                <tr>
                  <th className="w-48 p-1 text-left text-xs font-medium text-muted">Nhân viên</th>
                  {DAYS.map((day) => (
                    <th key={day} className="p-1 text-center text-xs font-medium text-muted">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.schedule.map((row) => (
                  <tr key={row.employee}>
                    <td className="p-1 text-xs font-medium text-ink">{row.employee}</td>
                    {row.shifts.map((shift, i) => (
                      <td
                        key={i}
                        className={`rounded-md px-2 py-2 text-center text-xs font-medium ${
                          shift ? SHIFT_STYLE[shift] ?? DEFAULT_SHIFT_STYLE : 'bg-crema text-line'
                        }`}
                      >
                        {shift ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Trợ lý AI" subtitle="Hỗ trợ quản lý ca làm" className="flex flex-col">
          <ul className="flex-1 space-y-2.5 text-sm text-ink">
            <li className="flex gap-2">
              <span className="text-amber">•</span>Đề xuất nhân viên thay ca
            </li>
            <li className="flex gap-2">
              <span className="text-amber">•</span>Tóm tắt tình hình chấm công
            </li>
            <li className="flex gap-2">
              <span className="text-amber">•</span>Phân tích dữ liệu làm việc
            </li>
          </ul>
          <Link
            to="/manager/assistant"
            className="mt-5 block rounded-xl bg-ink py-2.5 text-center text-sm font-semibold text-crema transition-colors hover:bg-amber hover:text-white"
          >
            Bắt đầu trò chuyện
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Số ca theo ngày" subtitle="Tuần này">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.shiftsPerDay}>
                <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="day" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} width={28} />
                <Tooltip cursor={{ fill: '#f6f1e7' }} />
                <Bar dataKey="shifts" name="Số ca" fill="#d96b27" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Giờ làm theo nhân viên" subtitle="Tuần này">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hoursPerEmployee} layout="vertical">
                <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
                <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={110} />
                <Tooltip cursor={{ fill: '#f6f1e7' }} />
                <Bar dataKey="hours" name="Giờ" fill="#2d7a4d" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Tình hình chấm công" subtitle="Tháng này">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.attendance}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.attendance.map((_, i) => (
                    <Cell key={i} fill={ATTENDANCE_COLORS[i % ATTENDANCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-muted">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Ca thiếu nhân viên" subtitle="Cần tạo ca mở để tìm người thay">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 font-medium">Ngày</th>
                <th className="py-2 font-medium">Ca</th>
                <th className="py-2 font-medium">Cần</th>
                <th className="py-2 font-medium">Đã xếp</th>
                <th className="py-2 font-medium">Thiếu</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {data.understaffed.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-b-0">
                  <td className="py-3 text-ink">{row.date}</td>
                  <td className="py-3 text-ink">{row.shift}</td>
                  <td className="py-3 text-ink">{row.required}</td>
                  <td className="py-3 text-ink">{row.assigned}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger">
                      Thiếu {row.missing}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Link to="/manager/open-shifts" className="text-sm font-semibold text-amber hover:underline">
                      Tạo ca mở
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
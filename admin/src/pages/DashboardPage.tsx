import React from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../api';

// Mock data for when API is not connected
const MOCK_USER_GROWTH = [
  { date: '14/07', users: 45 },
  { date: '15/07', users: 82 },
  { date: '16/07', users: 67 },
  { date: '17/07', users: 120 },
  { date: '18/07', users: 98 },
  { date: '19/07', users: 155 },
  { date: '20/07', users: 143 },
];

const MOCK_PROVINCES = [
  { _id: 'TP. Hồ Chí Minh', count: 4523 },
  { _id: 'Hà Nội', count: 3892 },
  { _id: 'Quảng Ninh', count: 2341 },
  { _id: 'Quảng Nam', count: 1987 },
  { _id: 'Kiên Giang', count: 1654 },
  { _id: 'Lâm Đồng', count: 1432 },
];

const MOCK_STATS = {
  totalUsers: 28547,
  totalPlaces: 5234,
  totalReviews: 89432,
  totalPosts: 45678,
  totalCheckIns: 234567,
  pendingReports: 12,
  newUsersToday: 143,
  newPlacesToday: 23,
};

const STAT_CARDS = [
  { key: 'totalUsers', label: 'Tổng người dùng', emoji: '👥', color: '#4299E1', bg: 'rgba(66, 153, 225, 0.15)' },
  { key: 'totalPlaces', label: 'Địa điểm', emoji: '📍', color: '#48BB78', bg: 'rgba(72, 187, 120, 0.15)' },
  { key: 'totalReviews', label: 'Đánh giá', emoji: '⭐', color: '#FFD700', bg: 'rgba(255, 215, 0, 0.15)' },
  { key: 'totalCheckIns', label: 'Check-in', emoji: '✅', color: '#00C9B1', bg: 'rgba(0, 201, 177, 0.15)' },
  { key: 'totalPosts', label: 'Bài đăng', emoji: '📸', color: '#9F7AEA', bg: 'rgba(159, 122, 234, 0.15)' },
  { key: 'pendingReports', label: 'Báo cáo chờ', emoji: '🚩', color: '#FC4F62', bg: 'rgba(252, 79, 98, 0.15)' },
  { key: 'newUsersToday', label: 'User hôm nay', emoji: '🆕', color: '#FF6B35', bg: 'rgba(255, 107, 53, 0.15)' },
  { key: 'newPlacesToday', label: 'Địa điểm hôm nay', emoji: '🌟', color: '#48BB78', bg: 'rgba(72, 187, 120, 0.15)' },
];

const customTooltipStyle = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  color: 'var(--text-primary)',
  fontSize: 13,
};

export default function DashboardPage() {
  const { data: statsData } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data.data),
    retry: false,
  });

  const stats = statsData?.stats || MOCK_STATS;
  const userGrowth = statsData?.userGrowth?.map((item: { _id: string; count: number }) => ({
    date: item._id,
    users: item.count,
  })) || MOCK_USER_GROWTH;
  const topProvinces = statsData?.topProvinces || MOCK_PROVINCES;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Tổng quan hệ thống</h2>
          <p className="page-subtitle">Dữ liệu cập nhật theo thời gian thực</p>
        </div>
        <button className="btn btn-primary">
          📊 Xuất báo cáo
        </button>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="stat-card">
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              {card.emoji}
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: card.color }}>
                {(stats[card.key as keyof typeof MOCK_STATS] || 0).toLocaleString('vi-VN')}
              </div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-change up">↑ 12% so với tuần trước</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* User growth chart */}
        <div className="chart-card">
          <div className="chart-title">📈 Tăng trưởng người dùng (7 ngày qua)</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#718096" fontSize={12} />
              <YAxis stroke="#718096" fontSize={12} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Area type="monotone" dataKey="users" stroke="#FF6B35" strokeWidth={2} fill="url(#userGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top provinces */}
        <div className="chart-card">
          <div className="chart-title">🗺️ Top tỉnh thành check-in</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProvinces} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="#718096" fontSize={11} />
              <YAxis type="category" dataKey="_id" stroke="#718096" fontSize={11} width={100} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="count" fill="#00C9B1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent activity */}
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">🔔 Hoạt động gần đây</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Loại</th>
              <th>Nội dung</th>
              <th>Người dùng</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {[
              { type: '📍 Check-in', content: 'Vịnh Hạ Long', user: 'Minh Phương', time: '2 phút trước', status: 'success' },
              { type: '⭐ Review', content: 'Phố cổ Hội An', user: 'Thùy Dương', time: '8 phút trước', status: 'success' },
              { type: '🚩 Báo cáo', content: 'Post vi phạm', user: 'Hoàng Nam', time: '15 phút trước', status: 'warning' },
              { type: '👤 Đăng ký', content: 'Tài khoản mới', user: 'Linh Nguyễn', time: '32 phút trước', status: 'info' },
              { type: '📍 Địa điểm', content: 'Núi Bà Đen mới', user: 'Admin', time: '1 giờ trước', status: 'primary' },
            ].map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{row.type}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{row.content}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>👤</div>
                    {row.user}
                  </div>
                </td>
                <td style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{row.time}</td>
                <td>
                  <span className={`badge badge-${row.status}`}>
                    {row.status === 'success' ? 'Thành công' : row.status === 'warning' ? 'Cần xem' : row.status === 'info' ? 'Mới' : 'Hoạt động'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

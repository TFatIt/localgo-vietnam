import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const MONTHLY_DATA = [
  { month: 'T1', users: 1200, places: 45, checkins: 8900 },
  { month: 'T2', users: 1800, places: 62, checkins: 12400 },
  { month: 'T3', users: 2400, places: 78, checkins: 15600 },
  { month: 'T4', users: 3100, places: 95, checkins: 21000 },
  { month: 'T5', users: 2800, places: 88, checkins: 18900 },
  { month: 'T6', users: 4200, places: 120, checkins: 28000 },
  { month: 'T7', users: 5100, places: 145, checkins: 35000 },
];

const CATEGORY_DATA = [
  { name: 'Biển', value: 2345, color: '#00B4D8' },
  { name: 'Núi', value: 1890, color: '#4CAF50' },
  { name: 'Di tích', value: 1234, color: '#9C27B0' },
  { name: 'Cà phê', value: 987, color: '#FF5722' },
  { name: 'Cắm trại', value: 678, color: '#8BC34A' },
  { name: 'Khác', value: 456, color: '#607D8B' },
];

const tooltipStyle = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  color: 'var(--text-primary)',
  fontSize: 13,
};

export default function AnalyticsPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Phân tích & Thống kê</h2>
          <p className="page-subtitle">Dữ liệu tổng hợp về hoạt động nền tảng</p>
        </div>
        <button className="btn btn-primary">📊 Xuất PDF</button>
      </div>

      {/* Growth chart */}
      <div className="chart-card">
        <div className="chart-title">📈 Tăng trưởng 7 tháng qua</div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={MONTHLY_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="#718096" fontSize={12} />
            <YAxis stroke="#718096" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#FF6B35" strokeWidth={2.5} dot={{ fill: '#FF6B35', r: 4 }} name="Người dùng" />
            <Line type="monotone" dataKey="checkins" stroke="#00C9B1" strokeWidth={2.5} dot={{ fill: '#00C9B1', r: 4 }} name="Check-in" />
            <Line type="monotone" dataKey="places" stroke="#9F7AEA" strokeWidth={2.5} dot={{ fill: '#9F7AEA', r: 4 }} name="Địa điểm mới" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Check-in by month bar */}
        <div className="chart-card">
          <div className="chart-title">📍 Check-in theo tháng</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={MONTHLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#718096" fontSize={12} />
              <YAxis stroke="#718096" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="checkins" fill="#00C9B1" radius={[6, 6, 0, 0]} name="Check-in" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="chart-card">
          <div className="chart-title">🎯 Phân bố danh mục địa điểm</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={CATEGORY_DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {CATEGORY_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPIs */}
      <div className="chart-card" style={{ marginTop: 16 }}>
        <div className="chart-title">🎯 KPI Tháng 7</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'DAU (Daily Active Users)', value: '2,847', target: '3,000', progress: 95, color: '#FF6B35' },
            { label: 'Retention Rate 7 ngày', value: '68%', target: '70%', progress: 97, color: '#00C9B1' },
            { label: 'Review Rate', value: '12%', target: '15%', progress: 80, color: '#9F7AEA' },
            { label: 'Check-in Rate', value: '34%', target: '35%', progress: 97, color: '#FFD700' },
          ].map((kpi) => (
            <div key={kpi.label} style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>{kpi.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>Mục tiêu: {kpi.target}</div>
              <div style={{ marginTop: 8, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${kpi.progress}%`, height: '100%', background: kpi.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

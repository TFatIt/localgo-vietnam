import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const MOCK_USERS = [
  { _id: '1', displayName: 'Minh Phương', email: 'minh@example.com', role: 'user', points: 1520, level: 3, isActive: true, createdAt: '2024-01-15', visitedProvincesCount: 12 },
  { _id: '2', displayName: 'Thùy Dương', email: 'duong@example.com', role: 'user', points: 980, level: 2, isActive: true, createdAt: '2024-02-20', visitedProvincesCount: 8 },
  { _id: '3', displayName: 'Hoàng Nam', email: 'nam@example.com', role: 'business', points: 450, level: 1, isActive: false, createdAt: '2024-03-05', visitedProvincesCount: 3 },
  { _id: '4', displayName: 'Linh Nguyễn', email: 'linh@example.com', role: 'user', points: 2340, level: 4, isActive: true, createdAt: '2023-12-10', visitedProvincesCount: 25 },
  { _id: '5', displayName: 'Văn Đức', email: 'duc@example.com', role: 'admin', points: 5000, level: 5, isActive: true, createdAt: '2023-11-01', visitedProvincesCount: 45 },
];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => api.get('/admin/users', {
      params: { search, role: roleFilter !== 'all' ? roleFilter : undefined }
    }).then((r) => r.data),
    retry: false,
  });

  const users = data?.data || MOCK_USERS;

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/status`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const roleColors: Record<string, string> = {
    admin: 'primary', business: 'warning', user: 'info',
  };

  const roleLabels: Record<string, string> = {
    admin: '👑 Admin', business: '🏢 Doanh nghiệp', user: '👤 Người dùng',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Quản lý người dùng</h2>
          <p className="page-subtitle">{users.length.toLocaleString('vi-VN')} người dùng trong hệ thống</p>
        </div>
        <button className="btn btn-primary">📥 Xuất danh sách</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="search-input"
          placeholder="🔍 Tìm kiếm tên, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-row" style={{ margin: 0 }}>
          {['all', 'user', 'business', 'admin'].map((role) => (
            <button
              key={role}
              className={`filter-chip ${roleFilter === role ? 'active' : ''}`}
              onClick={() => setRoleFilter(role)}
            >
              {role === 'all' ? 'Tất cả' : roleLabels[role]}
            </button>
          ))}
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Điểm / Level</th>
              <th>Tỉnh đã đến</th>
              <th>Ngày tham gia</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: Record<string, unknown>) => (
              <tr key={user._id as string}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {user.avatar ? (
                      <img src={user.avatar as string} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                    )}
                    <span style={{ fontWeight: 600 }}>{user.displayName as string}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{user.email as string}</td>
                <td>
                  <span className={`badge badge-${roleColors[user.role as string] || 'info'}`}>
                    {roleLabels[user.role as string] || user.role as string}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--accent)' }}>🏅 {(user.points as number || 0).toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Level {user.level as number || 1}</div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>🗺️ {user.visitedProvincesCount as number || 0}</span>
                </td>
                <td style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                  {new Date(user.createdAt as string).toLocaleDateString('vi-VN')}
                </td>
                <td>
                  <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                    {user.isActive ? '✅ Hoạt động' : '🚫 Bị khóa'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-ghost'}`}
                      onClick={() => toggleMutation.mutate(user._id as string)}
                    >
                      {user.isActive ? '🚫 Khóa' : '✅ Mở'}
                    </button>
                    <button className="btn btn-ghost btn-sm">✏️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <span className="page-info">Hiển thị 1-{users.length} trong {users.length} kết quả</span>
          <button className="page-btn">‹</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">›</button>
        </div>
      </div>
    </div>
  );
}

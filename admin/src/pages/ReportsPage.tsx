import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const MOCK_REPORTS = [
  { _id: '1', reporterId: { displayName: 'Minh Phương', email: 'minh@ex.com' }, targetType: 'post', reason: 'Nội dung spam', details: 'Bài đăng này là quảng cáo không phù hợp', status: 'pending', createdAt: '2024-07-20T10:00:00Z' },
  { _id: '2', reporterId: { displayName: 'Thùy Dương', email: 'duong@ex.com' }, targetType: 'review', reason: 'Đánh giá giả mạo', details: 'Review này không trung thực', status: 'reviewed', createdAt: '2024-07-19T15:30:00Z' },
  { _id: '3', reporterId: { displayName: 'Hoàng Nam', email: 'nam@ex.com' }, targetType: 'user', reason: 'Vi phạm cộng đồng', details: 'Tài khoản có hành vi quấy rối', status: 'pending', createdAt: '2024-07-19T08:00:00Z' },
];

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['admin-reports', statusFilter],
    queryFn: () => api.get('/admin/reports', {
      params: { status: statusFilter !== 'all' ? statusFilter : undefined }
    }).then((r) => r.data),
    retry: false,
  });

  const reports = data?.data || MOCK_REPORTS;

  const resolveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/reports/${id}`, { status, resolution: 'Đã xử lý bởi admin' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  });

  const targetTypeLabels: Record<string, string> = {
    post: '📸 Bài đăng',
    review: '⭐ Review',
    user: '👤 Người dùng',
    place: '📍 Địa điểm',
    comment: '💬 Bình luận',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Quản lý báo cáo</h2>
          <p className="page-subtitle">{reports.filter((r: Record<string, unknown>) => r.status === 'pending').length} báo cáo đang chờ xử lý</p>
        </div>
      </div>

      <div className="filter-row">
        {['all', 'pending', 'reviewed', 'resolved', 'dismissed'].map((s) => (
          <button
            key={s}
            className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'all' ? 'Tất cả' : s === 'pending' ? '⏳ Chờ xử lý' : s === 'reviewed' ? '👀 Đang xem' : s === 'resolved' ? '✅ Đã giải quyết' : '🚫 Bỏ qua'}
          </button>
        ))}
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Người báo cáo</th>
              <th>Đối tượng</th>
              <th>Lý do</th>
              <th>Chi tiết</th>
              <th>Ngày báo cáo</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report: Record<string, unknown>) => {
              const reporter = report.reporterId as Record<string, unknown>;
              return (
                <tr key={report._id as string}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{reporter?.displayName as string}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{reporter?.email as string}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {targetTypeLabels[report.targetType as string] || report.targetType as string}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{report.reason as string}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 200 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                      {report.details as string}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                    {new Date(report.createdAt as string).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <span className={`badge ${
                      report.status === 'pending' ? 'badge-warning'
                      : report.status === 'resolved' ? 'badge-success'
                      : report.status === 'dismissed' ? 'badge-error'
                      : 'badge-info'
                    }`}>
                      {report.status === 'pending' ? '⏳ Chờ xử lý' : report.status === 'reviewed' ? '👀 Đang xem' : report.status === 'resolved' ? '✅ Đã xử lý' : '🚫 Bỏ qua'}
                    </span>
                  </td>
                  <td>
                    {report.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => resolveMutation.mutate({ id: report._id as string, status: 'resolved' })}
                        >✅ Xử lý</button>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => resolveMutation.mutate({ id: report._id as string, status: 'dismissed' })}
                        >🚫 Bỏ</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

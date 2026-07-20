import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

const MOCK_PLACES = [
  { _id: '1', name: 'Vịnh Hạ Long', province: 'Quảng Ninh', category: 'national_park', communityRating: 4.9, reviewCount: 1520, checkinCount: 15420, isVerified: true, isActive: true, isHiddenGem: false, isTrending: true, createdAt: '2024-01-10' },
  { _id: '2', name: 'Phố cổ Hội An', province: 'Quảng Nam', category: 'historical', communityRating: 4.8, reviewCount: 1230, checkinCount: 12300, isVerified: true, isActive: true, isHiddenGem: false, isTrending: true, createdAt: '2024-01-15' },
  { _id: '3', name: 'Ruộng bậc thang Mù Cang Chải', province: 'Yên Bái', category: 'mountain', communityRating: 4.8, reviewCount: 780, checkinCount: 7800, isVerified: false, isActive: true, isHiddenGem: true, isTrending: false, createdAt: '2024-02-20' },
  { _id: '4', name: 'Đảo Phú Quốc', province: 'Kiên Giang', category: 'beach', communityRating: 4.8, reviewCount: 1120, checkinCount: 11200, isVerified: true, isActive: true, isHiddenGem: false, isTrending: true, createdAt: '2024-01-05' },
];

const CATEGORY_LABELS: Record<string, string> = {
  beach: '🏖️ Biển',
  mountain: '⛰️ Núi',
  national_park: '🌿 Vườn QG',
  historical: '🏛️ Di tích',
  camping: '⛺ Cắm trại',
  cafe: '☕ Cà phê',
  restaurant: '🍜 Ăn uống',
  waterfall: '💦 Thác nước',
  village: '🏘️ Làng',
};

export default function PlacesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['admin-places', search, categoryFilter],
    queryFn: () => api.get('/admin/places', {
      params: { search, category: categoryFilter !== 'all' ? categoryFilter : undefined }
    }).then((r) => r.data),
    retry: false,
  });

  const places = data?.data || MOCK_PLACES;

  const verifyMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/places/${id}/verify`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-places'] }),
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Quản lý địa điểm</h2>
          <p className="page-subtitle">{places.length} địa điểm trong hệ thống</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost">📥 Xuất CSV</button>
          <button className="btn btn-primary">➕ Thêm địa điểm</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="search-input"
          placeholder="🔍 Tìm địa điểm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-row" style={{ margin: 0 }}>
          {['all', ...Object.keys(CATEGORY_LABELS)].slice(0, 6).map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'all' ? 'Tất cả' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Địa điểm</th>
              <th>Tỉnh thành</th>
              <th>Danh mục</th>
              <th>Đánh giá</th>
              <th>Check-in</th>
              <th>Trạng thái</th>
              <th>Ngày thêm</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {places.map((place: Record<string, unknown>) => (
              <tr key={place._id as string}>
                <td>
                  <div style={{ fontWeight: 600 }}>{place.name as string}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {place.isHiddenGem ? '💎 Hidden Gem' : ''} {place.isTrending ? '🔥 Trending' : ''}
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>📍 {place.province as string}</td>
                <td>
                  <span className="badge badge-info">
                    {CATEGORY_LABELS[place.category as string] || place.category as string}
                  </span>
                </td>
                <td>
                  <span style={{ color: '#FFD700', fontWeight: 700 }}>
                    ⭐ {(place.communityRating as number || 0).toFixed(1)}
                  </span>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{place.reviewCount as number || 0} review</div>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                  {(place.checkinCount as number || 0).toLocaleString('vi-VN')}
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span className={`badge ${place.isVerified ? 'badge-success' : 'badge-warning'}`}>
                      {place.isVerified ? '✅ Đã xác minh' : '⏳ Chờ xác minh'}
                    </span>
                    <span className={`badge ${place.isActive ? 'badge-info' : 'badge-error'}`}>
                      {place.isActive ? 'Hoạt động' : 'Đã ẩn'}
                    </span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                  {new Date(place.createdAt as string).toLocaleDateString('vi-VN')}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {!(place.isVerified as boolean) && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => verifyMutation.mutate(place._id as string)}
                      >
                        ✅ Xác minh
                      </button>
                    )}
                    <button className="btn btn-ghost btn-sm">✏️</button>
                    <button className="btn btn-danger btn-sm">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span className="page-info">1 - {places.length} của {places.length}</span>
          <button className="page-btn active">1</button>
        </div>
      </div>
    </div>
  );
}

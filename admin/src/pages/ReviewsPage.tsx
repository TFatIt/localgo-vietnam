import React from 'react';
export default function ReviewsPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Quản lý đánh giá</h2>
          <p className="page-subtitle">Kiểm duyệt và quản lý review từ cộng đồng</p>
        </div>
      </div>
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">📋 Danh sách đánh giá</div>
          <input className="search-input" placeholder="🔍 Tìm đánh giá..." />
        </div>
        <table>
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Địa điểm</th>
              <th>Đánh giá</th>
              <th>Nội dung</th>
              <th>Hữu ích</th>
              <th>Ngày</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {[
              { user: 'Minh Phương', place: 'Vịnh Hạ Long', rating: 5, body: 'Cảnh đẹp tuyệt vời, nhất định phải đến một lần!', helpful: 34, date: '20/07/2024', status: 'visible' },
              { user: 'Thùy Dương', place: 'Hội An', rating: 4, body: 'Rất đẹp nhưng hơi đông khách du lịch vào cuối tuần.', helpful: 12, date: '19/07/2024', status: 'visible' },
              { user: 'Unknown User', place: 'Đà Lạt', rating: 1, body: 'Spam content here...', helpful: 0, date: '18/07/2024', status: 'hidden' },
            ].map((review, i) => (
              <tr key={i}>
                <td><span style={{ fontWeight: 600 }}>{review.user}</span></td>
                <td style={{ color: 'var(--text-secondary)' }}>📍 {review.place}</td>
                <td><span style={{ color: '#FFD700', fontWeight: 700 }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 200 }}>{review.body}</td>
                <td style={{ color: 'var(--secondary)', textAlign: 'center', fontWeight: 600 }}>👍 {review.helpful}</td>
                <td style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{review.date}</td>
                <td><span className={`badge ${review.status === 'visible' ? 'badge-success' : 'badge-error'}`}>{review.status === 'visible' ? '✅ Hiển thị' : '🚫 Ẩn'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm">👁️</button>
                    <button className="btn btn-danger btn-sm">🚫</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

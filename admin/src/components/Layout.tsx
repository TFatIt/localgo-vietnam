import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '📊', label: 'Tổng quan' },
  { path: '/users', icon: '👥', label: 'Người dùng' },
  { path: '/places', icon: '📍', label: 'Địa điểm' },
  { path: '/reviews', icon: '⭐', label: 'Đánh giá' },
  { path: '/reports', icon: '🚩', label: 'Báo cáo', badge: '3' },
  { path: '/analytics', icon: '📈', label: 'Phân tích' },
];

interface LayoutProps { children: React.ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const getPageTitle = () => {
    const item = NAV_ITEMS.find((i) => i.path === location.pathname);
    return item?.label || 'LocalGo Admin';
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">🗺️</span>
          <div>
            <div className="sidebar-logo-text">LocalGo Vietnam</div>
            <div className="sidebar-logo-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu chính</div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}

          <div className="nav-section-label" style={{ marginTop: 16 }}>Hệ thống</div>
          <div className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span>Cài đặt</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">🔔</span>
            <span>Thông báo</span>
          </div>
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF6B35, #E55A28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>👤</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Admin</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>admin@localgo.vn</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {/* Top bar */}
        <div className="topbar">
          <h1 className="topbar-title">{getPageTitle()}</h1>
          <div className="topbar-right">
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <div className="topbar-avatar">👤</div>
          </div>
        </div>

        {/* Page content */}
        <div className="page">
          {children}
        </div>
      </main>
    </div>
  );
}

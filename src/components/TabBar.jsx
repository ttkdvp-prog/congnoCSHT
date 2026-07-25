import React from 'react';
import { LayoutDashboard, Flame, CheckCircle, Table, BarChart2 } from 'lucide-react';

export default function TabBar({ activeTab, onTabChange, counts }) {
  const tabs = [
    {
      id: 'overview',
      label: 'Tổng Quan & Phân Tích',
      icon: LayoutDashboard,
      badge: null,
      color: '#3b82f6'
    },
    {
      id: 'priceIncrease',
      label: 'Trạm Tăng Giá 2026',
      icon: Flame,
      badge: `${counts.tangGia} trạm`,
      color: '#f59e0b'
    },
    {
      id: 'payments',
      label: 'Thanh Toán & Nợ Tồn',
      icon: CheckCircle,
      badge: `${counts.paid} đã TT • ${counts.debt} nợ tồn`,
      color: '#10b981'
    },
    {
      id: 'allStations',
      label: 'Danh Sách CSHT Toàn Bộ',
      icon: Table,
      badge: `${counts.total} trạm`,
      color: '#8b5cf6'
    }
  ];

  return (
    <nav className="glass-panel" style={{ padding: '0.5rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: isActive ? `1px solid ${tab.color}` : '1px solid transparent',
              background: isActive ? `${tab.color}20` : 'transparent',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease shadow'
            }}
          >
            <Icon size={18} style={{ color: isActive ? tab.color : 'var(--text-muted)' }} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span 
                className="badge" 
                style={{ 
                  background: isActive ? `${tab.color}30` : 'var(--bg-surface)', 
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.75rem'
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

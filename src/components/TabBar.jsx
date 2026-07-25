import React from 'react';
import { LayoutDashboard, Flame, AlertCircle, Clock, CheckCircle2, Table } from 'lucide-react';

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
      id: 'debt2025',
      label: 'Còn Nợ Tồn 2025',
      icon: AlertCircle,
      badge: `${counts.debt2025} trạm`,
      color: '#ef4444'
    },
    {
      id: 'unpaid2026',
      label: 'Chưa TT & Nợ 2026',
      icon: Clock,
      badge: `${counts.unpaid2026} trạm`,
      color: '#f97316'
    },
    {
      id: 'paid2026',
      label: 'Đã TT Đủ 2026',
      icon: CheckCircle2,
      badge: `${counts.paid2026} trạm`,
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
              gap: '0.55rem',
              padding: '0.6rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              border: isActive ? `1px solid ${tab.color}` : '1px solid transparent',
              background: isActive ? `${tab.color}20` : 'transparent',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Icon size={17} style={{ color: isActive ? tab.color : 'var(--text-muted)' }} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span 
                className="badge" 
                style={{ 
                  background: isActive ? `${tab.color}30` : 'var(--bg-surface)', 
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.725rem',
                  padding: '0.15rem 0.5rem'
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

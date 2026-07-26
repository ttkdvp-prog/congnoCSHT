import { LayoutDashboard, PlusCircle, Flame, AlertCircle, Clock, CheckCircle2, Table, Layers, UploadCloud } from 'lucide-react';

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
      id: 'uploadPayment',
      label: 'Upload Số Liệu (Sheet Up)',
      icon: UploadCloud,
      badge: 'Excel Up',
      color: '#06b6d4'
    },
    {
      id: 'addPriceIncrease',
      label: 'Nhập Trạm Tăng Giá',
      icon: PlusCircle,
      badge: counts.tangGia ? `${counts.tangGia} trạm` : null,
      color: '#f59e0b'
    },
    {
      id: 'priceIncrease',
      label: 'Trạm Tăng Giá 2026',
      icon: Flame,
      badge: `${counts.tangGia} trạm`,
      color: '#eab308'
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
    <nav className="sidebar-nav glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', height: 'fit-content' }}>
      
      {/* Sidebar Section Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.6rem 0.75rem 0.6rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '0.35rem',
        color: 'var(--text-muted)',
        fontSize: '0.725rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
      }}>
        <Layers size={14} style={{ color: '#3b82f6' }} />
        <span>CHUYÊN MỤC BÁO CÁO</span>
      </div>

      {/* Tabs List */}
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
              justifyContent: 'space-between',
              gap: '0.6rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: isActive ? `1px solid ${tab.color}` : '1px solid transparent',
              background: isActive ? `${tab.color}22` : 'transparent',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              width: '100%',
              textAlign: 'left',
              boxShadow: isActive ? `0 4px 12px ${tab.color}25` : 'none'
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1 }}>
              <Icon size={18} style={{ color: isActive ? tab.color : 'var(--text-muted)', flexShrink: 0 }} />
              <span className="tab-label-text" style={{ textAlign: 'left' }}>{tab.label}</span>
            </div>
            {tab.badge && (
              <span 
                className="badge" 
                style={{ 
                  background: isActive ? `${tab.color}40` : 'rgba(255,255,255,0.08)', 
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  flexShrink: 0,
                  marginLeft: '0.35rem'
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

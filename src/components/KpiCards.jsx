import React from 'react';
import { Database, TrendingUp, AlertTriangle, CheckCircle, DollarSign, ArrowUpRight } from 'lucide-react';

export default function KpiCards({ stats, onSelectPriceIncreaseOnly }) {
  const formatMoney = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const cards = [
    {
      title: 'TỔNG SỐ TRẠM CSHT',
      value: stats.totalStations.toLocaleString('vi-VN'),
      sub: `Thuộc ${stats.totalToHaTang} Tổ Hạ Tầng • ${stats.totalSites} Sites`,
      icon: Database,
      accent: 'var(--accent-blue)',
    },
    {
      title: 'SỐ TRẠM TĂNG GIÁ 2026',
      value: stats.tangGiaCount.toLocaleString('vi-VN') + ' trạm',
      sub: `Chiếm ${((stats.tangGiaCount / (stats.totalStations || 1)) * 100).toFixed(1)}% tổng số trạm`,
      icon: TrendingUp,
      accent: 'var(--accent-amber)',
      onClick: onSelectPriceIncreaseOnly,
      highlight: true
    },
    {
      title: 'TỔNG TIỀN TĂNG THÊM / THÁNG',
      value: formatMoney(stats.totalTangGiaAmount),
      sub: `Chênh lệch trung bình: ${formatMoney(stats.tangGiaCount ? stats.totalTangGiaAmount / stats.tangGiaCount : 0)} / trạm`,
      icon: ArrowUpRight,
      accent: 'var(--accent-rose)',
    },
    {
      title: 'TỔNG ĐƠN GIÁ 2026 (CHƯA VAT)',
      value: formatMoney(stats.totalDonGia2026),
      sub: `Năm 2025: ${formatMoney(stats.totalDonGia2025)}`,
      icon: DollarSign,
      accent: 'var(--accent-purple)',
    },
    {
      title: 'CÒN NỢ TỒN 2025 (15/04/2026)',
      value: formatMoney(stats.totalNo2025Ton),
      sub: `Đã trả 2025: ${formatMoney(stats.total2025DaTra)}`,
      icon: AlertTriangle,
      accent: 'var(--accent-rose)',
    },
    {
      title: 'ĐÃ THANH TOÁN 2026 (ĐẾN 31/03)',
      value: formatMoney(stats.totalDaThanhToan2026),
      sub: `Số tháng có thanh toán: ${stats.avgSoThangTT.toFixed(1)} tháng/trạm`,
      icon: CheckCircle,
      accent: 'var(--accent-emerald)',
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    }}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx} 
            className="glass-panel kpi-card" 
            style={{ 
              '--card-accent': card.accent,
              cursor: card.onClick ? 'pointer' : 'default',
              border: card.highlight ? '1px solid rgba(245, 158, 11, 0.4)' : undefined
            }}
            onClick={card.onClick}
          >
            <div className="kpi-title">
              <Icon size={18} style={{ color: card.accent }} />
              <span>{card.title}</span>
            </div>
            <div className="kpi-value" style={{ color: card.highlight ? '#fbbf24' : 'var(--text-main)' }}>
              {card.value}
            </div>
            <div className="kpi-sub">
              {card.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}

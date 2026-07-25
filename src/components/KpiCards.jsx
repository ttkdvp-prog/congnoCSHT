import React from 'react';
import { Database, TrendingUp, AlertTriangle, CheckCircle, DollarSign, ArrowUpRight } from 'lucide-react';

export default function KpiCards({ stats, onSelectPriceIncreaseOnly, onSelectPaidOnly, onSelectDebtOnly, activeFilter }) {
  const formatMoney = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const cards = [
    {
      title: 'TỔNG SỐ TRẠM CSHT',
      value: stats.totalStations.toLocaleString('vi-VN') + ' trạm',
      sub: `Thuộc ${stats.totalToHaTang} Tổ Hạ Tầng • ${stats.totalSites} Sites`,
      icon: Database,
      accent: 'var(--accent-blue)',
    },
    {
      title: 'SỐ TRẠM TĂNG GIÁ 2026',
      value: stats.tangGiaCount.toLocaleString('vi-VN') + ' trạm',
      sub: `Chiếm ${((stats.tangGiaCount / (stats.totalStations || 1)) * 100).toFixed(1)}% tổng trạm`,
      icon: TrendingUp,
      accent: 'var(--accent-amber)',
      onClick: onSelectPriceIncreaseOnly,
      highlight: activeFilter === 'priceIncrease'
    },
    {
      title: 'TRẠM ĐÃ THANH TOÁN 2026',
      value: stats.paidCount.toLocaleString('vi-VN') + ' trạm',
      sub: `Tổng tiền đã TT: ${formatMoney(stats.totalDaThanhToan2026)}`,
      icon: CheckCircle,
      accent: 'var(--accent-emerald)',
      onClick: onSelectPaidOnly,
      highlight: activeFilter === 'paid'
    },
    {
      title: 'TRẠM CÒN NỢ TỒN 2025',
      value: stats.debtCount.toLocaleString('vi-VN') + ' trạm',
      sub: `Tổng nợ tồn: ${formatMoney(stats.totalNo2025Ton)}`,
      icon: AlertTriangle,
      accent: 'var(--accent-rose)',
      onClick: onSelectDebtOnly,
      highlight: activeFilter === 'debt'
    },
    {
      title: 'TỔNG TIỀN TĂNG THÊM / THÁNG',
      value: formatMoney(stats.totalTangGiaAmount),
      sub: `Chênh lệch TB: ${formatMoney(stats.tangGiaCount ? stats.totalTangGiaAmount / stats.tangGiaCount : 0)} / trạm`,
      icon: ArrowUpRight,
      accent: 'var(--accent-purple)',
    },
    {
      title: 'TỔNG ĐƠN GIÁ 2026 (CHƯA VAT)',
      value: formatMoney(stats.totalDonGia2026),
      sub: `Năm 2025: ${formatMoney(stats.totalDonGia2025)}`,
      icon: DollarSign,
      accent: 'var(--accent-cyan)',
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
              border: card.highlight ? `1px solid ${card.accent}` : undefined,
              boxShadow: card.highlight ? `0 0 15px ${card.accent}40` : undefined
            }}
            onClick={card.onClick}
          >
            <div className="kpi-title">
              <Icon size={18} style={{ color: card.accent }} />
              <span>{card.title}</span>
            </div>
            <div className="kpi-value" style={{ color: card.highlight ? card.accent : 'var(--text-main)' }}>
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

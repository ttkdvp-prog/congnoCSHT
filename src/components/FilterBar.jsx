import React from 'react';
import { Search, Filter, RotateCcw, Flame, CheckCircle, AlertTriangle } from 'lucide-react';

export default function FilterBar({
  filters,
  onChange,
  onReset,
  toHaTangOptions,
  siteOptions,
  phapLyOptions,
  thoiDiemOptions,
  totalFiltered,
  totalAll
}) {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      
      {/* Top Header & Search Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
          <Filter size={18} style={{ color: 'var(--accent-blue)' }} />
          <span>BỘ LỌC TÌM KIẾM & BÁO CÁO CSHT</span>
          <span className="badge badge-blue">
            {totalFiltered} / {totalAll} trạm
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Quick Toggle: Only Price Increase */}
          <button
            type="button"
            onClick={() => onChange('chiTangGia', !filters.chiTangGia)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              border: filters.chiTangGia ? '1px solid #f59e0b' : '1px solid var(--border-color)',
              background: filters.chiTangGia ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-surface)',
              color: filters.chiTangGia ? '#fbbf24' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Flame size={15} style={{ color: filters.chiTangGia ? '#fbbf24' : 'var(--text-muted)' }} />
            <span>Chỉ trạm tăng giá</span>
          </button>

          {/* Quick Toggle: Paid */}
          <button
            type="button"
            onClick={() => onChange('ttStatus', filters.ttStatus === 'paid' ? '' : 'paid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              border: filters.ttStatus === 'paid' ? '1px solid #10b981' : '1px solid var(--border-color)',
              background: filters.ttStatus === 'paid' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-surface)',
              color: filters.ttStatus === 'paid' ? '#34d399' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <CheckCircle size={15} style={{ color: filters.ttStatus === 'paid' ? '#34d399' : 'var(--text-muted)' }} />
            <span>Đã thanh toán</span>
          </button>

          {/* Quick Toggle: Debt */}
          <button
            type="button"
            onClick={() => onChange('ttStatus', filters.ttStatus === 'unpaid' ? '' : 'unpaid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              border: filters.ttStatus === 'unpaid' ? '1px solid #f43f5e' : '1px solid var(--border-color)',
              background: filters.ttStatus === 'unpaid' ? 'rgba(244, 63, 94, 0.2)' : 'var(--bg-surface)',
              color: filters.ttStatus === 'unpaid' ? '#fda4af' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <AlertTriangle size={15} style={{ color: filters.ttStatus === 'unpaid' ? '#fda4af' : 'var(--text-muted)' }} />
            <span>Còn nợ tồn</span>
          </button>

          <button className="btn btn-secondary" onClick={onReset} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
            <RotateCcw size={14} />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>

      {/* Grid Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.875rem'
      }}>
        
        {/* Search Keyword */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-control"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Tìm Mã CSHT, Tên, Chủ HĐ..."
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
          />
        </div>

        {/* Trạng thái Thanh Toán */}
        <div>
          <select
            className="input-control"
            value={filters.ttStatus}
            onChange={(e) => onChange('ttStatus', e.target.value)}
          >
            <option value="">-- Trạng thái Thanh toán --</option>
            <option value="paid">Đã thanh toán 2026</option>
            <option value="unpaid">Còn nợ tồn 2025 / Chưa TT</option>
          </select>
        </div>

        {/* Tổ Hạ Tầng */}
        <div>
          <select
            className="input-control"
            value={filters.toHaTang}
            onChange={(e) => onChange('toHaTang', e.target.value)}
          >
            <option value="">-- Tất cả Tổ Hạ Tầng --</option>
            {toHaTangOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Site */}
        <div>
          <select
            className="input-control"
            value={filters.site}
            onChange={(e) => onChange('site', e.target.value)}
          >
            <option value="">-- Tất cả Site --</option>
            {siteOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Tình trạng pháp lý */}
        <div>
          <select
            className="input-control"
            value={filters.tinhTrangPhapLy}
            onChange={(e) => onChange('tinhTrangPhapLy', e.target.value)}
          >
            <option value="">-- Tất cả Pháp Lý --</option>
            {phapLyOptions.map(opt => (
              <option key={opt} value={opt}>{opt || '(Chưa xác định)'}</option>
            ))}
          </select>
        </div>

        {/* Khoảng tiền tăng giá */}
        <div>
          <select
            className="input-control"
            value={filters.khoangTangGia}
            onChange={(e) => onChange('khoangTangGia', e.target.value)}
          >
            <option value="">-- Mức tăng giá --</option>
            <option value="under500k">Dưới 500.000 ₫</option>
            <option value="500k_1m">500.000 ₫ - 1.000.000 ₫</option>
            <option value="over1m">Trên 1.000.000 ₫</option>
          </select>
        </div>

      </div>

    </div>
  );
}

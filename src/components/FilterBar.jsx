import React from 'react';
import { Search, Filter, RotateCcw, Flame } from 'lucide-react';

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Quick Toggle: Only Price Increase */}
          <button
            type="button"
            onClick={() => onChange('chiTangGia', !filters.chiTangGia)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: filters.chiTangGia ? '1px solid #f59e0b' : '1px solid var(--border-color)',
              background: filters.chiTangGia ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-surface)',
              color: filters.chiTangGia ? '#fbbf24' : 'var(--text-secondary)',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Flame size={16} style={{ color: filters.chiTangGia ? '#fbbf24' : 'var(--text-muted)' }} />
            <span>Chỉ trạm tăng giá</span>
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.875rem'
      }}>
        
        {/* Search Keyword */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-control"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Tìm theo Mã CSHT, Tên, Chủ HĐ..."
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
          />
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
            <option value="">-- Mức tăng giá (Chênh lệch) --</option>
            <option value="under500k">Dưới 500.000 ₫/tháng</option>
            <option value="500k_1m">Từ 500.000 ₫ - 1.000.000 ₫</option>
            <option value="over1m">Trên 1.000.000 ₫/tháng</option>
          </select>
        </div>

        {/* Thời điểm / Tháng tăng giá */}
        <div>
          <select
            className="input-control"
            value={filters.thoiDiemTangGia}
            onChange={(e) => onChange('thoiDiemTangGia', e.target.value)}
          >
            <option value="">-- Thời điểm / Đề xuất T5,T6,T7 --</option>
            {thoiDiemOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

      </div>

    </div>
  );
}

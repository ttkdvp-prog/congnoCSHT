import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Flame, Calculator } from 'lucide-react';

export default function EditPriceModal({ station, isOpen, onClose, onSave, isSaving }) {
  if (!isOpen || !station) return null;

  const [formData, setFormData] = useState({
    donGia2025: station.donGia2025 || 0,
    donGia2026: station.donGia2026 || 0,
    chenhLechDonGia: station.chenhLechDonGia || 0,
    deXuatT5: station.deXuatT5 || 0,
    deXuatT6: station.deXuatT6 || 0,
    deXuatT7: station.deXuatT7 || 0,
    thoiDiemTangGia: station.thoiDiemTangGia || '',
    baoCaoVTT: station.baoCaoVTT || 'Chưa làm văn bản báo cáo',
    ghiChu: station.ghiChu || ''
  });

  useEffect(() => {
    if (station) {
      setFormData({
        donGia2025: station.donGia2025 || 0,
        donGia2026: station.donGia2026 || 0,
        chenhLechDonGia: station.chenhLechDonGia || (station.donGia2026 - station.donGia2025),
        deXuatT5: station.deXuatT5 || 0,
        deXuatT6: station.deXuatT6 || 0,
        deXuatT7: station.deXuatT7 || 0,
        thoiDiemTangGia: station.thoiDiemTangGia || '',
        baoCaoVTT: station.baoCaoVTT || 'Chưa làm văn bản báo cáo',
        ghiChu: station.ghiChu || ''
      });
    }
  }, [station]);

  const handleDonGia2026Change = (val) => {
    const newPrice = parseFloat(val) || 0;
    const diff = newPrice - (formData.donGia2025 || 0);
    setFormData(prev => ({
      ...prev,
      donGia2026: newPrice,
      chenhLechDonGia: diff > 0 ? diff : 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...station,
      ...formData,
      isTangGia: formData.chenhLechDonGia > 0 || formData.donGia2026 > formData.donGia2025 || !!formData.thoiDiemTangGia
    });
  };

  const formatMoney = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
              <Flame size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                CẬP NHẬT TRẠM TĂNG GIÁ: {station.maCSHT}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Tên: {station.tenCSHT} • {station.toHaTang}
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            
            {/* Đơn giá cũ 2025 (read-only) */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Đơn giá 2025 (Chưa VAT):
              </label>
              <input
                type="text"
                className="input-control"
                disabled
                value={formatMoney(formData.donGia2025)}
                style={{ opacity: 0.7, background: 'rgba(0,0,0,0.3)' }}
              />
            </div>

            {/* Đơn giá mới 2026 */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24', display: 'block', marginBottom: '0.35rem' }}>
                Đơn giá mới 2026 (Chưa VAT):
              </label>
              <input
                type="number"
                className="input-control"
                value={formData.donGia2026}
                onChange={(e) => handleDonGia2026Change(e.target.value)}
                placeholder="Nhập đơn giá mới..."
                style={{ borderColor: '#fbbf24' }}
              />
            </div>

          </div>

          {/* Chênh lệch tăng giá (calculated) */}
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#fbbf24' }}>
              <Calculator size={18} />
              <span>Số tiền tăng giá (Chênh lệch 2026 - 2025):</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24' }}>
              +{formatMoney(formData.chenhLechDonGia)} / tháng
            </div>
          </div>

          {/* Proposal Months */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Đề xuất tăng T5:
              </label>
              <input
                type="number"
                className="input-control"
                value={formData.deXuatT5}
                onChange={(e) => setFormData(p => ({ ...p, deXuatT5: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Đề xuất tăng T6:
              </label>
              <input
                type="number"
                className="input-control"
                value={formData.deXuatT6}
                onChange={(e) => setFormData(p => ({ ...p, deXuatT6: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Đề xuất tăng T7:
              </label>
              <input
                type="number"
                className="input-control"
                value={formData.deXuatT7}
                onChange={(e) => setFormData(p => ({ ...p, deXuatT7: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          {/* Thời điểm tăng giá */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Thời điểm áp dụng tăng giá (Ví dụ: T1-T6/2026, Từ 01/05/2026...):
            </label>
            <input
              type="text"
              className="input-control"
              value={formData.thoiDiemTangGia}
              onChange={(e) => setFormData(p => ({ ...p, thoiDiemTangGia: e.target.value }))}
              placeholder="Nhập thời điểm áp dụng..."
            />
          </div>

          {/* Báo cáo VTT */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Tiến độ Báo cáo VTT:
            </label>
            <input
              type="text"
              className="input-control"
              value={formData.baoCaoVTT}
              onChange={(e) => setFormData(p => ({ ...p, baoCaoVTT: e.target.value }))}
              placeholder="Chưa làm văn bản báo cáo / Đã làm văn bản báo cáo / VTT đồng ý..."
            />
          </div>

          {/* Ghi chú */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Ghi chú thêm:
            </label>
            <textarea
              className="input-control"
              rows={3}
              value={formData.ghiChu}
              onChange={(e) => setFormData(p => ({ ...p, ghiChu: e.target.value }))}
              placeholder="Nhập thông tin đàm phán, thỏa thuận tăng giá..."
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy bỏ
            </button>

            <button type="submit" className="btn btn-amber" disabled={isSaving}>
              {isSaving ? <Upload className="animate-spin" size={16} /> : <Save size={16} />}
              <span>{isSaving ? 'Đang đồng bộ...' : 'Lưu & Đồng bộ về Google Sheet'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

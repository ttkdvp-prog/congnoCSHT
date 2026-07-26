import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Building2, CreditCard, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export default function EditStationModal({ station, isOpen, onClose, onSave, isSaving }) {
  if (!isOpen || !station) return null;

  const [activeTab, setActiveTab] = useState('general'); // 'general', 'price', 'payment', 'bank'

  const [formData, setFormData] = useState({
    site: station.site || '',
    toHaTang: station.toHaTang || '',
    maCSHT: station.maCSHT || '',
    tenCSHT: station.tenCSHT || '',
    chuHopDong: station.chuHopDong || '',
    soHopDong: station.soHopDong || '',
    tinhTrangPhapLy: station.tinhTrangPhapLy || '',

    donGia2025: station.donGia2025 || 0,
    donGia2026: station.donGia2026 || 0,
    chenhLechDonGia: station.chenhLechDonGia || 0,
    deXuatT5: station.deXuatT5 || 0,
    deXuatT6: station.deXuatT6 || 0,
    deXuatT7: station.deXuatT7 || 0,
    thoiDiemTangGia: station.thoiDiemTangGia || '',

    tong2025DaTra: station.tong2025DaTra || 0,
    no2025Ton: station.no2025Ton || 0,
    daThanhToan2026Den313: station.daThanhToan2026Den313 || 0,
    ngayThanhToan: station.ngayThanhToan || '',

    nguoiThuHuong: station.nguoiThuHuong || '',
    soTaiKhoan: station.soTaiKhoan || '',
    tenNganHang: station.tenNganHang || '',
    ghiChu: station.ghiChu || ''
  });

  useEffect(() => {
    if (station) {
      setFormData({
        site: station.site || '',
        toHaTang: station.toHaTang || '',
        maCSHT: station.maCSHT || '',
        tenCSHT: station.tenCSHT || '',
        chuHopDong: station.chuHopDong || '',
        diaChiDoiTac: station.diaChiDoiTac || '',
        soHopDong: station.soHopDong || '',
        tinhTrangPhapLy: station.tinhTrangPhapLy || '',

        donGia2025: station.donGia2025 || 0,
        donGia2026: station.donGia2026 || 0,
        chenhLechDonGia: station.chenhLechDonGia || (station.donGia2026 && station.donGia2025 ? station.donGia2026 - station.donGia2025 : 0),
        deXuatT5: station.deXuatT5 || 0,
        deXuatT6: station.deXuatT6 || 0,
        deXuatT7: station.deXuatT7 || 0,
        thoiDiemTangGia: station.thoiDiemTangGia || '',

        tong2025DaTra: station.tong2025DaTra || 0,
        no2025Ton: station.no2025Ton || 0,
        daThanhToan2026Den313: station.daThanhToan2026Den313 || 0,
        ngayThanhToan: station.ngayThanhToan || '',

        nguoiThuHuong: station.nguoiThuHuong || '',
        soTaiKhoan: station.soTaiKhoan || '',
        tenNganHang: station.tenNganHang || '',
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
      isTangGia: formData.chenhLechDonGia > 0 || formData.donGia2026 > formData.donGia2025 || !!formData.thoiDiemTangGia,
      isDaThanhToan: formData.daThanhToan2026Den313 > 0 || (formData.no2025Ton === 0 && formData.tong2025DaTra > 0)
    });
  };

  const formatMoney = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                NHẬP LIỆU & CẬP NHẬT TRẠM CSHT: {station.maCSHT}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Tên trạm: {station.tenCSHT} • Dữ liệu sẽ tự động sửa trực tiếp trên Hệ Thống Dữ Liệu
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)', padding: '0 1rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              color: activeTab === 'general' ? '#60a5fa' : 'var(--text-secondary)',
              borderBottom: activeTab === 'general' ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            1. Thông Tin Trạm & HĐ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('price')}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              color: activeTab === 'price' ? '#fbbf24' : 'var(--text-secondary)',
              borderBottom: activeTab === 'price' ? '2px solid #f59e0b' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            2. Đơn Giá & Tăng Giá
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payment')}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              color: activeTab === 'payment' ? '#34d399' : 'var(--text-secondary)',
              borderBottom: activeTab === 'payment' ? '2px solid #10b981' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            3. Thanh Toán & Nợ Tồn
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              color: activeTab === 'bank' ? '#c084fc' : 'var(--text-secondary)',
              borderBottom: activeTab === 'bank' ? '2px solid #8b5cf6' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            4. Ngân Hàng & Ghi Chú
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', maxHeight: '65vh', overflowY: 'auto' }}>
          
          {/* TAB 1: General Info */}
          {activeTab === 'general' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Mã CSHT:
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.maCSHT}
                  onChange={(e) => setFormData(p => ({ ...p, maCSHT: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Tổ Hạ Tầng:
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.toHaTang}
                  onChange={(e) => setFormData(p => ({ ...p, toHaTang: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Tên CSHT / Trạm:
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.tenCSHT}
                  onChange={(e) => setFormData(p => ({ ...p, tenCSHT: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Site:
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.site}
                  onChange={(e) => setFormData(p => ({ ...p, site: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Chủ Hợp Đồng:
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.chuHopDong}
                  onChange={(e) => setFormData(p => ({ ...p, chuHopDong: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Địa Chỉ Đối Tác:
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.diaChiDoiTac}
                  onChange={(e) => setFormData(p => ({ ...p, diaChiDoiTac: e.target.value }))}
                  placeholder="Nhập địa chỉ của đối tác..."
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Số Hợp Đồng:
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.soHopDong}
                  onChange={(e) => setFormData(p => ({ ...p, soHopDong: e.target.value }))}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Tình Trạng Pháp Lý Hợp Đồng:
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.tinhTrangPhapLy}
                  onChange={(e) => setFormData(p => ({ ...p, tinhTrangPhapLy: e.target.value }))}
                  placeholder="Ví dụ: Thiếu bìa đất photo, Đã có HĐ..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: Price Info */}
          {activeTab === 'price' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Đơn Giá 2025 (Chưa VAT):
                  </label>
                  <input
                    type="number"
                    className="input-control"
                    value={formData.donGia2025}
                    onChange={(e) => {
                      const p25 = parseFloat(e.target.value) || 0;
                      const diff = (formData.donGia2026 || 0) - p25;
                      setFormData(prev => ({ ...prev, donGia2025: p25, chenhLechDonGia: diff > 0 ? diff : 0 }));
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24', display: 'block', marginBottom: '0.35rem' }}>
                    Đơn Giá Mới 2026 (Chưa VAT):
                  </label>
                  <input
                    type="number"
                    className="input-control"
                    value={formData.donGia2026}
                    onChange={(e) => handleDonGia2026Change(e.target.value)}
                    style={{ borderColor: '#fbbf24' }}
                  />
                </div>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: '#fbbf24', fontSize: '0.85rem' }}>Chênh lệch tăng giá (2026 - 2025):</span>
                <span style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1.1rem' }}>+{formatMoney(formData.chenhLechDonGia)}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Đề xuất T5:</label>
                  <input type="number" className="input-control" value={formData.deXuatT5} onChange={(e) => setFormData(p => ({ ...p, deXuatT5: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Đề xuất T6:</label>
                  <input type="number" className="input-control" value={formData.deXuatT6} onChange={(e) => setFormData(p => ({ ...p, deXuatT6: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Đề xuất T7:</label>
                  <input type="number" className="input-control" value={formData.deXuatT7} onChange={(e) => setFormData(p => ({ ...p, deXuatT7: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Thời Điểm Áp Dụng Tăng Giá:
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.thoiDiemTangGia}
                  onChange={(e) => setFormData(p => ({ ...p, thoiDiemTangGia: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* TAB 3: Payment Info */}
          {activeTab === 'payment' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-rose)', display: 'block', marginBottom: '0.35rem' }}>
                  Còn Nợ Tồn 2025 (15/4/2026):
                </label>
                <input
                  type="number"
                  className="input-control"
                  value={formData.no2025Ton}
                  onChange={(e) => setFormData(p => ({ ...p, no2025Ton: parseFloat(e.target.value) || 0 }))}
                  style={{ borderColor: 'var(--accent-rose)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#34d399', display: 'block', marginBottom: '0.35rem' }}>
                  Đã Thanh Toán 2026 (Đến 31/3):
                </label>
                <input
                  type="number"
                  className="input-control"
                  value={formData.daThanhToan2026Den313}
                  onChange={(e) => setFormData(p => ({ ...p, daThanhToan2026Den313: parseFloat(e.target.value) || 0 }))}
                  style={{ borderColor: '#10b981' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Tổng 2025 Đã Trả:
                </label>
                <input
                  type="number"
                  className="input-control"
                  value={formData.tong2025DaTra}
                  onChange={(e) => setFormData(p => ({ ...p, tong2025DaTra: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Ngày Thanh Toán:
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.ngayThanhToan}
                  onChange={(e) => setFormData(p => ({ ...p, ngayThanhToan: e.target.value }))}
                  placeholder="Ví dụ: T1-T3/2026"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Bank & Notes */}
          {activeTab === 'bank' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Tên Người Thụ Hưởng:
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.nguoiThuHuong}
                  onChange={(e) => setFormData(p => ({ ...p, nguoiThuHuong: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Số Tài Khoản:
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.soTaiKhoan}
                  onChange={(e) => setFormData(p => ({ ...p, soTaiKhoan: e.target.value }))}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Tên Ngân Hàng:
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.tenNganHang}
                  onChange={(e) => setFormData(p => ({ ...p, tenNganHang: e.target.value }))}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Ghi Chú Trạm:
                </label>
                <textarea
                  className="input-control"
                  rows={3}
                  value={formData.ghiChu}
                  onChange={(e) => setFormData(p => ({ ...p, ghiChu: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy bỏ
            </button>

            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? <Upload className="animate-spin" size={16} /> : <Save size={16} />}
              <span>{isSaving ? 'Đang cập nhật...' : 'Cập Nhật & Lưu Về Hệ Thống'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

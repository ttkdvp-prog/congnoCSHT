import React from 'react';
import { X, Building2, CreditCard, Calendar, FileText } from 'lucide-react';

export default function DetailModal({ station, isOpen, onClose }) {
  if (!isOpen || !station) return null;

  const formatMoney = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                CHI TIẾT HỢP ĐỒNG: {station.maCSHT}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Site: {station.site} • {station.toHaTang}
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
          
          {/* Section 1: Hợp đồng & Đối tác */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} />
              THÔNG TIN TRẠM & HỢP ĐỒNG THUÊ
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Tên CSHT:</strong> {station.tenCSHT}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Mã CSHT RIMS:</strong> {station.maCSHTRims || '-'}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Chủ Hợp Đồng:</strong> {station.chuHopDong}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Số Hợp Đồng:</strong> {station.soHopDong || '-'}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Ngày Ký:</strong> {station.ngayKy || '-'}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Ngày Tính Tiền:</strong> {station.ngayTinhTien || '-'}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Ngày Đáo Hạn:</strong> {station.ngayDaoHan || '-'}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Bàn Giao HĐ:</strong> {station.banGiaoHD || '-'}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Tình Trạng Pháp Lý:</strong> {station.tinhTrangPhapLy || 'Chưa cập nhật'}</div>
            </div>
          </div>

          {/* Section 2: Thông tin Tài khoản Ngân hàng */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={16} />
              THÔNG TIN THỤ HƯỞNG & THANH TOÁN
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Người Thụ Hưởng:</strong> {station.nguoiThuHuong || '-'}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Số Tài Khoản:</strong> {station.soTaiKhoan || '-'}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Tên Ngân Hàng:</strong> {station.tenNganHang || '-'}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Đã Trả 2025:</strong> {formatMoney(station.tong2025DaTra)}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Còn Nợ Tồn 2025:</strong> <span style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>{formatMoney(station.no2025Ton)}</span></div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Đã TT 2026 (đến 31/3):</strong> <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{formatMoney(station.daThanhToan2026Den313)}</span></div>
            </div>
          </div>

          {/* Section 3: Đơn giá & Điều chỉnh Tăng giá */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.75rem' }}>
              ĐƠN GIÁ & LỊCH SỬ TĂNG GIÁ
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.85rem' }}>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Đơn giá 2025 (chưa VAT):</strong> {formatMoney(station.donGia2025)}</div>
              <div><strong style={{ color: '#fbbf24' }}>Đơn giá mới 2026 (chưa VAT):</strong> {formatMoney(station.donGia2026)}</div>
              <div><strong style={{ color: '#fbbf24' }}>Mức Tăng/Chênh Lệch:</strong> +{formatMoney(station.chenhLechDonGia)}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Thời Điểm Tăng:</strong> {station.thoiDiemTangGia || '-'}</div>
              <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: 'var(--text-secondary)' }}>Ghi chú:</strong> {station.ghiChu || '-'}</div>
            </div>
          </div>

          {/* Section 4: Chi tiết thanh toán các tháng 2025 - 2026 */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} />
              CHI TIẾT PHÁT SINH THANH TOÁN 12 THÁNG NĂM 2026 (VNĐ)
            </h4>
            <div className="table-container">
              <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    {Array.from({ length: 12 }, (_, i) => `T${i + 1}`).map(m => (
                      <th key={m} style={{ textAlign: 'center' }}>{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {Array.from({ length: 12 }, (_, i) => `T${i + 1}`).map(m => (
                      <td key={m} style={{ textAlign: 'center', color: station.payments2026 && station.payments2026[m] > 0 ? '#34d399' : 'var(--text-muted)' }}>
                        {station.payments2026 && station.payments2026[m] > 0 ? formatMoney(station.payments2026[m]) : '-'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng cửa sổ
          </button>
        </div>

      </div>
    </div>
  );
}

import React from 'react';
import { Flame, Edit3, ArrowUpRight, FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function PriceIncreasePanel({ data, onEditStation, onExportPriceIncreaseExcel }) {
  const formatMoney = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const tangGiaList = data.filter(item => item.isTangGia);

  // Stats calculation
  const totalIncrease = tangGiaList.reduce((sum, item) => sum + (item.chenhLechDonGia || 0), 0);
  const avgIncrease = tangGiaList.length > 0 ? totalIncrease / tangGiaList.length : 0;
  
  // Breakdown by Tổ Hạ Tầng
  const toHaTangBreakdown = {};
  tangGiaList.forEach(item => {
    const key = item.toHaTang || 'Khác';
    if (!toHaTangBreakdown[key]) {
      toHaTangBreakdown[key] = { count: 0, totalAmount: 0 };
    }
    toHaTangBreakdown[key].count += 1;
    toHaTangBreakdown[key].totalAmount += (item.chenhLechDonGia || 0);
  });

  const sortedTopIncrease = [...tangGiaList]
    .sort((a, b) => (b.chenhLechDonGia || 0) - (a.chenhLechDonGia || 0))
    .slice(0, 8);

  const handleExport = () => {
    if (onExportPriceIncreaseExcel) {
      onExportPriceIncreaseExcel();
    } else {
      const exportRows = tangGiaList.map((item, idx) => ({
        'STT': idx + 1,
        'Site': item.site,
        'Tổ hạ tầng': item.toHaTang,
        'Mã CSHT': item.maCSHT,
        'Tên CSHT': item.tenCSHT,
        'Chủ hợp đồng': item.chuHopDong,
        'Số hợp đồng': item.soHopDong,
        'Đơn giá 2025': item.donGia2025,
        'Đơn giá 2026 / Mới': item.donGia2026,
        'Mức tăng giá (Chênh lệch)': item.chenhLechDonGia,
        'Thời điểm tăng giá': item.thoiDiemTangGia || 'Chưa xác định',
        'Đề xuất T5': item.deXuatT5,
        'Đề xuất T6': item.deXuatT6,
        'Đề xuất T7': item.deXuatT7,
        'Còn nợ tồn 2025': item.no2025Ton,
        'Đã TT 2026': item.daThanhToan2026Den313,
        'Số tháng nợ 2026': item.soThangNo2026,
        'Số tiền nợ 2026': item.no2026Ton,
        'Người thụ hưởng': item.nguoiThuHuong,
        'Số tài khoản': item.soTaiKhoan,
        'Tên ngân hàng': item.tenNganHang,
        'Tình trạng pháp lý': item.tinhTrangPhapLy,
        'Ghi chú': item.ghiChu
      }));

      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tram_Tang_Gia_2026');
      XLSX.writeFile(wb, `Danh_Sach_Tram_Tang_Gia_2026_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24'
          }}>
            <Flame size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24' }}>
              CHUYÊN MỤC QUẢN LÝ & CẬP NHẬT TRẠM TĂNG GIÁ ({tangGiaList.length} Trạm)
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Danh sách và thông tin chi tiết các trạm điều chỉnh đơn giá năm 2026
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-amber" 
            onClick={handleExport}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            title="Xuất file Excel danh sách các trạm tăng giá 2026"
          >
            <Download size={16} />
            <span>Xuất Excel Trạm Tăng Giá ({tangGiaList.length} Trạm)</span>
          </button>

          <div style={{ display: 'flex', gap: '1.5rem', background: 'var(--bg-surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TỔNG TIỀN TĂNG/THÁNG:</span>
              <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '1rem' }}>{formatMoney(totalIncrease)}</div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MỨC TĂNG TRUNG BÌNH:</span>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>{formatMoney(avgIncrease)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Breakdown by Tổ Hạ Tầng */}
        <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={16} style={{ color: 'var(--accent-amber)' }} />
            PHÂN BỔ TRẠM TĂNG GIÁ THEO TỔ HẠ TẦNG
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {Object.entries(toHaTangBreakdown).map(([toHT, info]) => (
              <div key={toHT} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0.6rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }}>
                <span style={{ fontWeight: 500 }}>{toHT}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-amber">{info.count} trạm</span>
                  <span style={{ fontWeight: 600, color: '#fbbf24', minWidth: '100px', textAlign: 'right' }}>{formatMoney(info.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 8 Highest Increase Stations & Quick Edit */}
        <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowUpRight size={16} style={{ color: 'var(--accent-rose)' }} />
            TOP TRẠM CÓ MỨC TĂNG GIÁ CAO NHẤT (CLICK ĐỂ SỬA)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {sortedTopIncrease.map(item => (
              <div 
                key={item.maCSHT} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.6rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '6px',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => onEditStation(item)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fbbf24'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.maCSHT}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>({item.tenCSHT})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>+{formatMoney(item.chenhLechDonGia)}</span>
                  <Edit3 size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

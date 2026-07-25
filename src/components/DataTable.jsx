import React, { useState } from 'react';
import { Eye, Edit3, ArrowUpDown, ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function DataTable({ data, onViewDetail, onEditPrice }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState('stt');
  const [sortAsc, setSortAsc] = useState(true);

  const formatMoney = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (valA === undefined || valA === null) valA = '';
    if (valB === undefined || valB === null) valB = '';

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentRows = sortedData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      
      {/* Table Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>DANH SÁCH CHI TIẾT TRẠM CSHT</span>
          <span className="badge badge-blue">{sortedData.length} kết quả</span>
        </div>

        {/* Page Size Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Hiển thị:</span>
          <select
            className="input-control"
            style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
          >
            <option value={25}>25 dòng/trang</option>
            <option value={50}>50 dòng/trang</option>
            <option value={100}>100 dòng/trang</option>
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="table-container" style={{ maxHeight: '600px' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('stt')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>STT</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('maCSHT')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>MÃ CSHT</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('toHaTang')} style={{ cursor: 'pointer' }}>TỔ HẠ TẦNG</th>
              <th onClick={() => handleSort('tenCSHT')} style={{ cursor: 'pointer' }}>TÊN CSHT</th>
              <th onClick={() => handleSort('chuHopDong')} style={{ cursor: 'pointer' }}>CHỦ HỢP ĐỒNG</th>
              <th onClick={() => handleSort('donGia2025')} style={{ cursor: 'pointer', textAlign: 'right' }}>ĐƠN GIÁ 2025</th>
              <th onClick={() => handleSort('donGia2026')} style={{ cursor: 'pointer', textAlign: 'right' }}>ĐƠN GIÁ 2026</th>
              <th onClick={() => handleSort('chenhLechDonGia')} style={{ cursor: 'pointer', textAlign: 'right' }}>TĂNG GIÁ</th>
              <th onClick={() => handleSort('thoiDiemTangGia')} style={{ cursor: 'pointer' }}>THỜI ĐIỂM TĂNG</th>
              <th onClick={() => handleSort('no2025Ton')} style={{ cursor: 'pointer', textAlign: 'right' }}>NỢ TỒN 2025</th>
              <th onClick={() => handleSort('daThanhToan2026Den313')} style={{ cursor: 'pointer', textAlign: 'right' }}>ĐÃ TT 2026</th>
              <th onClick={() => handleSort('soThangNo2026')} style={{ cursor: 'pointer', textAlign: 'center' }}>SỐ THÁNG NỢ 2026</th>
              <th onClick={() => handleSort('no2026Ton')} style={{ cursor: 'pointer', textAlign: 'right' }}>NỢ 2026</th>
              <th>TÌNH TRẠNG PHÁP LÝ</th>
              <th style={{ textAlign: 'center' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={15} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Không tìm thấy trạm phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              currentRows.map((row) => (
                <tr key={row.maCSHT + '-' + row.stt}>
                  <td>{row.stt}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
                    {row.maCSHT}
                  </td>
                  <td>{row.toHaTang}</td>
                  <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.tenCSHT}>
                    {row.tenCSHT}
                  </td>
                  <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.chuHopDong}>
                    {row.chuHopDong}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                    {formatMoney(row.donGia2025)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatMoney(row.donGia2026)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {row.isTangGia ? (
                      <span className="badge badge-amber" style={{ fontWeight: 700 }}>
                        +{formatMoney(row.chenhLechDonGia)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>0 ₫</span>
                    )}
                  </td>
                  <td>
                    {row.thoiDiemTangGia ? (
                      <span className="badge badge-blue">{row.thoiDiemTangGia}</span>
                    ) : row.isTangGia ? (
                      <span className="badge badge-amber">Chưa xác định</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {row.no2025Ton > 0 ? (
                      <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>
                        {formatMoney(row.no2025Ton)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem' }}>Đã hết nợ</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    {formatMoney(row.daThanhToan2026Den313)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.soThangNo2026 > 0 ? (
                      <span className="badge badge-rose" style={{ fontWeight: 700 }}>
                        Nợ {row.soThangNo2026} tháng
                      </span>
                    ) : (
                      <span className="badge badge-emerald">Đủ 12T</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {row.no2026Ton > 0 ? (
                      <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>
                        {formatMoney(row.no2026Ton)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem' }}>0 ₫</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: row.tinhTrangPhapLy ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                      {row.tinhTrangPhapLy || 'Chưa cập nhật'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => onEditPrice(row)}
                        title="Cập nhật thông tin tăng giá"
                      >
                        <Edit3 size={14} style={{ color: '#fbbf24' }} />
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => onViewDetail(row)}
                        title="Xem đầy đủ chi tiết hợp đồng"
                      >
                        <Eye size={14} style={{ color: 'var(--accent-blue)' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Hiển thị từ {startIndex + 1} đến {Math.min(startIndex + pageSize, sortedData.length)} trong tổng số {sortedData.length} trạm
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={{ padding: '0.35rem 0.75rem', opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={16} />
            <span>Trang trước</span>
          </button>

          <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 0.5rem' }}>
            {currentPage} / {totalPages}
          </span>

          <button
            className="btn btn-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            style={{ padding: '0.35rem 0.75rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            <span>Trang sau</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}

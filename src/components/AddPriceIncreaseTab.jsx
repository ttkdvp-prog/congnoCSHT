import React, { useState, useMemo } from 'react';
import { Search, PlusCircle, Save, CheckCircle, TrendingUp, Flame, FileSpreadsheet, Building, MapPin, DollarSign, Calendar, Edit3, X, AlertCircle } from 'lucide-react';

export default function AddPriceIncreaseTab({ data, onSaveStation, isSaving }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  // Form State
  const [donGiaMoi, setDonGiaMoi] = useState('');
  const [thoiDiem, setThoiDiem] = useState('01/07/2026');
  const [lyDo, setLyDo] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  // Filter stations based on search term
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase().trim();
    return data.filter(st => 
      st.maCSHT?.toLowerCase().includes(q) ||
      st.tenCSHT?.toLowerCase().includes(q) ||
      st.site?.toLowerCase().includes(q) ||
      st.chuHopDong?.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [data, searchTerm]);

  // Handle Select Station
  const handleSelectStation = (station) => {
    setSelectedStation(station);
    setSearchTerm(`${station.maCSHT} - ${station.tenCSHT}`);
    setShowDropdown(false);

    // Pre-fill form if station already has price increase
    const initialMoi = station.deXuatT7 > 0 ? station.deXuatT7 : (station.donGia2026 > 0 ? station.donGia2026 : station.donGia2025);
    setDonGiaMoi(initialMoi ? String(initialMoi) : '');
    setThoiDiem(station.thoiDiemTangGia || '01/07/2026');
    setLyDo(station.ghiChu || '');
  };

  const handleClearSelection = () => {
    setSelectedStation(null);
    setSearchTerm('');
    setDonGiaMoi('');
    setThoiDiem('01/07/2026');
    setLyDo('');
  };

  // Calculations for current selected station
  const donGiaCu = selectedStation ? (selectedStation.donGia2025 || 0) : 0;
  const numDonGiaMoi = parseFloat(donGiaMoi) || 0;
  const chenhLech = Math.max(0, numDonGiaMoi - donGiaCu);
  const percentTang = donGiaCu > 0 ? ((chenhLech / donGiaCu) * 100).toFixed(1) : 0;

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStation) return;

    const updatedStation = {
      ...selectedStation,
      deXuatT7: numDonGiaMoi,
      donGia2026: numDonGiaMoi,
      chenhLechDonGia: chenhLech,
      isTangGia: chenhLech > 0 || numDonGiaMoi > donGiaCu,
      thoiDiemTangGia: thoiDiem.trim(),
      ghiChu: lyDo.trim()
    };

    onSaveStation(updatedStation);
  };

  // Filtered List of all stations with Price Increase for Summary Table
  const tangGiaList = useMemo(() => {
    return data.filter(st => st.isTangGia || st.deXuatT7 > 0 || st.chenhLechDonGia > 0);
  }, [data]);

  const filteredTangGiaList = useMemo(() => {
    if (!tableSearch.trim()) return tangGiaList;
    const q = tableSearch.toLowerCase().trim();
    return tangGiaList.filter(st =>
      st.maCSHT?.toLowerCase().includes(q) ||
      st.tenCSHT?.toLowerCase().includes(q) ||
      st.site?.toLowerCase().includes(q) ||
      st.toHaTang?.toLowerCase().includes(q)
    );
  }, [tangGiaList, tableSearch]);

  // Statistics
  const totalTangGiaCount = tangGiaList.length;
  const totalChenhLechMonth = tangGiaList.reduce((sum, item) => sum + (item.chenhLechDonGia || 0), 0);
  const totalChenhLechYear = totalChenhLechMonth * 12;

  const formatVND = (val) => {
    if (!val && val !== 0) return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER BANNER */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(139, 92, 246, 0.1))', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.5rem', background: '#f59e0b', borderRadius: '10px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlusCircle size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>
              NHẬP & CẬP NHẬT TRẠM TĂNG GIÁ CSHT
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Tìm kiếm trạm theo Mã CSHT / Tên trạm, nhập thông tin tăng giá (tháng 7 và thời điểm tăng giá), hệ thống sẽ tự động đồng bộ sang Google Sheet và lên báo cáo toàn bộ Dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH AND ENTRY FORM CONTAINER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* LEFT COLUMN: SEARCH & STATION DETAILS */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={18} style={{ color: '#3b82f6' }} />
            1. Tìm Kiếm & Chọn Trạm CSHT
          </h3>

          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Gõ Mã CSHT hoặc Tên trạm..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)'
                }}
              />
              {selectedStation && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="btn btn-secondary"
                  title="Xóa lựa chọn"
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)' }}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Dropdown Suggestions */}
            {showDropdown && searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '260px',
                overflowY: 'auto',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-hover)',
                borderRadius: 'var(--radius-md)',
                marginTop: '0.35rem',
                zIndex: 50,
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
              }}>
                {searchResults.map((st) => (
                  <div
                    key={st.maCSHT || st.rowIndex}
                    onClick={() => handleSelectStation(st)}
                    style={{
                      padding: '0.65rem 1rem',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#60a5fa', fontSize: '0.85rem' }}>
                        {st.maCSHT} <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>- {st.tenCSHT}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Site: {st.site} | Tổ: {st.toHaTang}
                      </div>
                    </div>
                    {st.isTangGia && (
                      <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.7rem' }}>
                        Đã tăng giá
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Station Card */}
          {selectedStation ? (
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge" style={{ background: '#3b82f6', color: '#fff', fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
                  {selectedStation.maCSHT}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Site: <strong style={{ color: '#fff' }}>{selectedStation.site}</strong>
                </span>
              </div>

              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {selectedStation.tenCSHT}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Building size={14} style={{ color: '#8b5cf6' }} />
                <span>Tổ hạ tầng: <strong>{selectedStation.toHaTang || '---'}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <MapPin size={14} style={{ color: '#ec4899' }} />
                <span>Chủ HĐ / Địa chỉ: <strong>{selectedStation.chuHopDong || '---'}</strong></span>
              </div>

              <div style={{
                marginTop: '0.4rem',
                paddingTop: '0.6rem',
                borderTop: '1px dashed rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Đơn giá cũ (2025):</span>
                <strong style={{ color: '#f59e0b', fontSize: '1rem' }}>
                  {formatVND(selectedStation.donGia2025)}/tháng
                </strong>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: 'var(--text-muted)',
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)'
            }}>
              <AlertCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.85rem' }}>Vui lòng gõ mã CSHT hoặc tên trạm vào ô trên để tìm và chọn trạm cần cập nhật.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PRICE INCREASE FORM */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={18} />
            2. Thông Tin Đề Xuất Tăng Giá
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Input Đơn giá mới (Đề xuất tăng giá tháng 7) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Đơn giá mới (Đề xuất tăng giá tháng 7) [VND/tháng]:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Ví dụ: 2500000"
                  value={donGiaMoi}
                  onChange={(e) => setDonGiaMoi(e.target.value)}
                  disabled={!selectedStation}
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem 0.7rem 2.2rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: '#34d399'
                  }}
                />
                <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#34d399' }} />
              </div>
            </div>

            {/* Live Calculation Preview */}
            {selectedStation && numDonGiaMoi > 0 && (
              <div style={{
                background: chenhLech > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.05)',
                border: chenhLech > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Chênh lệch / tháng:</span>
                  <strong style={{ color: chenhLech > 0 ? '#34d399' : 'var(--text-main)', fontSize: '0.95rem' }}>
                    +{formatVND(chenhLech)}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>Tỷ lệ tăng:</span>
                  <strong style={{ color: chenhLech > 0 ? '#fbbf24' : 'var(--text-main)', fontSize: '0.95rem' }}>
                    +{percentTang}%
                  </strong>
                </div>
              </div>
            )}

            {/* Input Thời điểm tăng giá */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Thời điểm tăng giá:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="VD: 01/07/2026 hoặc Tháng 7/2026"
                  value={thoiDiem}
                  onChange={(e) => setThoiDiem(e.target.value)}
                  disabled={!selectedStation}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem 0.7rem 2.2rem',
                    fontSize: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                />
                <Calendar size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#f59e0b' }} />
              </div>
            </div>

            {/* Input Lý do tăng giá / Ghi chú */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Lý do tăng giá / Ghi chú bổ sung:
              </label>
              <textarea
                className="input-field"
                rows="2"
                placeholder="Nhập lý do điều chỉnh đơn giá, thỏa thuận với chủ nhà..."
                value={lyDo}
                onChange={(e) => setLyDo(e.target.value)}
                disabled={!selectedStation}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedStation || isSaving}
              className="btn btn-amber"
              style={{
                width: '100%',
                padding: '0.8rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                opacity: (!selectedStation || isSaving) ? 0.6 : 1,
                cursor: (!selectedStation || isSaving) ? 'not-allowed' : 'pointer'
              }}
            >
              <Save size={18} />
              <span>{isSaving ? 'Đang Lưu...' : 'Lưu & Đẩy Dữ Liệu Lên Google Sheet'}</span>
            </button>
          </form>
        </div>

      </div>

      {/* SUMMARY TABLE SECTION */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        
        {/* Table Header & KPI Summary Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flame size={20} style={{ color: '#f59e0b' }} />
              Danh Sách Trạm Đã Cập Nhật Tăng Giá ({tangGiaList.length} Trạm)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Số liệu tổng hợp tự động đồng bộ liên kết sang sheet Theo dõi đầy đủ và các tab báo cáo khác.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)', textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>TỔNG CHÊNH LỆCH TĂNG/THÁNG:</span>
              <strong style={{ color: '#fbbf24', fontSize: '0.95rem' }}>+{formatVND(totalChenhLechMonth)}</strong>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)', textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>TỔNG CHÊNH LỆCH TĂNG/NĂM:</span>
              <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>+{formatVND(totalChenhLechYear)}</strong>
            </div>
          </div>
        </div>

        {/* Filter Input for Summary Table */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Lọc danh sách trạm tăng giá bên dưới..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '0.5rem 0.85rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)'
            }}
          />
        </div>

        {/* Summary Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>STT</th>
                <th style={{ padding: '0.75rem' }}>Mã CSHT</th>
                <th style={{ padding: '0.75rem' }}>Tên CSHT</th>
                <th style={{ padding: '0.75rem' }}>Site</th>
                <th style={{ padding: '0.75rem' }}>Tổ Hạ Tầng</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Đơn Giá 2025 (Cũ)</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Giá Mới (Tháng 7)</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Tăng / Tháng</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Thời Điểm Tăng</th>
                <th style={{ padding: '0.75rem' }}>Lý Do / Ghi Chú</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTangGiaList.length > 0 ? (
                filteredTangGiaList.map((st, idx) => {
                  const donGiaCu = st.donGia2025 || 0;
                  const donGiaMoi = st.deXuatT7 > 0 ? st.deXuatT7 : (st.donGia2026 || donGiaCu);
                  const diff = st.chenhLechDonGia || Math.max(0, donGiaMoi - donGiaCu);

                  return (
                    <tr
                      key={st.maCSHT || idx}
                      style={{ borderBottom: '1px solid var(--border-color)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 700, color: '#60a5fa' }}>{st.maCSHT}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 600, color: 'var(--text-main)' }}>{st.tenCSHT}</td>
                      <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>{st.site}</td>
                      <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>{st.toHaTang}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--text-muted)' }}>{formatVND(donGiaCu)}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 700, color: '#34d399' }}>{formatVND(donGiaMoi)}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 700, color: '#fbbf24' }}>+{formatVND(diff)}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center', color: 'var(--text-main)', fontSize: '0.8rem' }}>
                        <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                          {st.thoiDiemTangGia || 'Tháng 7/2026'}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {st.ghiChu || '---'}
                      </td>
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleSelectStation(st)}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px' }}
                          title="Sửa lại trạm này"
                        >
                          Sửa
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Chưa có trạm nào cập nhật tăng giá.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

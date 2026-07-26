import React, { useState, useMemo, useEffect } from 'react';
import { Search, PlusCircle, Save, Flame, Building, MapPin, DollarSign, Calendar, Edit3, X, AlertCircle, Sparkles, List, Trash2, FileText, User, Paperclip, Upload, ExternalLink, FileCheck } from 'lucide-react';

export default function AddPriceIncreaseTab({ data, onSaveStation, isSaving }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  // Form State
  const [donGiaMoi, setDonGiaMoi] = useState('');
  const [thoiDiem, setThoiDiem] = useState('');
  const [lyDo, setLyDo] = useState('');
  const [baoCaoVTT, setBaoCaoVTT] = useState('Chưa làm văn bản báo cáo');
  const [diaChiDoiTac, setDiaChiDoiTac] = useState('');
  const [fileDinhKem, setFileDinhKem] = useState('');
  const [fileName, setFileName] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  // List of recently attached files in this session (Shared across multiple stations)
  const [recentFiles, setRecentFiles] = useState(() => {
    try {
      const saved = localStorage.getItem('csht_recent_attached_files');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Session-level updated stations (unique key: rowIndex or maCSHT_rowIndex)
  const [sessionUpdatedKeys, setSessionUpdatedKeys] = useState(() => {
    try {
      localStorage.removeItem('csht_session_updated_codes');
      const saved = localStorage.getItem('csht_session_updated_keys_v2');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Table View Filter Mode: 'session' (trạm mới nhập hôm nay) | 'all' (tất cả trạm tăng giá)
  const [tableViewMode, setTableViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem('csht_session_updated_keys_v2');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.length > 0 ? 'session' : 'all';
    } catch (e) {
      return 'all';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('csht_session_updated_keys_v2', JSON.stringify(sessionUpdatedKeys));
    } catch (e) {}
  }, [sessionUpdatedKeys]);

  // Helper functions for formatting numbers with dots (hàng nghìn)
  const formatNumberWithDots = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const digitsOnly = String(val).replace(/\D/g, '');
    if (!digitsOnly) return '';
    return Number(digitsOnly).toLocaleString('de-DE');
  };

  const parseNumberFromDots = (val) => {
    if (!val) return 0;
    const cleanStr = String(val).replace(/\./g, '').replace(/,/g, '');
    return parseFloat(cleanStr) || 0;
  };

  // Helper to get unique station key
  const getStationKey = (st) => {
    if (!st) return '';
    return st.rowIndex ? `row_${st.rowIndex}` : `ma_${st.maCSHT}`;
  };

  // Filter stations based on search term
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase().trim();
    return data.filter(st => 
      st.maCSHT?.toLowerCase().includes(q) ||
      st.tenCSHT?.toLowerCase().includes(q) ||
      st.site?.toLowerCase().includes(q) ||
      st.chuHopDong?.toLowerCase().includes(q) ||
      st.diaChiDoiTac?.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [data, searchTerm]);

  // Handle Select Station
  const handleSelectStation = (station) => {
    setSelectedStation(station);
    setSearchTerm(`${station.maCSHT} - ${station.tenCSHT}`);
    setShowDropdown(false);

    // Pre-fill price if available
    const initialMoi = station.deXuatT7 > 0 ? station.deXuatT7 : (station.donGia2026 > 0 ? station.donGia2026 : station.donGia2025);
    setDonGiaMoi(initialMoi ? formatNumberWithDots(initialMoi) : '');

    setThoiDiem(station.thoiDiemTangGia || '');
    setLyDo(station.ghiChu || '');
    setBaoCaoVTT(station.baoCaoVTT || 'Chưa làm văn bản báo cáo');
    setDiaChiDoiTac(station.diaChiDoiTac || '');
    setFileDinhKem(station.fileDinhKem || '');
    setFileName(station.fileDinhKem ? (station.fileDinhKem.startsWith('data:') ? 'File_Văn_Bản_Đính_Kèm' : station.fileDinhKem) : '');
  };

  const handleClearSelection = () => {
    setSelectedStation(null);
    setSearchTerm('');
    setDonGiaMoi('');
    setThoiDiem('');
    setLyDo('');
    setBaoCaoVTT('Chưa làm văn bản báo cáo');
    setDiaChiDoiTac('');
    setFileDinhKem('');
    setFileName('');
  };

  // Handle File Upload from Computer
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const fileUrl = evt.target.result;
      const fName = file.name;
      setFileDinhKem(fileUrl);
      setFileName(fName);

      // Save to recent files list for quick reuse across multiple stations
      setRecentFiles(prev => {
        const exists = prev.some(item => item.name === fName || item.url === fileUrl);
        if (exists) return prev;
        const updated = [{ name: fName, url: fileUrl }, ...prev].slice(0, 10);
        try { localStorage.setItem('csht_recent_attached_files', JSON.stringify(updated)); } catch (err) {}
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  // Select a previously attached file
  const handleSelectRecentFile = (fileItem) => {
    setFileDinhKem(fileItem.url);
    setFileName(fileItem.name);
  };

  // Clear Session List
  const handleClearSessionList = () => {
    if (window.confirm('Bạn có chắc muốn làm mới danh sách trạm đã nhập hôm nay?')) {
      setSessionUpdatedKeys([]);
      localStorage.removeItem('csht_session_updated_keys_v2');
      setTableViewMode('all');
    }
  };

  // Calculations for current selected station
  const donGiaCu = selectedStation ? (selectedStation.donGia2025 || 0) : 0;
  const numDonGiaMoi = parseNumberFromDots(donGiaMoi);
  const chenhLech = Math.max(0, numDonGiaMoi - donGiaCu);
  const percentTang = donGiaCu > 0 ? ((chenhLech / donGiaCu) * 100).toFixed(1) : 0;

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStation) return;

    const stKey = getStationKey(selectedStation);

    const updatedStation = {
      ...selectedStation,
      deXuatT7: numDonGiaMoi,
      donGia2026: numDonGiaMoi,
      chenhLechDonGia: chenhLech,
      isTangGia: chenhLech > 0 || numDonGiaMoi > donGiaCu,
      thoiDiemTangGia: thoiDiem.trim(),
      ghiChu: lyDo.trim(),
      baoCaoVTT: baoCaoVTT.trim() || 'Chưa làm văn bản báo cáo',
      diaChiDoiTac: diaChiDoiTac.trim(),
      fileDinhKem: fileDinhKem.trim()
    };

    // Record unique key in session list
    if (stKey) {
      setSessionUpdatedKeys(prev => {
        if (!prev.includes(stKey)) {
          return [...prev, stKey];
        }
        return prev;
      });
      setTableViewMode('session');
    }

    onSaveStation(updatedStation);

    // Reset form selection so user can enter next station freshly
    handleClearSelection();
  };

  // Filtered List of all stations with Price Increase
  const tangGiaList = useMemo(() => {
    return data.filter(st => st.isTangGia || st.deXuatT7 > 0 || st.chenhLechDonGia > 0);
  }, [data]);

  // Session updated stations list (matched by unique key)
  const sessionList = useMemo(() => {
    return data.filter(st => sessionUpdatedKeys.includes(getStationKey(st)));
  }, [data, sessionUpdatedKeys]);

  // Active list based on view mode ('session' vs 'all')
  const activeDisplayList = useMemo(() => {
    const list = tableViewMode === 'session' ? sessionList : tangGiaList;
    if (!tableSearch.trim()) return list;
    const q = tableSearch.toLowerCase().trim();
    return list.filter(st =>
      st.maCSHT?.toLowerCase().includes(q) ||
      st.tenCSHT?.toLowerCase().includes(q) ||
      st.site?.toLowerCase().includes(q) ||
      st.toHaTang?.toLowerCase().includes(q) ||
      st.chuHopDong?.toLowerCase().includes(q) ||
      st.diaChiDoiTac?.toLowerCase().includes(q) ||
      st.baoCaoVTT?.toLowerCase().includes(q)
    );
  }, [tableViewMode, sessionList, tangGiaList, tableSearch]);

  // Statistics
  const totalChenhLechMonth = activeDisplayList.reduce((sum, item) => sum + (item.chenhLechDonGia || 0), 0);

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
              Tìm kiếm trạm theo Mã CSHT / Tên trạm, nhập đơn giá mới, địa chỉ đối tác, tiến độ báo cáo VTT, gắn file văn bản đính kèm và tự động đồng bộ sang Google Sheet.
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
                placeholder="Gõ Mã CSHT, Tên trạm hoặc Địa chỉ đối tác..."
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
                {searchResults.map((st, idx) => (
                  <div
                    key={getStationKey(st) || idx}
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
                        Site: {st.site} | Tổ: {st.toHaTang} | Chủ HĐ: {st.chuHopDong} {st.diaChiDoiTac ? `| ĐC: ${st.diaChiDoiTac}` : ''}
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
                <User size={14} style={{ color: '#ec4899' }} />
                <span>Chủ HĐ: <strong>{selectedStation.chuHopDong || '---'}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <MapPin size={14} style={{ color: '#f43f5e', marginTop: '2px', flexShrink: 0 }} />
                <span>Địa chỉ đối tác: <strong style={{ color: selectedStation.diaChiDoiTac ? '#34d399' : 'var(--text-muted)' }}>{selectedStation.diaChiDoiTac || 'Chưa có thông tin địa chỉ'}</strong></span>
              </div>

              {selectedStation.fileDinhKem && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.15)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <Paperclip size={14} style={{ color: '#60a5fa' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>File đính kèm hiện tại:</span>
                  <a href={selectedStation.fileDinhKem} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <span>Xem file</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

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
            2. Thông Tin Đề Xuất Tăng Giá & Đính Kèm File
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Input Đơn giá mới (Đề xuất tăng giá) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Đơn giá mới (Đề xuất tăng giá) [VND/tháng]:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ví dụ: 2.240.000"
                  value={donGiaMoi}
                  onChange={(e) => setDonGiaMoi(formatNumberWithDots(e.target.value))}
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

            {/* Input Địa chỉ đối tác */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Địa chỉ đối tác:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nhập địa chỉ nhà / khu vực của đối tác..."
                  value={diaChiDoiTac}
                  onChange={(e) => setDiaChiDoiTac(e.target.value)}
                  disabled={!selectedStation}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.2rem',
                    fontSize: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                />
                <MapPin size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#f43f5e' }} />
              </div>
            </div>

            {/* Input Báo cáo VTT */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Tiến độ Báo cáo VTT:
              </label>
              
              {/* Quick Select Preset Buttons */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setBaoCaoVTT('Chưa làm văn bản báo cáo')}
                  disabled={!selectedStation}
                  style={{
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.725rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: baoCaoVTT === 'Chưa làm văn bản báo cáo' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: baoCaoVTT === 'Chưa làm văn bản báo cáo' ? '1px solid #ef4444' : '1px solid var(--border-color)',
                    color: baoCaoVTT === 'Chưa làm văn bản báo cáo' ? '#f87171' : 'var(--text-secondary)'
                  }}
                >
                  🔴 Chưa làm VB báo cáo
                </button>
                <button
                  type="button"
                  onClick={() => setBaoCaoVTT('Đã làm văn bản báo cáo')}
                  disabled={!selectedStation}
                  style={{
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.725rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: baoCaoVTT === 'Đã làm văn bản báo cáo' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: baoCaoVTT === 'Đã làm văn bản báo cáo' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                    color: baoCaoVTT === 'Đã làm văn bản báo cáo' ? '#60a5fa' : 'var(--text-secondary)'
                  }}
                >
                  🔵 Đã làm VB báo cáo
                </button>
                <button
                  type="button"
                  onClick={() => setBaoCaoVTT('VTT đồng ý theo văn bản số ')}
                  disabled={!selectedStation}
                  style={{
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.725rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: baoCaoVTT.includes('VTT đồng ý') ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: baoCaoVTT.includes('VTT đồng ý') ? '1px solid #10b981' : '1px solid var(--border-color)',
                    color: baoCaoVTT.includes('VTT đồng ý') ? '#34d399' : 'var(--text-secondary)'
                  }}
                >
                  🟢 VTT đồng ý theo VB...
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Chưa làm văn bản báo cáo"
                  value={baoCaoVTT}
                  onChange={(e) => setBaoCaoVTT(e.target.value)}
                  disabled={!selectedStation}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.2rem',
                    fontSize: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                />
                <FileText size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#60a5fa' }} />
              </div>
            </div>

            {/* Input Gắn File Văn Bản / Link Báo Cáo (Dùng chung 1 file cho nhiều trạm) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Gắn File Văn Bản / Link Báo Cáo:
              </label>

              {/* Shared Document Chips (Cho phép chọn lại 1 file đã dán/tải để dùng chung cho nhiều trạm) */}
              {recentFiles.length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    📄 Gắn nhanh văn bản đã lưu (1 file dùng cho nhiều trạm):
                  </span>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {recentFiles.map((f, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectRecentFile(f)}
                        disabled={!selectedStation}
                        style={{
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.7rem',
                          borderRadius: '6px',
                          border: fileDinhKem === f.url ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                          background: fileDinhKem === f.url ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)',
                          color: fileDinhKem === f.url ? '#60a5fa' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <FileCheck size={12} />
                        <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload & Link Input Controls */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label className="btn btn-secondary" style={{ padding: '0.65rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: selectedStation ? 'pointer' : 'not-allowed', opacity: selectedStation ? 1 : 0.6, flexShrink: 0 }}>
                  <Upload size={14} />
                  <span>Chọn File</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={!selectedStation}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                  />
                </label>

                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Hoặc dán Link Google Drive/OneDrive/URL..."
                    value={fileDinhKem}
                    onChange={(e) => {
                      setFileDinhKem(e.target.value);
                      setFileName(e.target.value ? (e.target.value.startsWith('data:') ? 'File_Dinh_Kem' : e.target.value) : '');
                    }}
                    disabled={!selectedStation}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem 0.65rem 2.2rem',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)'
                    }}
                  />
                  <Paperclip size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6' }} />
                </div>
              </div>

              {fileName && (
                <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FileCheck size={14} />
                  <span>Đã gắn: <strong>{fileName}</strong></span>
                  <button
                    type="button"
                    onClick={() => { setFileDinhKem(''); setFileName(''); }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, marginLeft: '0.5rem' }}
                  >
                    (Hủy gắn)
                  </button>
                </div>
              )}
            </div>

            {/* Input Thời điểm tăng giá */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Thời điểm tăng giá:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Tự nhập thời điểm (VD: 01/07/2026 hoặc Tháng 7/2026)"
                  value={thoiDiem}
                  onChange={(e) => setThoiDiem(e.target.value)}
                  disabled={!selectedStation}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.2rem',
                    fontSize: '0.85rem',
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
                placeholder="Tự nhập lý do điều chỉnh đơn giá..."
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
        
        {/* Table View Switcher & Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Flame size={20} style={{ color: '#f59e0b' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {tableViewMode === 'session' ? `Danh Sách Trạm Vừa Nhập Mới (${sessionList.length} trạm)` : `Danh Sách Tất Cả Trạm Tăng Giá (${tangGiaList.length} trạm)`}
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Chế độ xem phân loại giúp theo dõi chính xác file đính kèm, tiến độ Báo cáo VTT và các trạm vừa cập nhật.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* View Mode Buttons */}
            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => setTableViewMode('session')}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: tableViewMode === 'session' ? 700 : 500,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: tableViewMode === 'session' ? '#3b82f6' : 'transparent',
                  color: tableViewMode === 'session' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Sparkles size={14} />
                <span>Trạm Mới Nhập ({sessionList.length})</span>
              </button>
              
              <button
                type="button"
                onClick={() => setTableViewMode('all')}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: tableViewMode === 'all' ? 700 : 500,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: tableViewMode === 'all' ? '#f59e0b' : 'transparent',
                  color: tableViewMode === 'all' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <List size={14} />
                <span>Tất Cả Trạm ({tangGiaList.length})</span>
              </button>
            </div>

            {/* Clear Session List Button */}
            {sessionList.length > 0 && (
              <button
                type="button"
                onClick={handleClearSessionList}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                title="Làm mới danh sách trạm đã nhập hôm nay"
              >
                <Trash2 size={13} />
                <span>Xóa danh sách vừa nhập</span>
              </button>
            )}

            {/* KPI Totals */}
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)', textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>TỔNG CHÊNH LỆCH TĂNG/THÁNG:</span>
              <strong style={{ color: '#fbbf24', fontSize: '0.95rem' }}>+{formatVND(totalChenhLechMonth)}</strong>
            </div>
          </div>
        </div>

        {/* Filter Input for Summary Table */}
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input-field"
            placeholder={tableViewMode === 'session' ? "Lọc danh sách trạm vừa nhập..." : "Lọc tất cả danh sách trạm tăng giá..."}
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

          {sessionList.length > 0 && tableViewMode === 'session' && (
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
              ✨ Đã nhập <strong>{sessionList.length} trạm mới</strong> trong phiên này.
            </span>
          )}
        </div>

        {/* Summary Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.95)', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>STT</th>
                <th style={{ padding: '0.75rem' }}>Mã CSHT</th>
                <th style={{ padding: '0.75rem' }}>Tên CSHT & Địa Chỉ Đối Tác</th>
                <th style={{ padding: '0.75rem' }}>Site</th>
                <th style={{ padding: '0.75rem' }}>Tổ Hạ Tầng</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Đơn Giá 2025 (Cũ)</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Giá Mới (Tăng Giá)</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Tăng / Tháng</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Thời Điểm Tăng</th>
                <th style={{ padding: '0.75rem' }}>Báo Cáo VTT</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Văn Bản / File</th>
                <th style={{ padding: '0.75rem' }}>Lý Do / Ghi Chú</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {activeDisplayList.length > 0 ? (
                activeDisplayList.map((st, idx) => {
                  const stKey = getStationKey(st);
                  const donGiaCu = st.donGia2025 || 0;
                  const donGiaMoi = st.deXuatT7 > 0 ? st.deXuatT7 : (st.donGia2026 || donGiaCu);
                  const diff = st.chenhLechDonGia || Math.max(0, donGiaMoi - donGiaCu);
                  const isNewlyAdded = sessionUpdatedKeys.includes(stKey);

                  const statusVTT = st.baoCaoVTT || 'Chưa làm văn bản báo cáo';
                  const isDongY = statusVTT.toLowerCase().includes('đồng ý');
                  const isDaLam = statusVTT === 'Đã làm văn bản báo cáo';

                  return (
                    <tr
                      key={stKey || idx}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        background: isNewlyAdded ? 'rgba(59, 130, 246, 0.06)' : 'transparent'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = isNewlyAdded ? 'rgba(59, 130, 246, 0.06)' : 'transparent'}
                    >
                      <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontWeight: 700, color: isNewlyAdded ? '#60a5fa' : 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '0.6rem', fontWeight: 700, color: '#60a5fa' }}>
                        {st.maCSHT}
                        {isNewlyAdded && (
                          <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', background: '#3b82f6', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            Mới
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.6rem', color: 'var(--text-main)' }}>
                        <div style={{ fontWeight: 600 }}>{st.tenCSHT}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Chủ HĐ: <strong>{st.chuHopDong || '---'}</strong>
                          {st.diaChiDoiTac ? (
                            <span style={{ color: '#34d399', marginLeft: '0.3rem' }}> • 📍 {st.diaChiDoiTac}</span>
                          ) : null}
                        </div>
                      </td>
                      <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>{st.site}</td>
                      <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>{st.toHaTang}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--text-muted)' }}>{formatVND(donGiaCu)}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 700, color: '#34d399' }}>{formatVND(donGiaMoi)}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 700, color: '#fbbf24' }}>+{formatVND(diff)}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center', color: 'var(--text-main)', fontSize: '0.8rem' }}>
                        {st.thoiDiemTangGia ? (
                          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                            {st.thoiDiemTangGia}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>---</span>
                        )}
                      </td>

                      {/* BÁO CÁO VTT CELL */}
                      <td style={{ padding: '0.6rem', fontSize: '0.8rem', minWidth: '180px', maxWidth: '280px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {isDongY ? (
                          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.25rem 0.5rem' }}>
                            🟢 {statusVTT}
                          </span>
                        ) : isDaLam ? (
                          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '0.25rem 0.5rem' }}>
                            🔵 Đã làm văn bản báo cáo
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.25rem 0.5rem' }}>
                            🔴 {statusVTT}
                          </span>
                        )}
                      </td>

                      {/* FILE ĐÍNH KÈM / VĂN BẢN CELL */}
                      <td style={{ padding: '0.6rem', textAlign: 'center', fontSize: '0.8rem' }}>
                        {st.fileDinhKem ? (
                          <a
                            href={st.fileDinhKem}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="badge badge-blue"
                            style={{ padding: '0.3rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
                            title="Mở văn bản đính kèm"
                          >
                            <Paperclip size={12} />
                            <span>Xem File</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>---</span>
                        )}
                      </td>

                      <td style={{
                        padding: '0.6rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        minWidth: '200px',
                        maxWidth: '300px',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        lineHeight: 1.4
                      }}>
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
                  <td colSpan="13" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    {tableViewMode === 'session' 
                      ? 'Chưa có trạm nào được nhập mới trong phiên hôm nay. Vui lòng chọn trạm phía trên để bắt đầu nhập!' 
                      : 'Chưa có trạm nào được cập nhật tăng giá.'}
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

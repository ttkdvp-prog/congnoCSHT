import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, CheckCircle, AlertCircle, Plus, Trash2, RefreshCw, Layers } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function UploadPaymentTab({ stationsData, apiUrl, onRefreshData }) {
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  // Manual Quick Input Form State
  const [manualMaCSHT, setManualMaCSHT] = useState('');
  const [manualSoTien, setManualSoTien] = useState('');
  const [manualSoThang, setManualSoThang] = useState('');
  const [manualTinhTrang, setManualTinhTrang] = useState('đã thanh toán');
  const [manualGhiChu, setManualGhiChu] = useState('');

  // Helper format money
  const formatMoney = (val) => {
    if (!val) return '0 ₫';
    const num = Number(String(val).replace(/[^\d.-]/g, ''));
    if (isNaN(num)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // 1. Download Sample Excel Template for Sheet 'up'
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'STT': 1,
        'Mã CSHT': 'CSHT_PTO_00300',
        'số tiền thanh toán': 4000000,
        'số tháng thanh toán': 'Tháng 7/2026',
        'Tình trạng': 'đã thanh toán',
        'Ghi chú': 'Đã hoàn tất thanh toán đợt 1'
      },
      {
        'STT': 2,
        'Mã CSHT': 'CSHT_VPC_00447',
        'số tiền thanh toán': 2240000,
        'số tháng thanh toán': 'Tháng 6/2026 - 7/2026',
        'Tình trạng': 'đã chuyển lên VTT',
        'Ghi chú': 'Đang trình duyệt hồ sơ VTT'
      },
      {
        'STT': 3,
        'Mã CSHT': 'CSHT_HBH_00020',
        'số tiền thanh toán': 0,
        'số tháng thanh toán': '',
        'Tình trạng': 'đã xong hồ sơ',
        'Ghi chú': 'Hồ sơ pháp lý hoàn thành'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    // Set column widths
    ws['!cols'] = [
      { wch: 6 },
      { wch: 20 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 35 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'up');
    XLSX.writeFile(wb, `Mau_File_Up_Thanh_Toan_CSHT.xlsx`);
  };

  // 2. Parse Uploaded Excel File (.xlsx, .xls, .csv)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setUploadMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          alert('File Excel rỗng hoặc không đúng định dạng!');
          return;
        }

        // Normalize column headers to match Sheet 'up' fields
        const formatted = rawJson.map((row, idx) => {
          const getVal = (patterns) => {
            for (const key of Object.keys(row)) {
              const kNorm = key.trim().toLowerCase();
              for (const pat of patterns) {
                if (kNorm.includes(pat.toLowerCase())) return row[key];
              }
            }
            return '';
          };

          const maCSHT = String(getVal(['mã csht', 'ma csht', 'mã', 'site'])).trim();
          const rawSoTien = getVal(['số tiền thanh toán', 'số tiền', 'sotien', 'tiền']);
          const soTienNum = typeof rawSoTien === 'number' ? rawSoTien : Number(String(rawSoTien).replace(/[^\d.-]/g, '')) || 0;
          const soThang = String(getVal(['số tháng thanh toán', 'số tháng', 'sothang', 'tháng'])).trim();
          const tinhTrang = String(getVal(['tình trạng', 'tinhtrang', 'trạng thái'])).trim() || 'đã thanh toán';
          const ghiChu = String(getVal(['ghi chú', 'ghichu', 'lý do'])).trim();

          return {
            id: Date.now() + idx,
            stt: idx + 1,
            maCSHT,
            soTienThanhToan: soTienNum,
            soThangThanhToan: soThang,
            tinhTrang: tinhTrang || 'đã thanh toán',
            ghiChu
          };
        }).filter(r => r.maCSHT !== '');

        setParsedRows(formatted);
      } catch (err) {
        console.error('Error parsing excel:', err);
        alert('Có lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file!');
      }
    };
    reader.readAsBinaryString(file);
  };

  // 3. Add Manual Single Row to Preview Table
  const handleAddManualRow = (e) => {
    e.preventDefault();
    if (!manualMaCSHT.trim()) {
      alert('Vui lòng nhập Mã CSHT!');
      return;
    }

    const numSoTien = Number(String(manualSoTien).replace(/[^\d.-]/g, '')) || 0;

    const newRow = {
      id: Date.now(),
      stt: parsedRows.length + 1,
      maCSHT: manualMaCSHT.trim(),
      soTienThanhToan: numSoTien,
      soThangThanhToan: manualSoThang.trim(),
      tinhTrang: manualTinhTrang,
      ghiChu: manualGhiChu.trim()
    };

    setParsedRows(prev => [...prev, newRow]);
    setManualMaCSHT('');
    setManualSoTien('');
    setManualSoThang('');
    setManualGhiChu('');
  };

  // 4. Remove a row from Preview Table
  const handleRemoveRow = (id) => {
    setParsedRows(prev => prev.filter(r => r.id !== id));
  };

  // 5. Submit Parsed Rows to Google Apps Script (Sheet 'up')
  const handleSyncToGoogleSheets = async () => {
    if (parsedRows.length === 0) {
      alert('Không có dữ liệu để tải lên!');
      return;
    }

    if (!apiUrl) {
      alert('Chưa cấu hình URL API Google Apps Script. Vui lòng cài đặt URL API trước!');
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'uploadSheetUp',
          rows: parsedRows
        })
      });

      const data = await res.json();

      if (data && data.status === 'success') {
        setUploadMessage({
          type: 'success',
          text: `🎉 ${data.message || `Đã tải thành công ${parsedRows.length} dòng lên Google Sheet (Sheet 'up')!`}`
        });
        setParsedRows([]);
        setFileName('');
        if (onRefreshData) onRefreshData();
      } else {
        setUploadMessage({
          type: 'error',
          text: `⚠️ Có lỗi từ máy chủ: ${data.message || 'Lỗi không xác định'}`
        });
      }
    } catch (err) {
      console.error('Upload to Apps Script failed:', err);
      setUploadMessage({
        type: 'error',
        text: '❌ Lỗi kết nối đến máy chủ Google Apps Script. Vui lòng kiểm tra mạng hoặc URL API!'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const totalPaymentSum = parsedRows.reduce((sum, r) => sum + (r.soTienThanhToan || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #06b6d4' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22d3ee'
            }}>
              <UploadCloud size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#22d3ee' }}>
                UPLOAD SỐ LIỆU THANH TOÁN (LƯU VÀO SHEET "UP")
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Tải lên file Excel danh sách các trạm CSHT đã thanh toán để lưu trực tiếp vào tab <strong>Sheet 'up'</strong> trên Google Sheets & cập nhật Web App
              </p>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            onClick={handleDownloadTemplate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, borderColor: '#06b6d4', color: '#22d3ee' }}
          >
            <Download size={16} />
            <span>Tải File Excel Mẫu (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Upload Zone + Manual Entry */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Upload Excel Card */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={18} style={{ color: '#22d3ee' }} />
            1. Chọn File Excel Để Tải Lên (.xlsx, .xls)
          </h3>

          <div style={{
            border: '2px dashed rgba(6, 182, 212, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            background: 'rgba(6, 182, 212, 0.04)',
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%'
              }}
            />
            <UploadCloud size={40} style={{ color: '#22d3ee', marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Kéo thả file Excel vào đây hoặc click chọn file
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Cột chuẩn: STT | Mã CSHT | số tiền thanh toán | số tháng thanh toán | Tình trạng | Ghi chú
            </div>
            {fileName && (
              <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>
                📄 {fileName}
              </div>
            )}
          </div>
        </div>

        {/* Manual Quick Add Card */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} style={{ color: '#34d399' }} />
            2. Nhập Nhanh 1 Trạm Thanh Toán
          </h3>

          <form onSubmit={handleAddManualRow} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Mã CSHT (*):</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="CSHT_PTO_00300"
                  value={manualMaCSHT}
                  onChange={(e) => setManualMaCSHT(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Số tiền thanh toán:</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="4.000.000"
                  value={manualSoTien}
                  onChange={(e) => setManualSoTien(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Số tháng thanh toán:</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="VD: Tháng 7/2026"
                  value={manualSoThang}
                  onChange={(e) => setManualSoThang(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Tình trạng:</label>
                <select
                  className="input-field"
                  value={manualTinhTrang}
                  onChange={(e) => setManualTinhTrang(e.target.value)}
                >
                  <option value="đã thanh toán">đã thanh toán</option>
                  <option value="đã chuyển lên VTT">đã chuyển lên VTT</option>
                  <option value="đã xong hồ sơ">đã xong hồ sơ</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Ghi chú:</label>
              <input
                type="text"
                className="input-field"
                placeholder="Nhập ghi chú thêm..."
                value={manualGhiChu}
                onChange={(e) => setManualGhiChu(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-emerald" style={{ marginTop: '0.25rem', width: '100%' }}>
              <Plus size={16} />
              <span>Thêm Vào Danh Sách Duyệt</span>
            </button>
          </form>
        </div>

      </div>

      {/* Notifications */}
      {uploadMessage && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: uploadMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: uploadMessage.type === 'success' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
          color: uploadMessage.type === 'success' ? '#34d399' : '#f87171',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {uploadMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{uploadMessage.text}</span>
        </div>
      )}

      {/* Preview Table & Sync Controls */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>XEM TRƯỚC DANH SÁCH DỮ LIỆU CHỜ UPLOAD</span>
              <span className="badge badge-blue">{parsedRows.length} dòng</span>
            </h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Tổng tiền thanh toán đợt này: <strong style={{ color: '#34d399' }}>{formatMoney(totalPaymentSum)}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {parsedRows.length > 0 && (
              <button
                className="btn btn-secondary"
                onClick={() => setParsedRows([])}
                style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <Trash2 size={16} />
                <span>Xóa Hết</span>
              </button>
            )}

            <button
              className="btn btn-primary"
              onClick={handleSyncToGoogleSheets}
              disabled={isUploading || parsedRows.length === 0}
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                opacity: (isUploading || parsedRows.length === 0) ? 0.6 : 1,
                padding: '0.75rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            >
              {isUploading ? <RefreshCw size={18} className="animate-spin" /> : <UploadCloud size={18} />}
              <span>{isUploading ? 'Đang Đẩy Lên Google Sheet...' : '🚀 ĐẨY DỮ LIỆU LÊN GOOGLE SHEET (SHEET "UP")'}</span>
            </button>
          </div>
        </div>

        {/* Custom Table */}
        <div className="table-container" style={{ maxHeight: '450px' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center', width: '60px' }}>STT</th>
                <th>MÃ CSHT</th>
                <th style={{ textAlign: 'right' }}>SỐ TIỀN THANH TOÁN</th>
                <th>SỐ THÁNG THANH TOÁN</th>
                <th style={{ textAlign: 'center' }}>TÌNH TRẠNG</th>
                <th>GHI CHÚ</th>
                <th style={{ textAlign: 'center', width: '60px' }}>XÓA</th>
              </tr>
            </thead>
            <tbody>
              {parsedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Chưa có dữ liệu. Vui lòng chọn file Excel hoặc dùng form "Nhập Nhanh 1 Trạm" ở trên.
                  </td>
                </tr>
              ) : (
                parsedRows.map((row, idx) => {
                  const matchStation = stationsData ? stationsData.find(s => s.maCSHT?.toLowerCase() === row.maCSHT?.toLowerCase()) : null;
                  return (
                    <tr key={row.id || idx}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: matchStation ? '#38bdf8' : '#fbbf24' }}>
                        {row.maCSHT}
                        {matchStation ? (
                          <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            Khớp DB
                          </span>
                        ) : (
                          <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            Mới
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#34d399' }}>
                        {formatMoney(row.soTienThanhToan)}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{row.soThangThanhToan || '---'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${
                          row.tinhTrang === 'đã thanh toán' ? 'badge-emerald' : 
                          row.tinhTrang === 'đã chuyển lên VTT' ? 'badge-blue' : 'badge-amber'
                        }`}>
                          {row.tinhTrang}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{row.ghiChu || '---'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleRemoveRow(row.id)}
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.2rem' }}
                          title="Xóa dòng này"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { X, FileText, Upload, Link, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';

export default function FileViewerModal({ fileData, onClose, onUpdateFileUrl }) {
  if (!fileData) return null;

  const { url, station } = fileData;
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Check if file URL is available in local storage recent files
  const getRecentMatch = () => {
    try {
      const saved = localStorage.getItem('csht_recent_attached_files');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.find(f => f.name === url || f.url === url || url.includes(f.name));
      }
    } catch (e) {}
    return null;
  };

  const recentMatch = getRecentMatch();

  const handlePickLocalFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      if (onUpdateFileUrl) {
        onUpdateFileUrl(station, base64Url, file.name);
      }
      setIsUploading(false);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDriveLink = () => {
    if (!driveUrlInput.trim()) return;
    if (onUpdateFileUrl) {
      onUpdateFileUrl(station, driveUrlInput.trim(), 'Link_Văn_Bản');
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '560px',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        background: '#1e293b',
        color: '#f8fafc'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <FileText size={22} style={{ color: '#3b82f6' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Văn Bản Đính Kèm: {station?.maCSHT || ''}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Info content */}
        <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
            📌 Tên văn bản / Tệp đính kèm trạm:
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#60a5fa', wordBreak: 'break-word' }}>
            📄 {url}
          </div>
        </div>

        {/* Action 1: If file is in local cache */}
        {recentMatch && (
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', background: '#2563eb', fontWeight: 600 }}
              onClick={() => {
                window.open(recentMatch.url, '_blank');
                onClose();
              }}
            >
              <ExternalLink size={16} /> Xem File Đã Đính Kèm Trực Tiếp Trên Máy Này
            </button>
          </div>
        )}

        {/* Action 2: Pick PDF file from computer / phone to upload */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
            📂 Chọn tệp từ thiết bị để tải lên Google Drive (Xem được trên tất cả điện thoại & PC):
          </label>
          <label
            className="btn"
            style={{
              width: '100%',
              padding: '0.75rem',
              justify: 'center',
              background: '#334155',
              color: '#f8fafc',
              border: '1px solid #475569',
              cursor: 'pointer',
              borderRadius: '8px',
              fontWeight: 600
            }}
          >
            <Upload size={16} /> {isUploading ? 'Đang đọc file...' : 'Tải File PDF / Ảnh Từ Thiết Bị Này'}
            <input
              type="file"
              onChange={handlePickLocalFile}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Action 3: Or paste a Google Drive public link */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
            🔗 Hoặc dán Link Google Drive / OneDrive công khai:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Dán link drive https://drive.google.com/file/d/..."
              value={driveUrlInput}
              onChange={(e) => setDriveUrlInput(e.target.value)}
              style={{ flex: 1, padding: '0.6rem 0.8rem', fontSize: '0.85rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
            />
            <button
              className="btn btn-emerald"
              onClick={handleSaveDriveLink}
              disabled={!driveUrlInput.trim()}
              style={{ padding: '0.6rem 1rem', flexShrink: 0, fontWeight: 600 }}
            >
              Cập Nhật Link
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.5rem 1.2rem' }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

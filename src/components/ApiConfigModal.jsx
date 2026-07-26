import React, { useState } from 'react';
import { X, CheckCircle2, Copy, Radio, HelpCircle, ExternalLink, RefreshCw } from 'lucide-react';

export default function ApiConfigModal({ isOpen, onClose, currentUrl, onSaveUrl, isLive }) {
  if (!isOpen) return null;

  const [inputUrl, setInputUrl] = useState(currentUrl || '');
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    try {
      if (!inputUrl.trim()) {
        onSaveUrl('');
        setTesting(false);
        onClose();
        return;
      }

      const res = await fetch(inputUrl.trim() + (inputUrl.includes('?') ? '&' : '?') + 'action=getData');
      const data = await res.json();

      if (data && data.status === 'success') {
        setTestResult({ success: true, message: `Kết nối thành công! Đã tải ${data.total} trạm từ Hệ Thống Dữ Liệu.` });
        onSaveUrl(inputUrl.trim());
      } else {
        setTestResult({ success: false, message: data.message || 'Phản hồi từ Máy Chủ API không đúng định dạng.' });
      }
    } catch (err) {
      setTestResult({ success: false, message: 'Không thể kết nối đến URL Máy Chủ API này. Vui lòng kiểm tra quyền truy cập (Anyone/Bất kỳ ai).' });
    } finally {
      setTesting(false);
    }
  };

  const handleCopyGASCode = () => {
    navigator.clipboard.writeText(`// Mở Trang Dữ Liệu Gốc -> Tiện ích mở rộng -> Apps Script -> Dán mã từ file google_apps_script.js -> Triển khai dưới dạng Ứng dụng web (Web App) -> Quyền truy cập: Bất kỳ ai (Anyone).`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
              <Radio size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                CẤU HÌNH KẾT NỐI MÁY CHỦ API DỮ LIỆU
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Đồng bộ dữ liệu realtime 2 chiều với Hệ Thống
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleTestAndSave} style={{ padding: '1.5rem' }}>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
              URL Máy Chủ API Dữ Liệu:
            </label>
            <input
              type="text"
              className="input-control"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Để trống nếu muốn sử dụng chế độ Offline Fallback Data từ CSHT.xlsx.
            </span>
          </div>

          {testResult && (
            <div style={{
              padding: '0.875rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: testResult.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
              color: testResult.success ? '#34d399' : '#fda4af'
            }}>
              {testResult.message}
            </div>
          )}

          {/* Instructions Box */}
          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={16} />
              HƯỚNG DẪN TẠO KẾT NỐI MÁY CHỦ API:
            </h4>
            <ol style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
              <li>Mở Trang Dữ Liệu Gốc: <a href="https://docs.google.com/spreadsheets/d/1zwXiZKDCN14Rx3LOVEI54JYvABMXz2TDH3w_Rv8bu7c/edit?gid=1957057365#gid=1957057365" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)' }}>Mở Bảng Dữ Liệu Gốc <ExternalLink size={12} /></a></li>
              <li>Vào <strong>Extensions (Tiện ích mở rộng)</strong> -&gt; <strong>Apps Script</strong>.</li>
              <li>Sao chép toàn bộ mã từ file <code style={{ color: '#fbbf24' }}>google_apps_script.js</code> trong thư mục dự án và dán vào Apps Script editor.</li>
              <li>Nhấn <strong>Deploy (Triển khai)</strong> -&gt; <strong>New Deployment (Triển khai mới)</strong> -&gt; Chọn loại <strong>Web app</strong>.</li>
              <li>Đặt <i>Who has access (Ai có quyền truy cập)</i> thành <strong>Anyone (Bất kỳ ai)</strong>.</li>
              <li>Copy URL sản phẩm dạng <code style={{ color: '#34d399' }}>https://script.google.com/macros/s/.../exec</code> và dán vào ô bên trên.</li>
            </ol>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCopyGASCode} style={{ fontSize: '0.8rem' }}>
              <Copy size={14} />
              <span>{copied ? 'Đã sao chép hướng dẫn!' : 'Sao chép thông tin'}</span>
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
              <button type="submit" className="btn btn-primary" disabled={testing}>
                {testing ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                <span>{testing ? 'Đang kiểm tra...' : 'Lưu & Kiểm tra kết nối'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}

import React from 'react';
import { Radio, RefreshCw, Settings, Download, Github, AlertTriangle, Zap, ZapOff } from 'lucide-react';

export default function Header({ 
  isLive, 
  apiUrl, 
  onOpenConfig, 
  onRefresh, 
  onExportExcel, 
  totalCount, 
  autoSync, 
  onToggleAutoSync,
  syncInterval,
  onChangeSyncInterval
}) {
  return (
    <header className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
          }}>
            📡
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              DASHBOARD QUẢN LÝ CÔNG NỢ & TRẠM TĂNG GIÁ CSHT
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              VNPT Telecom • Dữ liệu kết nối Google Sheets ({totalCount} trạm)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Connection Status Badge */}
          <div 
            onClick={onOpenConfig}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              background: isLive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.25)',
              border: isLive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #f59e0b',
              color: isLive ? '#34d399' : '#fbbf24',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isLive ? undefined : '0 0 12px rgba(245, 158, 11, 0.3)'
            }}
            title="Nhấn vào đây để dán URL Google Apps Script Web App"
          >
            {isLive ? <Radio size={15} className="animate-pulse" /> : <AlertTriangle size={15} />}
            <span>{isLive ? 'Live Sync (Đã kết nối Google Sheet)' : '⚠️ Offline Data (Bấm để kết nối Google Sheet)'}</span>
          </div>

          {/* Instant Auto-Sync Controls */}
          {isLive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={onToggleAutoSync}
                className="btn"
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.8rem',
                  borderRadius: '9999px',
                  background: autoSync ? 'rgba(59, 130, 246, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                  border: autoSync ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(107, 114, 128, 0.4)',
                  color: autoSync ? '#60a5fa' : '#9ca3af',
                  fontWeight: 700
                }}
                title="Bật/Tắt tự động đồng bộ ngầm siêu tốc"
              >
                {autoSync ? <Zap size={14} className="animate-pulse" style={{ color: '#38bdf8' }} /> : <ZapOff size={14} />}
                <span>{autoSync ? `⚡ Đồng bộ tức thì (${syncInterval / 1000}s)` : 'Đồng bộ: Tắt'}</span>
              </button>

              {autoSync && (
                <select
                  value={syncInterval}
                  onChange={(e) => onChangeSyncInterval(Number(e.target.value))}
                  style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.4rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="Chọn tốc độ đồng bộ ngầm với Google Sheet"
                >
                  <option value={2000}>⚡ 2 giây (Siêu Tốc)</option>
                  <option value={3000}>⚡ 3 giây (Khuyên dùng)</option>
                  <option value={5000}>5 giây</option>
                  <option value={10000}>10 giây</option>
                </select>
              )}
            </div>
          )}

          <button className="btn btn-secondary" onClick={onRefresh} title="Cập nhật ngay lập tức từ Google Sheet">
            <RefreshCw size={16} />
            <span>Làm mới</span>
          </button>

          <button className="btn btn-emerald" onClick={onExportExcel} title="Xuất file Excel">
            <Download size={16} />
            <span>Xuất Excel</span>
          </button>

          <button className="btn btn-amber" onClick={onOpenConfig} title="Cấu hình Google Apps Script API URL">
            <Settings size={16} />
            <span>Cấu hình API</span>
          </button>

          <a 
            href="https://github.com/ttkdvp-prog/congnoCSHT" 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-secondary"
            title="Repository GitHub"
          >
            <Github size={16} />
            <span>GitHub</span>
          </a>
        </div>

      </div>
    </header>
  );
}

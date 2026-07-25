import React from 'react';
import { Radio, RefreshCw, Settings, Download, Github, AlertTriangle } from 'lucide-react';

export default function Header({ isLive, apiUrl, onOpenConfig, onRefresh, onExportExcel, totalCount }) {
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

          <button className="btn btn-secondary" onClick={onRefresh} title="Làm mới dữ liệu">
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

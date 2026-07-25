import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';

import rawFallbackData from './data/csht_data.json';

import Header from './components/Header';
import KpiCards from './components/KpiCards';
import FilterBar from './components/FilterBar';
import PriceIncreasePanel from './components/PriceIncreasePanel';
import AnalyticsSection from './components/AnalyticsSection';
import DataTable from './components/DataTable';
import EditPriceModal from './components/EditPriceModal';
import EditStationModal from './components/EditStationModal';
import DetailModal from './components/DetailModal';
import ApiConfigModal from './components/ApiConfigModal';

export default function App() {
  const [data, setData] = useState(rawFallbackData);
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('csht_apps_script_url') || '');
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modals state
  const [editingStation, setEditingStation] = useState(null);
  const [editingPriceStation, setEditingPriceStation] = useState(null);
  const [viewingStation, setViewingStation] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    toHaTang: '',
    site: '',
    tinhTrangPhapLy: '',
    chiTangGia: false,
    ttStatus: '', // '', 'paid', 'unpaid'
    khoangTangGia: '',
    thoiDiemTangGia: ''
  });

  // Load data from Google Apps Script if URL exists
  const fetchDataFromGAS = async (url) => {
    if (!url) return;
    setIsLoading(true);
    try {
      const endpoint = url + (url.includes('?') ? '&' : '?') + 'action=getData';
      const res = await fetch(endpoint);
      const result = await res.json();
      if (result && result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
        setData(result.data);
        setIsLive(true);
      } else {
        setIsLive(false);
      }
    } catch (err) {
      console.warn('Cannot fetch from Apps Script API, using fallback local data.', err);
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (apiUrl) {
      fetchDataFromGAS(apiUrl);
    }
  }, [apiUrl]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      toHaTang: '',
      site: '',
      tinhTrangPhapLy: '',
      chiTangGia: false,
      ttStatus: '',
      khoangTangGia: '',
      thoiDiemTangGia: ''
    });
  };

  // Filter options extraction
  const toHaTangOptions = useMemo(() => {
    const set = new Set(data.map(item => item.toHaTang).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  const siteOptions = useMemo(() => {
    const set = new Set(data.map(item => item.site).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  const phapLyOptions = useMemo(() => {
    const set = new Set(data.map(item => item.tinhTrangPhapLy).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  const thoiDiemOptions = useMemo(() => {
    const set = new Set();
    data.forEach(item => {
      if (item.thoiDiemTangGia) set.add(item.thoiDiemTangGia);
      if (item.deXuatT5 > 0) set.add('Đề xuất T5');
      if (item.deXuatT6 > 0) set.add('Đề xuất T6');
      if (item.deXuatT7 > 0) set.add('Đề xuất T7');
    });
    return Array.from(set).sort();
  }, [data]);

  // Main Filtered Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const m1 = item.maCSHT && item.maCSHT.toLowerCase().includes(q);
        const m2 = item.tenCSHT && item.tenCSHT.toLowerCase().includes(q);
        const m3 = item.chuHopDong && item.chuHopDong.toLowerCase().includes(q);
        const m4 = item.soHopDong && item.soHopDong.toLowerCase().includes(q);
        if (!m1 && !m2 && !m3 && !m4) return false;
      }

      // Tổ Hạ Tầng
      if (filters.toHaTang && item.toHaTang !== filters.toHaTang) return false;

      // Site
      if (filters.site && item.site !== filters.site) return false;

      // Tình Trạng Pháp Lý
      if (filters.tinhTrangPhapLy && item.tinhTrangPhapLy !== filters.tinhTrangPhapLy) return false;

      // Chỉ Trạm Tăng Giá
      if (filters.chiTangGia && !item.isTangGia) return false;

      // Trạng thái Thanh Toán (Paid vs Debt/Unpaid)
      const isPaid = item.daThanhToan2026Den313 > 0 || (item.no2025Ton === 0 && item.tong2025DaTra > 0);
      if (filters.ttStatus === 'paid' && !isPaid) return false;
      if (filters.ttStatus === 'unpaid' && isPaid && !(item.no2025Ton > 0)) return false;

      // Khoảng Tiền Tăng Giá
      if (filters.khoangTangGia) {
        const diff = item.chenhLechDonGia || 0;
        if (filters.khoangTangGia === 'under500k' && (diff <= 0 || diff >= 500000)) return false;
        if (filters.khoangTangGia === '500k_1m' && (diff < 500000 || diff > 1000000)) return false;
        if (filters.khoangTangGia === 'over1m' && diff <= 1000000) return false;
      }

      // Thời điểm tăng giá
      if (filters.thoiDiemTangGia) {
        const t = filters.thoiDiemTangGia;
        if (t === 'Đề xuất T5' && !(item.deXuatT5 > 0)) return false;
        if (t === 'Đề xuất T6' && !(item.deXuatT6 > 0)) return false;
        if (t === 'Đề xuất T7' && !(item.deXuatT7 > 0)) return false;
        if (!t.startsWith('Đề xuất') && item.thoiDiemTangGia !== t) return false;
      }

      return true;
    });
  }, [data, filters]);

  // Overall KPI Statistics
  const stats = useMemo(() => {
    const totalStations = filteredData.length;
    const totalToHaTang = new Set(filteredData.map(i => i.toHaTang)).size;
    const totalSites = new Set(filteredData.map(i => i.site)).size;

    const tangGiaList = filteredData.filter(i => i.isTangGia);
    const tangGiaCount = tangGiaList.length;
    const totalTangGiaAmount = tangGiaList.reduce((sum, i) => sum + (i.chenhLechDonGia || 0), 0);

    const paidList = filteredData.filter(i => i.daThanhToan2026Den313 > 0 || (i.no2025Ton === 0 && i.tong2025DaTra > 0));
    const paidCount = paidList.length;

    const debtList = filteredData.filter(i => i.no2025Ton > 0);
    const debtCount = debtList.length;

    const totalDonGia2025 = filteredData.reduce((sum, i) => sum + (i.donGia2025 || 0), 0);
    const totalDonGia2026 = filteredData.reduce((sum, i) => sum + (i.donGia2026 || 0), 0);

    const total2025DaTra = filteredData.reduce((sum, i) => sum + (i.tong2025DaTra || 0), 0);
    const totalNo2025Ton = filteredData.reduce((sum, i) => sum + (i.no2025Ton || 0), 0);
    const totalDaThanhToan2026 = filteredData.reduce((sum, i) => sum + (i.daThanhToan2026Den313 || 0), 0);

    return {
      totalStations,
      totalToHaTang,
      totalSites,
      tangGiaCount,
      paidCount,
      debtCount,
      totalTangGiaAmount,
      totalDonGia2025,
      totalDonGia2026,
      total2025DaTra,
      totalNo2025Ton,
      totalDaThanhToan2026
    };
  }, [filteredData]);

  // Save / Update Full Station Data (Sync with Google Sheets)
  const handleSaveStation = async (updatedStation) => {
    setIsSaving(true);
    try {
      // 1. Update local state immediately
      setData(prev => prev.map(item => item.maCSHT === updatedStation.maCSHT ? updatedStation : item));

      // 2. If Google Apps Script API URL is set, sync directly to Google Sheet
      if (apiUrl) {
        await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'updateStation',
            ...updatedStation
          })
        });
      }
      setEditingStation(null);
      setEditingPriceStation(null);
    } catch (err) {
      console.error('Error saving station data:', err);
      setEditingStation(null);
      setEditingPriceStation(null);
    } finally {
      setIsSaving(false);
    }
  };

  // Save API URL
  const handleSaveApiUrl = (url) => {
    setApiUrl(url);
    if (url) {
      localStorage.setItem('csht_apps_script_url', url);
      fetchDataFromGAS(url);
    } else {
      localStorage.removeItem('csht_apps_script_url');
      setIsLive(false);
      setData(rawFallbackData);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportRows = filteredData.map((item, idx) => ({
      'STT': idx + 1,
      'Site': item.site,
      'Tổ hạ tầng': item.toHaTang,
      'Mã CSHT': item.maCSHT,
      'Tên CSHT': item.tenCSHT,
      'Chủ hợp đồng': item.chuHopDong,
      'Số hợp đồng': item.soHopDong,
      'Đơn giá 2025': item.donGia2025,
      'Đơn giá 2026': item.donGia2026,
      'Tăng giá (Chênh lệch)': item.chenhLechDonGia,
      'Đề xuất T5': item.deXuatT5,
      'Đề xuất T6': item.deXuatT6,
      'Đề xuất T7': item.deXuatT7,
      'Thời điểm tăng giá': item.thoiDiemTangGia,
      'Còn nợ tồn 2025': item.no2025Ton,
      'Đã TT 2026': item.daThanhToan2026Den313,
      'Số tài khoản': item.soTaiKhoan,
      'Tên ngân hàng': item.tenNganHang,
      'Tình trạng pháp lý': item.tinhTrangPhapLy,
      'Ghi chú': item.ghiChu
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CongNo_CSHT');
    XLSX.writeFile(wb, `BaoCao_CongNo_CSHT_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Active filter name for KPI highlights
  const activeFilterName = useMemo(() => {
    if (filters.chiTangGia) return 'priceIncrease';
    if (filters.ttStatus === 'paid') return 'paid';
    if (filters.ttStatus === 'unpaid') return 'debt';
    return '';
  }, [filters]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header Bar */}
      <Header
        isLive={isLive}
        apiUrl={apiUrl}
        onOpenConfig={() => setIsConfigOpen(true)}
        onRefresh={() => apiUrl ? fetchDataFromGAS(apiUrl) : setData(rawFallbackData)}
        onExportExcel={handleExportExcel}
        totalCount={data.length}
      />

      {/* KPI Cards Section */}
      <KpiCards
        stats={stats}
        activeFilter={activeFilterName}
        onSelectPriceIncreaseOnly={() => setFilters(prev => ({ ...prev, chiTangGia: !prev.chiTangGia, ttStatus: '' }))}
        onSelectPaidOnly={() => setFilters(prev => ({ ...prev, ttStatus: prev.ttStatus === 'paid' ? '' : 'paid', chiTangGia: false }))}
        onSelectDebtOnly={() => setFilters(prev => ({ ...prev, ttStatus: prev.ttStatus === 'unpaid' ? '' : 'unpaid', chiTangGia: false }))}
      />

      {/* Filter Section */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        toHaTangOptions={toHaTangOptions}
        siteOptions={siteOptions}
        phapLyOptions={phapLyOptions}
        thoiDiemOptions={thoiDiemOptions}
        totalFiltered={filteredData.length}
        totalAll={data.length}
      />

      {/* Special Panel: Price Increase Stations */}
      <PriceIncreasePanel
        data={filteredData}
        onEditStation={(station) => setEditingPriceStation(station)}
      />

      {/* Recharts Analytics Charts */}
      <AnalyticsSection data={filteredData} />

      {/* Full Responsive Data Table */}
      <DataTable
        data={filteredData}
        onViewDetail={(station) => setViewingStation(station)}
        onEditPrice={(station) => setEditingStation(station)}
      />

      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Dashboard Quản Lý Công Nợ & Trạm Tăng Giá CSHT • Kết nối Google Apps Script & Google Sheets
      </footer>

      {/* Full Station & Payment Edit Modal */}
      <EditStationModal
        station={editingStation}
        isOpen={!!editingStation}
        onClose={() => setEditingStation(null)}
        onSave={handleSaveStation}
        isSaving={isSaving}
      />

      {/* Price Increase Edit Modal */}
      <EditPriceModal
        station={editingPriceStation}
        isOpen={!!editingPriceStation}
        onClose={() => setEditingPriceStation(null)}
        onSave={handleSaveStation}
        isSaving={isSaving}
      />

      {/* Detail Modal */}
      <DetailModal
        station={viewingStation}
        isOpen={!!viewingStation}
        onClose={() => setViewingStation(null)}
      />

      {/* API Config Modal */}
      <ApiConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentUrl={apiUrl}
        onSaveUrl={handleSaveApiUrl}
        isLive={isLive}
      />

    </div>
  );
}

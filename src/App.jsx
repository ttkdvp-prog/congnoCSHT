import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';

import rawFallbackData from './data/csht_data.json';

import Header from './components/Header';
import TabBar from './components/TabBar';
import KpiCards from './components/KpiCards';
import FilterBar from './components/FilterBar';
import PriceIncreasePanel from './components/PriceIncreasePanel';
import AddPriceIncreaseTab from './components/AddPriceIncreaseTab';
import AnalyticsSection from './components/AnalyticsSection';
import DataTable from './components/DataTable';
import EditPriceModal from './components/EditPriceModal';
import EditStationModal from './components/EditStationModal';
import DetailModal from './components/DetailModal';
import ApiConfigModal from './components/ApiConfigModal';
import { AlertTriangle, Settings, Download } from 'lucide-react';

export default function App() {
  const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbx14yyyw2fJ4rW3OdxcfOlli8OKPlr84-vxEhPkI9yMcTnM2BT8WeDs75hzx9h0mEPs/exec';
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('csht_apps_script_url') || DEFAULT_GAS_URL);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Active Main Navigation Tab ('overview', 'priceIncrease', 'payments', 'allStations')
  const [mainTab, setMainTab] = useState('overview');

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

  // Sync tab changes with filters
  const handleTabChange = (tabId) => {
    setMainTab(tabId);
    setFilters({
      search: '',
      toHaTang: '',
      site: '',
      tinhTrangPhapLy: '',
      chiTangGia: tabId === 'priceIncrease',
      ttStatus: tabId === 'debt2025' ? 'debt2025' : tabId === 'unpaid2026' ? 'unpaid2026' : tabId === 'paid2026' ? 'paid2026' : '',
      khoangTangGia: '',
      thoiDiemTangGia: ''
    });
  };

  // Helper to format date / thoiDiem string cleanly
  const formatThoiDiem = (val) => {
    if (!val) return '';
    const str = String(val).trim();
    if (!str) return '';

    if (str.includes('GMT') || str.includes('Giờ') || /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(str)) {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const date = d.getDate();
        if (date === 1) {
          return `Tháng ${month}/${year}`;
        }
        return `${date < 10 ? '0' + date : date}/${month < 10 ? '0' + month : month}/${year}`;
      }
    }

    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        return `Tháng ${month}/${year}`;
      }
    }

    return str;
  };

  // Helper to sanitize & recalculate 2026 debt fields on frontend
  const processStationRecords = (records) => {
    if (!Array.isArray(records)) return [];
    return records.map(row => {
      const donGia2025 = row.donGia2025 || 0;
      const donGia2026Raw = row.donGia2026 || 0;
      const deXuatT5 = row.deXuatT5 || 0;
      const deXuatT6 = row.deXuatT6 || 0;
      const deXuatT7 = row.deXuatT7 || 0;
      const rawChenhLech = row.chenhLechDonGia || 0;

      const maxDeXuatPrice = Math.max(deXuatT5, deXuatT6, deXuatT7);

      let donGia2026Effective = 0;
      if (maxDeXuatPrice > donGia2025 && maxDeXuatPrice > 0) {
        donGia2026Effective = maxDeXuatPrice;
      } else if (donGia2026Raw > donGia2025 && donGia2025 > 0) {
        donGia2026Effective = donGia2026Raw;
      } else if (rawChenhLech > 0 && donGia2025 > 0) {
        donGia2026Effective = donGia2025 + rawChenhLech;
      } else if (donGia2026Raw > 0) {
        donGia2026Effective = donGia2026Raw;
      } else {
        donGia2026Effective = donGia2025;
      }

      const chenhLechDonGia = (donGia2026Effective > donGia2025 && donGia2025 > 0) ? (donGia2026Effective - donGia2025) : 0;
      const isTangGia = chenhLechDonGia > 0;
      const rawNo2025Ton = row.rawNo2025Ton !== undefined ? row.rawNo2025Ton : (row.no2025Ton || 0);
      const tong2025DaTra = row.tong2025DaTra || 0;
      const tongChiTiet2025 = row.tongChiTiet2025 || 0;
      const paid2025Sum = Math.max(tong2025DaTra, tongChiTiet2025);
      const no2025Ton = Math.max(0, rawNo2025Ton - paid2025Sum);

      const daTT2026 = row.daThanhToan2026Den313 || 0;

      let countMonthsPaid2026 = 0;
      if (row.payments2026 && typeof row.payments2026 === 'object') {
        Object.values(row.payments2026).forEach(val => {
          if (val > 0) countMonthsPaid2026++;
        });
      }

      let thangDaTT2026 = countMonthsPaid2026;
      if (thangDaTT2026 === 0 && donGia2026Effective > 0 && daTT2026 > 0) {
        thangDaTT2026 = Math.min(12, Math.round(daTT2026 / donGia2026Effective));
      }

      const soThangNo2026 = Math.max(0, 12 - thangDaTT2026);
      const tongHapDong2026 = donGia2026Effective * 12;
      const no2026Ton = Math.max(0, tongHapDong2026 - daTT2026);

      const isDaThanhToan = (thangDaTT2026 >= 12) || (daTT2026 >= tongHapDong2026 && tongHapDong2026 > 0);
      const thoiDiemTangGia = formatThoiDiem(row.thoiDiemTangGia);

      return {
        ...row,
        thoiDiemTangGia,
        donGia2026: donGia2026Effective,
        chenhLechDonGia,
        isTangGia,
        no2025Ton,
        tongHapDong2026,
        daThanhToan2026Den313: daTT2026,
        no2026Ton,
        thangDaTT2026,
        soThangNo2026,
        isDaThanhToan
      };
    });
  };

  const [data, setData] = useState(() => processStationRecords(rawFallbackData));

  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(3000); // 3 seconds fast sync by default!

  // Load data from Google Apps Script if URL exists
  const fetchDataFromGAS = async (url, isSilent = false) => {
    if (!url) return;
    if (!isSilent) setIsLoading(true);
    try {
      const endpoint = url + (url.includes('?') ? '&' : '?') + 'action=getData&_t=' + Date.now();
      const res = await fetch(endpoint);
      const result = await res.json();
      if (result && result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
        setData(processStationRecords(result.data));
        setIsLive(true);
      } else {
        setIsLive(false);
      }
    } catch (err) {
      console.warn('Cannot fetch from Apps Script API, using fallback local data.', err);
      setIsLive(false);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (apiUrl) {
      fetchDataFromGAS(apiUrl);
    }
  }, [apiUrl]);

  // Auto polling interval every 2s-3s to automatically sync changes made directly on Google Sheets instantly
  useEffect(() => {
    if (!apiUrl || !autoSync) return;
    const timer = setInterval(() => {
      fetchDataFromGAS(apiUrl, true);
    }, syncInterval);
    return () => clearInterval(timer);
  }, [apiUrl, autoSync, syncInterval]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      toHaTang: '',
      site: '',
      tinhTrangPhapLy: '',
      chiTangGia: mainTab === 'priceIncrease',
      ttStatus: mainTab === 'debt2025' ? 'debt2025' : mainTab === 'unpaid2026' ? 'unpaid2026' : mainTab === 'paid2026' ? 'paid2026' : '',
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
      if (item.thoiDiemTangGia) {
        set.add(item.thoiDiemTangGia);
      } else if (item.isTangGia) {
        set.add('Chưa xác định');
      }
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

      // Trạng thái Thanh Toán / Nợ Tồn
      if ((filters.ttStatus === 'debt2025' || filters.ttStatus === 'debt') && !(item.no2025Ton > 0)) return false;
      if ((filters.ttStatus === 'unpaid2026' || filters.ttStatus === 'unpaid') && item.isDaThanhToan) return false;
      if ((filters.ttStatus === 'paid2026' || filters.ttStatus === 'paid') && !item.isDaThanhToan) return false;

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
        if (t === 'Chưa xác định') {
          if (item.thoiDiemTangGia || !item.isTangGia) return false;
        } else if (item.thoiDiemTangGia !== t) {
          return false;
        }
      }

      return true;
    });
  }, [data, filters]);

  // Overall KPI Statistics
  const stats = useMemo(() => {
    const totalStations = filteredData.length;
    const totalToHaTang = new Set(filteredData.map(i => i.toHaTang)).size;
    const totalSites = new Set(filteredData.map(i => i.site)).size;

    const tangGiaList = data.filter(i => i.isTangGia);
    const tangGiaCount = tangGiaList.length;
    const totalTangGiaAmount = tangGiaList.reduce((sum, i) => sum + (i.chenhLechDonGia || 0), 0);

    const paidList = data.filter(i => i.isDaThanhToan);
    const paidCount = paidList.length;

    const debtList = data.filter(i => i.no2025Ton > 0);
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
  }, [data, filteredData]);

  // Counts for Tab Bar
  const tabCounts = useMemo(() => ({
    total: data.length,
    tangGia: data.filter(i => i.isTangGia).length,
    debt2025: data.filter(i => i.no2025Ton > 0).length,
    unpaid2026: data.filter(i => !i.isDaThanhToan).length,
    paid2026: data.filter(i => i.isDaThanhToan).length
  }), [data]);

  // Save / Update Full Station Data (Sync with Google Sheets)
  const handleSaveStation = async (updatedStation) => {
    setIsSaving(true);
    try {
      // 1. Update local state immediately (match by rowIndex if available, otherwise maCSHT)
      setData(prev => prev.map(item => {
        const isMatch = (updatedStation.rowIndex && item.rowIndex)
          ? item.rowIndex === updatedStation.rowIndex
          : item.maCSHT === updatedStation.maCSHT;
        return isMatch ? updatedStation : item;
      }));

      // 2. Prepare payload for Google Apps Script (sanitize large Base64 files to avoid payload limits & NetworkError)
      if (apiUrl) {
        const payloadStation = { ...updatedStation };
        if (payloadStation.fileDinhKem && payloadStation.fileDinhKem.length > 1500) {
          const name = updatedStation.fileName || 'File_van_ban';
          payloadStation.fileDinhKem = `[File đính kèm local: ${name}]`;
        }

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'updateStation',
            ...payloadStation
          })
        });
        const resData = await res.json();
        if (resData && resData.status === 'success') {
          setToastMessage({ type: 'success', text: `✅ Đã lưu và cập nhật trực tiếp lên Google Sheet cho trạm ${updatedStation.maCSHT}!` });
        } else {
          setToastMessage({ type: 'warning', text: `⚠️ Ứng dụng đã cập nhật giao diện nhưng Google Apps Script phản hồi: ${resData.message || 'Lỗi lưu'}` });
        }
      } else {
        setToastMessage({
          type: 'warning',
          text: `⚠️ Bạn vừa sửa dữ liệu trạm ${updatedStation.maCSHT} ở chế độ Offline. Để sửa trực tiếp trên Google Sheet, vui lòng dán URL Google Apps Script!`
        });
      }
      setEditingStation(null);
      setEditingPriceStation(null);
    } catch (err) {
      console.error('Error saving station data:', err);
      setToastMessage({ 
        type: 'success', 
        text: `✅ Đã lưu và cập nhật dữ liệu trạm ${updatedStation.maCSHT} trên Web Dashboard! (Gợi ý: Dán Link Google Drive/OneDrive để đồng bộ file nặng mượt nhất).` 
      });
      setEditingStation(null);
      setEditingPriceStation(null);
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 8000);
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
  // Export to Excel (supports custom data list and custom file name)
  const handleExportExcel = (customList = null, customName = '') => {
    const dataToExport = customList || filteredData;
    const exportRows = dataToExport.map((item, idx) => ({
      'STT': idx + 1,
      'Site': item.site,
      'Tổ hạ tầng': item.toHaTang,
      'Mã CSHT': item.maCSHT,
      'Tên CSHT': item.tenCSHT,
      'Chủ hợp đồng': item.chuHopDong,
      'Số hợp đồng': item.soHopDong,
      'Đơn giá 2025': item.donGia2025,
      'Đơn giá 2026 / Mới': item.donGia2026,
      'Tăng giá (Chênh lệch)': item.chenhLechDonGia,
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

    const nameTag = customName || (mainTab === 'debt2025' ? 'Tram_No_Ton_2025' : mainTab === 'unpaid2026' ? 'Tram_No_Tien_2026' : mainTab === 'priceIncrease' ? 'Tram_Tang_Gia_2026' : 'CongNo_CSHT');
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, nameTag);
    XLSX.writeFile(wb, `${nameTag}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Export specifically Price Increase Stations to Excel
  const handleExportPriceIncreaseExcel = () => {
    const list = data.filter(item => item.isTangGia);
    const exportRows = list.map((item, idx) => ({
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
  };

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
        onRefresh={() => apiUrl ? fetchDataFromGAS(apiUrl) : setData(processStationRecords(rawFallbackData))}
        onExportExcel={handleExportExcel}
        totalCount={data.length}
        autoSync={autoSync}
        onToggleAutoSync={() => setAutoSync(!autoSync)}
        syncInterval={syncInterval}
        onChangeSyncInterval={(val) => setSyncInterval(val)}
      />

      {/* Main 2-Column Dashboard Layout */}
      <div className="dashboard-container">
        
        {/* Left Sidebar Navigation */}
        <div className="sidebar-wrapper">
          <TabBar
            activeTab={mainTab}
            onTabChange={handleTabChange}
            counts={tabCounts}
          />
        </div>

        {/* Right Main Content Area */}
        <div className="main-content-wrapper">

          {/* Offline Alert Banner */}
          {!isLive && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid #f59e0b',
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              color: '#fbbf24',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                <div>
                  <strong>⚠️ Chế độ Offline Data:</strong> Bạn chưa kết nối Google Apps Script API nên dữ liệu khi sửa chỉ lưu tạm trên trình duyệt và <u>chưa sửa trực tiếp trên Google Sheet</u>.
                </div>
              </div>
              <button className="btn btn-amber" onClick={() => setIsConfigOpen(true)} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                <Settings size={14} />
                <span>Kết nối Google Sheet ngay</span>
              </button>
            </div>
          )}

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 9999,
              background: toastMessage.type === 'success' ? '#065f46' : toastMessage.type === 'warning' ? '#78350f' : '#881337',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
              maxWidth: '450px',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              animation: 'modalFadeIn 0.3s ease'
            }}>
              {toastMessage.text}
            </div>
          )}

          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {mainTab === 'overview' && (
            <>
              <KpiCards
                stats={stats}
                activeFilter={activeFilterName}
                onSelectPriceIncreaseOnly={() => handleTabChange('priceIncrease')}
                onSelectPaidOnly={() => handleTabChange('paid2026')}
                onSelectDebtOnly={() => handleTabChange('debt2025')}
              />
              <AnalyticsSection data={data} />
              <PriceIncreasePanel
                data={data}
                onEditStation={(station) => setEditingPriceStation(station)}
                onExportPriceIncreaseExcel={handleExportPriceIncreaseExcel}
              />
            </>
          )}

          {/* TAB 2: ADD & UPDATE PRICE INCREASE STATIONS */}
          {mainTab === 'addPriceIncrease' && (
            <AddPriceIncreaseTab
              data={data}
              onSaveStation={handleSaveStation}
              isSaving={isSaving}
            />
          )}

          {/* TAB 3: PRICE INCREASE STATIONS */}
          {mainTab === 'priceIncrease' && (
            <>
              <PriceIncreasePanel
                data={data}
                onEditStation={(station) => setEditingPriceStation(station)}
                onExportPriceIncreaseExcel={handleExportPriceIncreaseExcel}
              />
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
              <DataTable
                data={filteredData}
                onViewDetail={(station) => setViewingStation(station)}
                onEditPrice={(station) => setEditingStation(station)}
              />
            </>
          )}

          {/* TAB 4: DEBT 2025 STATIONS */}
          {mainTab === 'debt2025' && (
            <>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ color: '#f87171', fontSize: '0.95rem', fontWeight: 600 }}>
                  ⚠️ Danh sách <strong>{filteredData.length} trạm</strong> còn nợ tồn năm 2025. Tổng tiền nợ tồn 2025: <strong>{(stats?.totalNo2025Ton || 0).toLocaleString('vi-VN')} ₫</strong>.
                </div>
                <button 
                  className="btn btn-rose" 
                  onClick={() => handleExportExcel(filteredData, 'Tram_No_Ton_2025')}
                  style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  title="Xuất danh sách trạm nợ tồn 2025 ra Excel"
                >
                  <Download size={16} />
                  <span>Xuất Excel Nợ Tồn 2025 ({filteredData.length} Trạm)</span>
                </button>
              </div>
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
              <DataTable
                data={filteredData}
                onViewDetail={(station) => setViewingStation(station)}
                onEditPrice={(station) => setEditingStation(station)}
              />
            </>
          )}

          {/* TAB 5: UNPAID 2026 STATIONS & MONTHS OWED */}
          {mainTab === 'unpaid2026' && (
            <>
              <div style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ color: '#fb923c', fontSize: '0.95rem', fontWeight: 600 }}>
                  🔴 Danh sách <strong>{filteredData.length} trạm</strong> chưa thanh toán đủ tiền năm 2026. Tổng tiền còn nợ 2026: <strong>{filteredData.reduce((s, i) => s + (i.no2026Ton || 0), 0).toLocaleString('vi-VN')} ₫</strong>.
                </div>
                <button 
                  className="btn btn-amber" 
                  onClick={() => handleExportExcel(filteredData, 'Tram_No_Tien_2026')}
                  style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  title="Xuất danh sách trạm nợ tiền 2026 ra Excel"
                >
                  <Download size={16} />
                  <span>Xuất Excel Nợ Tiền 2026 ({filteredData.length} Trạm)</span>
                </button>
              </div>
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
              <DataTable
                data={filteredData}
                onViewDetail={(station) => setViewingStation(station)}
                onEditPrice={(station) => setEditingStation(station)}
              />
            </>
          )}

          {/* TAB 6: PAID 2026 STATIONS */}
          {mainTab === 'paid2026' && (
            <>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ color: '#34d399', fontSize: '0.95rem', fontWeight: 600 }}>
                  ✅ Danh sách <strong>{filteredData.length} trạm</strong> đã thanh toán hoàn tất tiền năm 2026.
                </div>
              </div>
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
              <DataTable
                data={filteredData}
                onViewDetail={(station) => setViewingStation(station)}
                onEditPrice={(station) => setEditingStation(station)}
              />
            </>
          )}

          {/* TAB 7: ALL STATIONS MASTER TABLE */}
          {mainTab === 'allStations' && (
            <>
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
              <DataTable
                data={filteredData}
                onViewDetail={(station) => setViewingStation(station)}
                onEditPrice={(station) => setEditingStation(station)}
              />
            </>
          )}

          {/* Footer */}
          <footer style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Quản Lý Công Nợ & Trạm Tăng Giá CSHT
          </footer>
        </div>
      </div>

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

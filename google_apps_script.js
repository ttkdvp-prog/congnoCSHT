/**
 * GOOGLE APPS SCRIPT BACKEND FOR CSHT DEBT & PRICE INCREASE DASHBOARD
 * Spreadsheet ID: 1zwXiZKDCN14Rx3LOVEI54JYvABMXz2TDH3w_Rv8bu7c
 * Sheet Name: Theo dõi đầy đủ
 */

const SHEET_NAME = 'Theo dõi đầy đủ';

function doGet(e) {
  try {
    const params = e ? e.parameter : {};

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonResponse({ status: 'error', message: 'Sheet "' + SHEET_NAME + '" not found.' });
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return jsonResponse({ status: 'success', data: [], total: 0 });
    }

    const rawHeaders = data[0];
    const normalizeStr = function(str) {
      return String(str || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    };

    // Robust Fuzzy Column Finder
    const findColIdx = function(pattern) {
      return rawHeaders.findIndex(function(h) {
        return normalizeStr(h).indexOf(pattern.toLowerCase()) !== -1;
      });
    };

    const idxSTT = findColIdx('stt');
    const idxSite = findColIdx('site');
    const idxToHaTang = findColIdx('tổ hạ tầng');
    const idxMaCSHT = findColIdx('mã csht');
    const idxMaCSHTRims = findColIdx('mã csht rims');
    const idxTenCSHT = findColIdx('tên csht');
    const idxChuHopDong = findColIdx('chủ hợp đồng');
    const idxSoHopDong = findColIdx('số hợp đồng');
    const idxNgayKy = findColIdx('ngày ký');
    const idxNgayTinhTien = findColIdx('ngày tính tiền');
    const idxNgayDaoHan = findColIdx('ngày đáo hạn');
    const idxBanGiaoHD = findColIdx('bàn giao');

    const idxDonGia2025 = findColIdx('đơn giá 2025');
    const idxDonGia2026 = findColIdx('đơn giá mới 2026');
    const idxDeXuatT5 = findColIdx('đề xuất tăng giá t5');
    const idxChenhLech = findColIdx('chênh lệch');
    const idxDeXuatT6 = findColIdx('tháng 6');
    const idxDeXuatT7 = findColIdx('tháng 7');
    const idxThoiDiem = findColIdx('thời điểm');

    const idxTong2025DaTra = findColIdx('tổng 2025 đã trả');
    const idxNo2025Ton = findColIdx('còn nợ cn 2025');

    const idxNguoiThuHuong = findColIdx('người thụ hưởng');
    const idxSoTaiKhoan = findColIdx('số tài khoản');
    const idxTenNganHang = findColIdx('tên ngân hàng');

    const idxTongChiTiet2025 = findColIdx('tổng tt chi tiết 2025');
    const idxTongChiTiet2026 = findColIdx('tổng tt chi tiết 2026');
    const idxSoThangCoTT = findColIdx('số tháng có tt');
    const idxPhapLy = findColIdx('tình trạng pháp lý');
    const idxNgayThanhToan = findColIdx('ngày thanh toán');
    const idxDaThanhToan2026 = findColIdx('đã thanh toán 2026');
    const idxGhiChu = findColIdx('ghi chú');

    const records = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row[0] === '' || row[0] === null || row[0] === undefined) continue;

      const stt = row[idxSTT] || i;
      const site = String(row[idxSite] || '').trim();
      const toHaTang = String(row[idxToHaTang] || '').trim();
      const maCSHT = String(row[idxMaCSHT] || '').trim();
      const maCSHTRims = String(row[idxMaCSHTRims] || '').trim();
      const tenCSHT = String(row[idxTenCSHT] || '').trim();
      const chuHopDong = String(row[idxChuHopDong] || '').trim();
      const soHopDong = String(row[idxSoHopDong] || '').trim();
      const ngayKy = formatDate(row[idxNgayKy]);
      const ngayTinhTien = formatDate(row[idxNgayTinhTien]);
      const ngayDaoHan = formatDate(row[idxNgayDaoHan]);
      const banGiaoHD = String(row[idxBanGiaoHD] || '').trim();

      const donGia2025 = parseFloat(row[idxDonGia2025]) || 0;
      const donGia2026 = parseFloat(row[idxDonGia2026]) || 0;
      const deXuatT5 = parseFloat(row[idxDeXuatT5]) || 0;
      const deXuatT6 = parseFloat(row[idxDeXuatT6]) || 0;
      const deXuatT7 = parseFloat(row[idxDeXuatT7]) || 0;
      const thoiDiemTangGia = String(row[idxThoiDiem] || '').trim();

      let chenhLechDonGia = parseFloat(row[idxChenhLech]) || 0;
      if (!chenhLechDonGia) {
        if (donGia2026 > donGia2025 && donGia2025 > 0) {
          chenhLechDonGia = donGia2026 - donGia2025;
        } else if (deXuatT5 > donGia2025 && donGia2025 > 0) {
          chenhLechDonGia = deXuatT5 - donGia2025;
        } else if (deXuatT6 > donGia2025 && donGia2025 > 0) {
          chenhLechDonGia = deXuatT6 - donGia2025;
        } else if (deXuatT7 > donGia2025 && donGia2025 > 0) {
          chenhLechDonGia = deXuatT7 - donGia2025;
        }
      }

      // STRICT IS_TANG_GIA: Only true if actual increase > 0
      const isTangGia = chenhLechDonGia > 0 || (donGia2026 > donGia2025 && donGia2025 > 0);

      const tong2025DaTra = parseFloat(row[idxTong2025DaTra]) || 0;
      const no2025Ton = parseFloat(row[idxNo2025Ton]) || 0;

      const nguoiThuHuong = String(row[idxNguoiThuHuong] || '').trim();
      const soTaiKhoan = String(row[idxSoTaiKhoan] || '').trim();
      const tenNganHang = String(row[idxTenNganHang] || '').trim();

      const payments2025 = {};
      for (let m = 1; m <= 12; m++) {
        const mPattern = 't' + (m < 10 ? '0' + m : m) + '/2025';
        const mIdx = findColIdx(mPattern);
        payments2025['T' + m] = mIdx !== -1 ? (parseFloat(row[mIdx]) || 0) : 0;
      }

      const payments2026 = {};
      for (let m = 1; m <= 12; m++) {
        const mPattern = 't' + (m < 10 ? '0' + m : m) + '/2026';
        const mIdx = findColIdx(mPattern);
        payments2026['T' + m] = mIdx !== -1 ? (parseFloat(row[mIdx]) || 0) : 0;
      }

      const tongChiTiet2025 = parseFloat(row[idxTongChiTiet2025]) || 0;
      const tongChiTiet2026 = parseFloat(row[idxTongChiTiet2026]) || 0;
      const soThangCoTT = parseInt(row[idxSoThangCoTT]) || 0;
      const tinhTrangPhapLy = String(row[idxPhapLy] || '').trim();
      const ngayThanhToan = formatDate(row[idxNgayThanhToan]);
      const daThanhToan2026Den313 = parseFloat(row[idxDaThanhToan2026]) || 0;
      const ghiChu = String(row[idxGhiChu] || '').trim();

      const isDaThanhToan = daThanhToan2026Den313 > 0 || (no2025Ton === 0 && tong2025DaTra > 0);

      records.push({
        rowIndex: i + 1,
        stt: stt,
        site: site,
        toHaTang: toHaTang,
        maCSHT: maCSHT,
        maCSHTRims: maCSHTRims,
        tenCSHT: tenCSHT,
        chuHopDong: chuHopDong,
        soHopDong: soHopDong,
        ngayKy: ngayKy,
        ngayTinhTien: ngayTinhTien,
        ngayDaoHan: ngayDaoHan,
        banGiaoHD: banGiaoHD,
        donGia2025: donGia2025,
        donGia2026: donGia2026,
        deXuatT5: deXuatT5,
        chenhLechDonGia: chenhLechDonGia,
        deXuatT6: deXuatT6,
        deXuatT7: deXuatT7,
        thoiDiemTangGia: thoiDiemTangGia,
        isTangGia: isTangGia,
        tong2025DaTra: tong2025DaTra,
        no2025Ton: no2025Ton,
        nguoiThuHuong: nguoiThuHuong,
        soTaiKhoan: soTaiKhoan,
        tenNganHang: tenNganHang,
        payments2025: payments2025,
        payments2026: payments2026,
        tongChiTiet2025: tongChiTiet2025,
        tongChiTiet2026: tongChiTiet2026,
        soThangCoTT: soThangCoTT,
        tinhTrangPhapLy: tinhTrangPhapLy,
        ngayThanhToan: ngayThanhToan,
        daThanhToan2026Den313: daThanhToan2026Den313,
        isDaThanhToan: isDaThanhToan,
        ghiChu: ghiChu
      });
    }

    // Apply URL parameters filtering
    let filtered = records;
    if (params.toHaTang) filtered = filtered.filter(r => r.toHaTang === params.toHaTang);
    if (params.site) filtered = filtered.filter(r => r.site === params.site);
    if (params.chiTangGia === 'true') filtered = filtered.filter(r => r.isTangGia);
    if (params.ttStatus === 'paid') filtered = filtered.filter(r => r.isDaThanhToan);
    if (params.ttStatus === 'unpaid') filtered = filtered.filter(r => !r.isDaThanhToan || r.no2025Ton > 0);
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(r => r.maCSHT.toLowerCase().indexOf(q) !== -1 || r.tenCSHT.toLowerCase().indexOf(q) !== -1 || r.chuHopDong.toLowerCase().indexOf(q) !== -1);
    }

    return jsonResponse({
      status: 'success',
      total: filtered.length,
      data: filtered,
      updatedAt: new Date().toISOString()
    });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    let contents = {};
    if (e && e.postData && e.postData.contents) {
      contents = JSON.parse(e.postData.contents);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonResponse({ status: 'error', message: 'Sheet not found' });
    }

    const data = sheet.getDataRange().getValues();
    const rawHeaders = data[0];

    const normalizeStr = function(str) {
      return String(str || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    };

    const findColIdx = function(pattern) {
      return rawHeaders.findIndex(function(h) {
        return normalizeStr(h).indexOf(pattern.toLowerCase()) !== -1;
      });
    };

    const maCSHT = contents.maCSHT;
    const rowIndex = contents.rowIndex;
    const idxMaCSHT = findColIdx('mã csht');

    let targetRow = -1;
    if (rowIndex && rowIndex > 1 && rowIndex <= data.length) {
      targetRow = rowIndex;
    } else if (maCSHT && idxMaCSHT !== -1) {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][idxMaCSHT]).trim() === String(maCSHT).trim()) {
          targetRow = i + 1;
          break;
        }
      }
    }

    if (targetRow === -1) {
      return jsonResponse({ status: 'error', message: 'Trạm không tồn tại: ' + maCSHT });
    }

    const updateFieldByPattern = function(pattern, value) {
      if (value !== undefined) {
        const idx = findColIdx(pattern);
        if (idx !== -1) {
          sheet.getRange(targetRow, idx + 1).setValue(value);
        }
      }
    };

    updateFieldByPattern('site', contents.site);
    updateFieldByPattern('tổ hạ tầng', contents.toHaTang);
    updateFieldByPattern('tên csht', contents.tenCSHT);
    updateFieldByPattern('chủ hợp đồng', contents.chuHopDong);
    updateFieldByPattern('số hợp đồng', contents.soHopDong);
    updateFieldByPattern('tình trạng pháp lý', contents.tinhTrangPhapLy);

    updateFieldByPattern('đơn giá 2025', contents.donGia2025);
    updateFieldByPattern('đơn giá mới 2026', contents.donGia2026);
    updateFieldByPattern('chênh lệch', contents.chenhLechDonGia);
    updateFieldByPattern('đề xuất tăng giá t5', contents.deXuatT5);
    updateFieldByPattern('tháng 6', contents.deXuatT6);
    updateFieldByPattern('tháng 7', contents.deXuatT7);
    updateFieldByPattern('thời điểm', contents.thoiDiemTangGia);

    updateFieldByPattern('tổng 2025 đã trả', contents.tong2025DaTra);
    updateFieldByPattern('còn nợ cn 2025', contents.no2025Ton);
    updateFieldByPattern('đã thanh toán 2026', contents.daThanhToan2026Den313);
    updateFieldByPattern('ngày thanh toán', contents.ngayThanhToan);

    updateFieldByPattern('người thụ hưởng', contents.nguoiThuHuong);
    updateFieldByPattern('số tài khoản', contents.soTaiKhoan);
    updateFieldByPattern('tên ngân hàng', contents.tenNganHang);
    updateFieldByPattern('ghi chú', contents.ghiChu);

    return jsonResponse({
      status: 'success',
      message: 'Đã cập nhật dữ liệu thành công lên Google Sheet cho trạm ' + (maCSHT || targetRow),
      updatedRow: targetRow
    });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const d = val.getDate();
    const m = val.getMonth() + 1;
    const y = val.getFullYear();
    return (d < 10 ? '0' + d : d) + '/' + (m < 10 ? '0' + m : m) + '/' + y;
  }
  return String(val);
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

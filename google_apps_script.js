/**
 * GOOGLE APPS SCRIPT BACKEND FOR CSHT DEBT & PRICE INCREASE DASHBOARD
 * Spreadsheet ID: 1zwXiZKDCN14Rx3LOVEI54JYvABMXz2TDH3w_Rv8bu7c
 * Sheet Name: Theo dõi đầy đủ
 */

const SHEET_NAME = 'Theo dõi đầy đủ';

function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action || 'getData';

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonResponse({ status: 'error', message: 'Sheet "' + SHEET_NAME + '" not found.' });
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return jsonResponse({ status: 'success', data: [], total: 0 });
    }

    const headers = data[0].map(h => String(h || '').replace(/\r\n/g, ' ').trim());

    // Header index mapping
    const colMap = {};
    headers.forEach((h, idx) => {
      colMap[h] = idx;
    });

    const records = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row[0] === '' || row[0] === null || row[0] === undefined) continue;

      const stt = row[colMap['STT']] || i;
      const site = String(row[colMap['Site']] || '').trim();
      const toHaTang = String(row[colMap['Tổ hạ tầng']] || '').trim();
      const maCSHT = String(row[colMap['Mã CSHT']] || '').trim();
      const maCSHTRims = String(row[colMap['Mã CSHT RIMS']] || '').trim();
      const tenCSHT = String(row[colMap['Tên CSHT']] || '').trim();
      const chuHopDong = String(row[colMap['Chủ hợp đồng']] || '').trim();
      const soHopDong = String(row[colMap['Số hợp đồng']] || '').trim();
      const ngayKy = formatDate(row[colMap['Ngày ký']]);
      const ngayTinhTien = formatDate(row[colMap['Ngày tính tiền']]);
      const ngayDaoHan = formatDate(row[colMap['Ngày đáo hạn']]);
      const banGiaoHD = String(row[colMap['bàn giao hợp đồng']] || '').trim();

      const donGia2025 = parseFloat(row[colMap['Đơn giá 2025 (chưa VAT)']]) || 0;
      const donGia2026 = parseFloat(row[colMap['Đơn giá mới 2026 (chưa VAT)']]) || 0;
      const deXuatT5 = parseFloat(row[colMap['đề xuất tăng giá T5']]) || 0;
      const chenhLechDonGia = parseFloat(row[colMap['Chênh lệch đơn giá 2026 - 2025']]) || (donGia2026 && donGia2025 ? donGia2026 - donGia2025 : 0);
      const deXuatT6 = parseFloat(row[colMap['đề xuất tăng giá tháng 6']]) || 0;
      const deXuatT7 = parseFloat(row[colMap['đề xuất tăng giá tháng 7']]) || 0;
      const thoiDiemTangGia = String(row[colMap['Thời điểm tăng giá']] || '').trim();

      const isTangGia = chenhLechDonGia > 0 || donGia2026 > donGia2025 || deXuatT5 > 0 || deXuatT6 > 0 || deXuatT7 > 0 || !!thoiDiemTangGia;

      const tong2025DaTra = parseFloat(row[colMap['Tổng 2025 đã trả (theo bảng tổng hợp)']]) || 0;
      const no2025Ton = parseFloat(row[colMap['Còn nợ CN 2025 tồn 15/4/2026']]) || 0;

      const nguoiThuHuong = String(row[colMap['Người thụ hưởng']] || '').trim();
      const soTaiKhoan = String(row[colMap['Số tài khoản']] || '').trim();
      const tenNganHang = String(row[colMap['Tên ngân hàng']] || '').trim();

      const payments2025 = {};
      for (let m = 1; m <= 12; m++) {
        const mKey = 'T' + (m < 10 ? '0' + m : m) + '/2025';
        payments2025['T' + m] = parseFloat(row[colMap[mKey]]) || 0;
      }

      const payments2026 = {};
      for (let m = 1; m <= 12; m++) {
        const mKey = 'T' + (m < 10 ? '0' + m : m) + '/2026';
        payments2026['T' + m] = parseFloat(row[colMap[mKey]]) || 0;
      }

      const tongChiTiet2025 = parseFloat(row[colMap['Tổng TT chi tiết 2025']]) || 0;
      const tongChiTiet2026 = parseFloat(row[colMap['Tổng TT chi tiết 2026']]) || 0;
      const soThangCoTT = parseInt(row[colMap['Số tháng có TT']]) || 0;
      const tinhTrangPhapLy = String(row[colMap['tình trạng pháp lý']] || '').trim();
      const ngayThanhToan = formatDate(row[colMap['Ngày thanh toán']]);
      const daThanhToan2026Den313 = parseFloat(row[colMap['Đã thanh toán 2026 đến 31/3/2026']]) || 0;
      const ghiChu = String(row[colMap['Ghi chú']] || '').trim();

      // Payment status helper
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
      filtered = filtered.filter(r => r.maCSHT.toLowerCase().includes(q) || r.tenCSHT.toLowerCase().includes(q) || r.chuHopDong.toLowerCase().includes(q));
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

    const action = contents.action || 'updateStation';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonResponse({ status: 'error', message: 'Sheet not found' });
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h || '').replace(/\r\n/g, ' ').trim());

    const colMap = {};
    headers.forEach((h, idx) => { colMap[h] = idx; });

    const maCSHT = contents.maCSHT;
    const rowIndex = contents.rowIndex;

    let targetRow = -1;
    if (rowIndex && rowIndex > 1 && rowIndex <= data.length) {
      targetRow = rowIndex;
    } else if (maCSHT) {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][colMap['Mã CSHT']]).trim() === String(maCSHT).trim()) {
          targetRow = i + 1;
          break;
        }
      }
    }

    if (targetRow === -1) {
      return jsonResponse({ status: 'error', message: 'Trạm không tồn tại: ' + maCSHT });
    }

    // Comprehensive Field Updates
    const updateField = (colName, value) => {
      if (value !== undefined && colMap[colName] !== undefined) {
        sheet.getRange(targetRow, colMap[colName] + 1).setValue(value);
      }
    };

    // General & Contract Info
    updateField('Site', contents.site);
    updateField('Tổ hạ tầng', contents.toHaTang);
    updateField('Tên CSHT', contents.tenCSHT);
    updateField('Chủ hợp đồng', contents.chuHopDong);
    updateField('Số hợp đồng', contents.soHopDong);
    updateField('tình trạng pháp lý', contents.tinhTrangPhapLy);

    // Price & Price Increase Info
    updateField('Đơn giá 2025 (chưa VAT)', contents.donGia2025);
    updateField('Đơn giá mới 2026 (chưa VAT)', contents.donGia2026);
    updateField('Chênh lệch đơn giá 2026 - 2025', contents.chenhLechDonGia);
    updateField('đề xuất tăng giá T5', contents.deXuatT5);
    updateField('đề xuất tăng giá tháng 6', contents.deXuatT6);
    updateField('đề xuất tăng giá tháng 7', contents.deXuatT7);
    updateField('Thời điểm tăng giá', contents.thoiDiemTangGia);

    // Payment & Debt Amounts
    updateField('Tổng 2025 đã trả (theo bảng tổng hợp)', contents.tong2025DaTra);
    updateField('Còn nợ CN 2025 tồn 15/4/2026', contents.no2025Ton);
    updateField('Đã thanh toán 2026 đến 31/3/2026', contents.daThanhToan2026Den313);
    updateField('Ngày thanh toán', contents.ngayThanhToan);

    // Bank Account Info
    updateField('Người thụ hưởng', contents.nguoiThuHuong);
    updateField('Số tài khoản', contents.soTaiKhoan);
    updateField('Tên ngân hàng', contents.tenNganHang);
    updateField('Ghi chú', contents.ghiChu);

    // Monthly payments 2026 if provided (T01..T12)
    if (contents.payments2026 && typeof contents.payments2026 === 'object') {
      for (let m = 1; m <= 12; m++) {
        const mKey = 'T' + (m < 10 ? '0' + m : m) + '/2026';
        if (contents.payments2026['T' + m] !== undefined) {
          updateField(mKey, contents.payments2026['T' + m]);
        }
      }
    }

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

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
        ghiChu: ghiChu
      });
    }

    // Apply URL parameters filtering if present
    let filtered = records;
    if (params.toHaTang) filtered = filtered.filter(r => r.toHaTang === params.toHaTang);
    if (params.site) filtered = filtered.filter(r => r.site === params.site);
    if (params.chiTangGia === 'true') filtered = filtered.filter(r => r.isTangGia);
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

    const action = contents.action || 'updatePriceIncrease';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonResponse({ status: 'error', message: 'Sheet not found' });
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h || '').replace(/\r\n/g, ' ').trim());

    const colMap = {};
    headers.forEach((h, idx) => { colMap[h] = idx; });

    if (action === 'updatePriceIncrease') {
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

      // Update cells
      if (contents.donGia2026 !== undefined && colMap['Đơn giá mới 2026 (chưa VAT)'] !== undefined) {
        sheet.getRange(targetRow, colMap['Đơn giá mới 2026 (chưa VAT)'] + 1).setValue(contents.donGia2026);
      }
      if (contents.chenhLechDonGia !== undefined && colMap['Chênh lệch đơn giá 2026 - 2025'] !== undefined) {
        sheet.getRange(targetRow, colMap['Chênh lệch đơn giá 2026 - 2025'] + 1).setValue(contents.chenhLechDonGia);
      }
      if (contents.deXuatT5 !== undefined && colMap['đề xuất tăng giá T5'] !== undefined) {
        sheet.getRange(targetRow, colMap['đề xuất tăng giá T5'] + 1).setValue(contents.deXuatT5);
      }
      if (contents.deXuatT6 !== undefined && colMap['đề xuất tăng giá tháng 6'] !== undefined) {
        sheet.getRange(targetRow, colMap['đề xuất tăng giá tháng 6'] + 1).setValue(contents.deXuatT6);
      }
      if (contents.deXuatT7 !== undefined && colMap['đề xuất tăng giá tháng 7'] !== undefined) {
        sheet.getRange(targetRow, colMap['đề xuất tăng giá tháng 7'] + 1).setValue(contents.deXuatT7);
      }
      if (contents.thoiDiemTangGia !== undefined && colMap['Thời điểm tăng giá'] !== undefined) {
        sheet.getRange(targetRow, colMap['Thời điểm tăng giá'] + 1).setValue(contents.thoiDiemTangGia);
      }
      if (contents.ghiChu !== undefined && colMap['Ghi chú'] !== undefined) {
        sheet.getRange(targetRow, colMap['Ghi chú'] + 1).setValue(contents.ghiChu);
      }

      return jsonResponse({
        status: 'success',
        message: 'Đã cập nhật thông tin tăng giá thành công cho trạm ' + maCSHT,
        updatedRow: targetRow
      });
    }

    return jsonResponse({ status: 'error', message: 'Hành động không hợp lệ: ' + action });

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

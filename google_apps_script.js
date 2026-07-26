/**
 * GOOGLE APPS SCRIPT BACKEND FOR CSHT DEBT & PRICE INCREASE DASHBOARD
 * Spreadsheet ID: 1zwXiZKDCN14Rx3LOVEI54JYvABMXz2TDH3w_Rv8bu7c
 * Sheet Name: Theo dõi đầy đủ
 */

const SHEET_NAME = 'Theo dõi đầy đủ';

function parseVnNumber(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  var str = String(val).trim().replace(/[^\d.,-]/g, '');
  if (!str) return 0;

  if (str.indexOf('.') !== -1 && str.indexOf(',') !== -1) {
    if (str.lastIndexOf('.') > str.lastIndexOf(',')) {
      str = str.replace(/,/g, '');
    } else {
      str = str.replace(/\./g, '').replace(/,/g, '.');
    }
  } else if (str.indexOf('.') !== -1) {
    var parts = str.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      str = str.replace(/\./g, '');
    }
  } else if (str.indexOf(',') !== -1) {
    var parts = str.split(',');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      str = str.replace(/,/g, '');
    } else {
      str = str.replace(/,/g, '.');
    }
  }

  var num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

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
    const findColIdxPattern = function(patterns) {
      for (var p = 0; p < patterns.length; p++) {
        var idx = findColIdx(patterns[p]);
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const idxBaoCaoVTT = findColIdxPattern(['báo cáo vtt', 'báo cáo', 'vb báo cáo', 'vtt']);
    const idxDiaChiDoiTac = findColIdxPattern(['địa chỉ đối tác', 'địa chỉ']);
    const idxGhiChu = findColIdx('ghi chú');

    const records = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row[0] === '' || row[0] === null || row[0] === undefined) continue;

      const stt = parseVnNumber(row[idxSTT]) || i;
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

      const donGia2025 = parseVnNumber(row[idxDonGia2025]);
      const donGia2026Raw = parseVnNumber(row[idxDonGia2026]);
      const deXuatT5 = parseVnNumber(row[idxDeXuatT5]);
      const deXuatT6 = parseVnNumber(row[idxDeXuatT6]);
      const deXuatT7 = parseVnNumber(row[idxDeXuatT7]);
      const thoiDiemTangGia = String(row[idxThoiDiem] || '').trim();
      const rawChenhLech = parseVnNumber(row[idxChenhLech]);
      const maxDeXuatPrice = Math.max(deXuatT5, deXuatT6, deXuatT7);

      let donGia2026 = 0;
      if (maxDeXuatPrice > donGia2025 && maxDeXuatPrice > 0) {
        donGia2026 = maxDeXuatPrice;
      } else if (donGia2026Raw > donGia2025 && donGia2025 > 0) {
        donGia2026 = donGia2026Raw;
      } else if (rawChenhLech > 0 && donGia2025 > 0) {
        donGia2026 = donGia2025 + rawChenhLech;
      } else if (donGia2026Raw > 0) {
        donGia2026 = donGia2026Raw;
      } else {
        donGia2026 = donGia2025;
      }

      const chenhLechDonGia = (donGia2026 > donGia2025 && donGia2025 > 0) ? (donGia2026 - donGia2025) : 0;
      const isTangGia = chenhLechDonGia > 0;

      const tong2025DaTra = parseVnNumber(row[idxTong2025DaTra]);
      const rawNo2025Ton = parseVnNumber(row[idxNo2025Ton]);
      const tongChiTiet2025 = parseVnNumber(row[idxTongChiTiet2025]);

      const paid2025Sum = Math.max(tong2025DaTra, tongChiTiet2025);
      const no2025Ton = Math.max(0, rawNo2025Ton - paid2025Sum);

      const nguoiThuHuong = String(row[idxNguoiThuHuong] || '').trim();
      const soTaiKhoan = String(row[idxSoTaiKhoan] || '').trim();
      const tenNganHang = String(row[idxTenNganHang] || '').trim();

      const payments2025 = {};
      for (let m = 1; m <= 12; m++) {
        const mPattern = 't' + (m < 10 ? '0' + m : m) + '/2025';
        const mIdx = findColIdx(mPattern);
        payments2025['T' + m] = mIdx !== -1 ? parseVnNumber(row[mIdx]) : 0;
      }

      const payments2026 = {};
      let countMonthsPaid2026 = 0;
      let sumMonthlyPayments2026 = 0;
      for (let m = 1; m <= 12; m++) {
        const mPattern = 't' + (m < 10 ? '0' + m : m) + '/2026';
        const mIdx = findColIdx(mPattern);
        const pVal = mIdx !== -1 ? parseVnNumber(row[mIdx]) : 0;
        payments2026['T' + m] = pVal;
        if (pVal > 0) {
          countMonthsPaid2026++;
          sumMonthlyPayments2026 += pVal;
        }
      }

      const tongChiTiet2026 = parseVnNumber(row[idxTongChiTiet2026]);
      const soThangCoTT = parseVnNumber(row[idxSoThangCoTT]);
      const tinhTrangPhapLy = String(row[idxPhapLy] || '').trim();
      const ngayThanhToan = formatDate(row[idxNgayThanhToan]);
      const daThanhToan2026Den313Raw = parseVnNumber(row[idxDaThanhToan2026]);
      const daThanhToan2026Den313 = daThanhToan2026Den313Raw > 0 ? daThanhToan2026Den313Raw : sumMonthlyPayments2026;
      const rawBaoCaoVTT = String(row[idxBaoCaoVTT] || '').trim();
      const baoCaoVTT = rawBaoCaoVTT || (isTangGia ? 'Chưa làm văn bản báo cáo' : '');
      const diaChiDoiTac = String(row[idxDiaChiDoiTac] || '').trim();
      const ghiChu = String(row[idxGhiChu] || '').trim();

      let thangDaTT2026 = countMonthsPaid2026;
      if (thangDaTT2026 === 0 && donGia2026 > 0 && daThanhToan2026Den313 > 0) {
        thangDaTT2026 = Math.min(12, Math.round(daThanhToan2026Den313 / donGia2026));
      }

      const soThangNo2026 = Math.max(0, 12 - thangDaTT2026);
      const tongHapDong2026 = donGia2026 * 12;
      const no2026Ton = Math.max(0, tongHapDong2026 - daThanhToan2026Den313);

      const isDaThanhToan = (thangDaTT2026 >= 12) || (daThanhToan2026Den313 >= tongHapDong2026 && tongHapDong2026 > 0);

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
        tongHapDong2026: tongHapDong2026,
        daThanhToan2026Den313: daThanhToan2026Den313,
        no2026Ton: no2026Ton,
        thangDaTT2026: thangDaTT2026,
        soThangNo2026: soThangNo2026,
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
        isDaThanhToan: isDaThanhToan,
        baoCaoVTT: baoCaoVTT,
        diaChiDoiTac: diaChiDoiTac,
        ghiChu: ghiChu
      });
    }

    let filtered = records;
    if (params.toHaTang) filtered = filtered.filter(function(r) { return r.toHaTang === params.toHaTang; });
    if (params.site) filtered = filtered.filter(function(r) { return r.site === params.site; });
    if (params.chiTangGia === 'true') filtered = filtered.filter(function(r) { return r.isTangGia; });
    if (params.ttStatus === 'paid') filtered = filtered.filter(function(r) { return r.isDaThanhToan; });
    if (params.ttStatus === 'unpaid2026') filtered = filtered.filter(function(r) { return !r.isDaThanhToan; });
    if (params.ttStatus === 'debt2025') filtered = filtered.filter(function(r) { return r.no2025Ton > 0; });
    if (params.search) {
      var q = params.search.toLowerCase();
      filtered = filtered.filter(function(r) {
        return r.maCSHT.toLowerCase().indexOf(q) !== -1 || r.tenCSHT.toLowerCase().indexOf(q) !== -1 || r.chuHopDong.toLowerCase().indexOf(q) !== -1;
      });
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
    var contents = {};
    if (e && e.postData && e.postData.contents) {
      contents = JSON.parse(e.postData.contents);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonResponse({ status: 'error', message: 'Sheet not found' });
    }

    var data = sheet.getDataRange().getValues();
    var rawHeaders = data[0];

    var normalizeStr = function(str) {
      return String(str || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    };

    var findColIdx = function(pattern) {
      return rawHeaders.findIndex(function(h) {
        return normalizeStr(h).indexOf(pattern.toLowerCase()) !== -1;
      });
    };

    var maCSHT = contents.maCSHT;
    var rowIndex = contents.rowIndex;
    var idxMaCSHT = findColIdx('mã csht');

    var targetRow = -1;
    if (rowIndex && rowIndex > 1 && rowIndex <= data.length) {
      targetRow = rowIndex;
    } else if (maCSHT && idxMaCSHT !== -1) {
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][idxMaCSHT]).trim() === String(maCSHT).trim()) {
          targetRow = i + 1;
          break;
        }
      }
    }

    if (targetRow === -1) {
      return jsonResponse({ status: 'error', message: 'Trạm không tồn tại: ' + maCSHT });
    }

    var updateFieldByPattern = function(patterns, value) {
      if (value !== undefined) {
        var patternList = Array.isArray(patterns) ? patterns : [patterns];
        for (var p = 0; p < patternList.length; p++) {
          var idx = findColIdx(patternList[p]);
          if (idx !== -1) {
            sheet.getRange(targetRow, idx + 1).setValue(value);
            return;
          }
        }
      }
    };

    updateFieldByPattern(['site'], contents.site);
    updateFieldByPattern(['tổ hạ tầng'], contents.toHaTang);
    updateFieldByPattern(['tên csht'], contents.tenCSHT);
    updateFieldByPattern(['chủ hợp đồng'], contents.chuHopDong);
    updateFieldByPattern(['số hợp đồng'], contents.soHopDong);
    updateFieldByPattern(['tình trạng pháp lý'], contents.tinhTrangPhapLy);

    updateFieldByPattern(['đơn giá 2025'], contents.donGia2025);
    updateFieldByPattern(['đơn giá mới 2026'], contents.donGia2026);
    updateFieldByPattern(['chênh lệch'], contents.chenhLechDonGia);
    updateFieldByPattern(['đề xuất tăng giá t5', 'tháng 5'], contents.deXuatT5);
    updateFieldByPattern(['tháng 6', 'đề xuất tăng giá t6'], contents.deXuatT6);
    updateFieldByPattern(['đề xuất tăng giá tháng 7', 'tháng 7', 'đề xuất t7'], contents.deXuatT7);
    updateFieldByPattern(['thời điểm tăng giá', 'thời điểm'], contents.thoiDiemTangGia);

    updateFieldByPattern('tổng 2025 đã trả', contents.tong2025DaTra);
    updateFieldByPattern('còn nợ cn 2025', contents.no2025Ton);
    updateFieldByPattern('đã thanh toán 2026', contents.daThanhToan2026Den313);
    updateFieldByPattern('ngày thanh toán', contents.ngayThanhToan);

    updateFieldByPattern(['người thụ hưởng'], contents.nguoiThuHuong);
    updateFieldByPattern(['số tài khoản'], contents.soTaiKhoan);
    updateFieldByPattern(['tên ngân hàng'], contents.tenNganHang);
    updateFieldByPattern(['báo cáo vtt', 'báo cáo', 'vb báo cáo', 'vtt', 'tiến độ'], contents.baoCaoVTT);
    updateFieldByPattern(['địa chỉ đối tác', 'địa chỉ'], contents.diaChiDoiTac);
    updateFieldByPattern(['ghi chú'], contents.ghiChu);

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
    var d = val;
    var date = d.getDate();
    var m = d.getMonth() + 1;
    var y = d.getFullYear();
    if (date === 1) return 'Tháng ' + m + '/' + y;
    return (date < 10 ? '0' + date : date) + '/' + (m < 10 ? '0' + m : m) + '/' + y;
  }
  var str = String(val).trim();
  if (str.indexOf('GMT') !== -1 || str.indexOf('Giờ') !== -1 || str.indexOf('00:00:00') !== -1) {
    var d2 = new Date(str);
    if (!isNaN(d2.getTime())) {
      var date2 = d2.getDate();
      var m2 = d2.getMonth() + 1;
      var y2 = d2.getFullYear();
      if (date2 === 1) return 'Tháng ' + m2 + '/' + y2;
      return (date2 < 10 ? '0' + date2 : date2) + '/' + (m2 < 10 ? '0' + m2 : m2) + '/' + y2;
    }
  }
  return str;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

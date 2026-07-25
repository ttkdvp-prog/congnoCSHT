# Dashboard Quản Lý Công Nợ & Trạm Tăng Giá CSHT - VNPT

Hệ thống Dashboard WebApp phân tích công nợ thuê cơ sở hạ tầng (CSHT), theo dõi tiến độ thanh toán và quản lý danh sách các trạm điều chỉnh tăng giá năm 2026. 

Tích hợp kết nối 2 chiều với **Google Sheets** thông qua **Google Apps Script API** và hỗ trợ triển khai 1-click lên **Vercel**.

![VNPT CSHT Dashboard](https://img.shields.io/badge/VNPT-CSHT_Dashboard-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-cyan?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-purple?style=for-the-badge&logo=vite)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)

---

## 🌟 Tính Năng Nổi Bật

1. **KPI Stats & Thống Kê Tổng Quan**:
   - Quản lý tổng số **1,170+ trạm CSHT** thuộc các Tổ hạ tầng.
   - Thống kê tổng đơn giá 2025/2026, dư nợ tồn 2025 (tính đến 15/04/2026) và đã thanh toán 2026.

2. **Chuyên Mục & Bộ Lọc Trạm Tăng Giá**:
   - Lọc danh sách trạm có điều chỉnh tăng giá đơn giá 2026.
   - Phân loại theo khoảng số tiền chênh lệch (`< 500k`, `500k - 1M`, `> 1M`).
   - Lọc theo thời điểm tăng giá / các tháng đề xuất T5, T6, T7.
   - **Giao diện cập nhật tăng giá trực tiếp**: Cho phép sửa Đơn giá mới 2026, Tự động tính chênh lệch tăng giá, thời điểm và ghi chú.

3. **Biểu Đồ Phân Tích Trực Quan (Recharts)**:
   - Biểu đồ nợ tồn 2025 & thanh toán 2026 theo từng Tổ hạ tầng.
   - Biểu đồ cơ cấu phân bổ Tình trạng pháp lý hợp đồng.

4. **Bảng Dữ Liệu Chi Tiết & Xuất Báo Cáo**:
   - Tìm kiếm nhanh theo Mã CSHT, Tên trạm, Chủ hợp đồng.
   - Phân trang, sắp xếp đa cột linh hoạt.
   - Xem popup đầy đủ chi tiết hợp đồng, thông tin ngân hàng thụ hưởng & phát sinh thanh toán 12 tháng.
   - Xuất dữ liệu báo cáo ra file **Excel (.xlsx)**.

5. **Kết Nối Google Apps Script API**:
   - Hỗ trợ chế độ **Live Sync** đồng bộ trực tiếp dữ liệu với Google Sheet.
   - Tự động chuyển sang chế độ **Offline Fallback Data** nếu chưa gắn URL Apps Script API.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Local

```bash
# 1. Clone repository
git clone https://github.com/ttkdvp-prog/congnoCSHT.git
cd congnoCSHT

# 2. Cài đặt thư viện
npm install

# 3. Khởi chạy môi trường phát triển (Dev server)
npm run dev

# 4. Build sản phẩm cho Production
npm run build
```

---

## 🔗 Hướng Dẫn Kết Nối Google Sheet qua Apps Script

1. Truy cập Google Sheet: [Link Google Sheet](https://docs.google.com/spreadsheets/d/1zwXiZKDCN14Rx3LOVEI54JYvABMXz2TDH3w_Rv8bu7c/edit?gid=1957057365#gid=1957057365)
2. Vào **Extensions (Tiện ích mở rộng)** -> **Apps Script**.
3. Sao chép toàn bộ mã trong file `google_apps_script.js` và dán vào Apps Script editor.
4. Chọn **Deploy (Triển khai)** -> **New Deployment (Triển khai mới)** -> Chọn **Web App**.
   - **Execute as**: `Me (Tôi)`
   - **Who has access**: `Anyone (Bất kỳ ai)`
5. Copy URL kết quả (dạng `https://script.google.com/macros/s/.../exec`).
6. Trên Web Dashboard, bấm nút **Cấu hình (Bánh răng ⚙️)** ở góc trên bên phải, dán URL và bấm **Lưu & Kiểm tra kết nối**.

---

## ☁️ Triển Khai Lên Vercel (Vercel Deployment)

1. Đăng nhập vào [Vercel](https://vercel.com).
2. Chọn **Add New...** -> **Project**.
3. Kết nối với GitHub và chọn repository `ttkdvp-prog/congnoCSHT`.
4. Giữ nguyên cấu hình mặc định (Framework Preset: **Vite**).
5. Bấm **Deploy**. Vercel sẽ tự động build và cấp tên miền công khai.

---

## 🛠️ Cấu Trúc Mã Nguồn

```
congnoCSHT/
├── google_apps_script.js   # Code backend Google Apps Script (doGet & doPost API)
├── public/                 # Static assets & favicon
├── src/
│   ├── components/
│   │   ├── AnalyticsSection.jsx    # Biểu đồ Recharts
│   │   ├── ApiConfigModal.jsx      # Modal cấu hình GAS URL
│   │   ├── DataTable.jsx           # Bảng dữ liệu chi tiết, phân trang
│   │   ├── DetailModal.jsx         # Modal xem chi tiết hợp đồng
│   │   ├── EditPriceModal.jsx      # Modal cập nhật trạm tăng giá
│   │   ├── FilterBar.jsx           # Thanh bộ lọc tìm kiếm & điều kiện
│   │   ├── Header.jsx              # Thanh tiêu đề & các nút thao tác
│   │   ├── KpiCards.jsx            # Các thẻ thống kê KPI
│   │   └── PriceIncreasePanel.jsx  # Chuyên mục quản lý trạm tăng giá
│   ├── data/
│   │   └── csht_data.json          # Offline dataset (1,170 trạm từ CSHT.xlsx)
│   ├── App.jsx                     # Component chính quản lý state & API
│   ├── index.css                   # Glassmorphic Design System
│   └── main.jsx                    # Mount point React
├── vercel.json             # Cấu hình routing SPA Vercel
├── vite.config.js          # Cấu hình Vite build
└── package.json            # Thư viện & scripts
```

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, PieChart as PieIcon, LineChart } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function AnalyticsSection({ data }) {
  // Aggregate data by Tổ Hạ Tầng
  const byToHaTangMap = {};
  data.forEach(item => {
    const key = item.toHaTang || 'Khác';
    if (!byToHaTangMap[key]) {
      byToHaTangMap[key] = {
        toHaTang: key,
        count: 0,
        no2025Ton: 0,
        daThanhToan2026: 0,
        totalDonGia2026: 0
      };
    }
    byToHaTangMap[key].count += 1;
    byToHaTangMap[key].no2025Ton += (item.no2025Ton || 0);
    byToHaTangMap[key].daThanhToan2026 += (item.daThanhToan2026Den313 || 0);
    byToHaTangMap[key].totalDonGia2026 += (item.donGia2026 || 0);
  });

  const barData = Object.values(byToHaTangMap).map(d => ({
    ...d,
    no2025TonTrieu: Math.round(d.no2025Ton / 1000000),
    daThanhToan2026Trieu: Math.round(d.daThanhToan2026 / 1000000)
  }));

  // Aggregate by Tình Trạng Pháp Lý
  const phapLyMap = {};
  data.forEach(item => {
    const rawKey = item.tinhTrangPhapLy || 'Chưa cập nhật';
    const key = rawKey.length > 25 ? rawKey.substring(0, 25) + '...' : rawKey;
    if (!phapLyMap[key]) phapLyMap[key] = 0;
    phapLyMap[key] += 1;
  });

  const pieData = Object.entries(phapLyMap).map(([name, value]) => ({ name, value }));

  const formatMoneyTrieu = (value) => `${value.toLocaleString('vi-VN')} triệu ₫`;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1.25rem',
      marginBottom: '1.5rem'
    }}>
      
      {/* Bar Chart: Debt vs Paid by Tổ Hạ Tầng */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600, fontSize: '0.95rem' }}>
          <BarChart3 size={18} style={{ color: 'var(--accent-blue)' }} />
          <span>NỢ TỒN 2025 & ĐÃ THANH TOÁN 2026 THEO TỔ HẠ TẦNG (ĐV: TRIỆU VNĐ)</span>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="toHaTang" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
              <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
              <Tooltip 
                formatter={(val) => formatMoneyTrieu(val)}
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="no2025TonTrieu" name="Nợ tồn 2025" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="daThanhToan2026Trieu" name="Đã thanh toán 2026" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart: Legal Status Breakdown */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600, fontSize: '0.95rem' }}>
          <PieIcon size={18} style={{ color: 'var(--accent-purple)' }} />
          <span>PHÂN BỔ TÌNH TRẠNG PHÁP LÝ HỢP ĐỒNG</span>
        </div>
        <div style={{ width: '100%', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(val) => [`${val} trạm`, 'Số lượng']}
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
              />
              <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

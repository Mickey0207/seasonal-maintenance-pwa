
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 季保養設定表單

// 假資料
const siteOptions = [
  { value: 'siteA', label: '案場A' },
  { value: 'siteB', label: '案場B' },
];
const unitOptions = [
  { value: 'unit1', label: '單位1' },
  { value: 'unit2', label: '單位2' },
];
const descOptions = [
  { value: 'desc1', label: '說明1' },
  { value: 'desc2', label: '說明2' },
];

export default function MaintenanceSetupForm() {
  const navigate = useNavigate();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [site, setSite] = useState('');
  const [unit, setUnit] = useState('');
  const [desc, setDesc] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!start || !end || !site || !unit || !desc) {
      setError('請完整填寫所有欄位');
      return;
    }
    if (new Date(start) >= new Date(end)) {
      setError('結束時間需大於起始時間');
      return;
    }
    // 儲存到 localStorage
    localStorage.setItem('maintenancePeriod', JSON.stringify({ start, end, site, unit, desc }));
    localStorage.setItem('isLoggedIn', 'true');
    setError('');
    // 跳轉到表單頁
    navigate('/form');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #e3f0ff 0%, #f5f5f5 100%)',
        padding: 'clamp(12px, 4vw, 32px)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          color: '#1976d2',
          marginBottom: 'clamp(16px, 4vw, 32px)',
          fontSize: 'clamp(1.3rem, 5vw, 2rem)',
          letterSpacing: 1,
        }}
      >
        季保養設定
      </h2>
      <form onSubmit={handleSubmit} style={{ fontSize: 'clamp(1rem, 3vw, 1.15rem)' }}>
        <div style={{ marginBottom: 'clamp(10px, 2vw, 20px)' }}>
          <label>起始日期時間：</label><br />
          <input
            type="datetime-local"
            value={start}
            onChange={e => setStart(e.target.value)}
            style={{ width: '100%', fontSize: 'inherit', padding: '8px', borderRadius: 4, border: '1px solid #bbb' }}
          />
        </div>
        <div style={{ marginBottom: 'clamp(10px, 2vw, 20px)' }}>
          <label>結束日期時間：</label><br />
          <input
            type="datetime-local"
            value={end}
            onChange={e => setEnd(e.target.value)}
            style={{ width: '100%', fontSize: 'inherit', padding: '8px', borderRadius: 4, border: '1px solid #bbb' }}
          />
        </div>
        <div style={{ marginBottom: 'clamp(10px, 2vw, 20px)' }}>
          <label>保養案場：</label><br />
          <select
            value={site}
            onChange={e => setSite(e.target.value)}
            style={{ width: '100%', fontSize: 'inherit', padding: '8px', borderRadius: 4, border: '1px solid #bbb' }}
          >
            <option value="">請選擇</option>
            {siteOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 'clamp(10px, 2vw, 20px)' }}>
          <label>保養單位：</label><br />
          <select
            value={unit}
            onChange={e => setUnit(e.target.value)}
            style={{ width: '100%', fontSize: 'inherit', padding: '8px', borderRadius: 4, border: '1px solid #bbb' }}
          >
            <option value="">請選擇</option>
            {unitOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 'clamp(10px, 2vw, 20px)' }}>
          <label>保養說明：</label><br />
          <select
            value={desc}
            onChange={e => setDesc(e.target.value)}
            style={{ width: '100%', fontSize: 'inherit', padding: '8px', borderRadius: 4, border: '1px solid #bbb' }}
          >
            <option value="">請選擇</option>
            {descOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button
          type="submit"
          style={{
            width: '100%',
            background: '#1976d2',
            color: '#fff',
            padding: 'clamp(10px, 2vw, 16px)',
            border: 'none',
            borderRadius: 4,
            fontWeight: 600,
            fontSize: 'inherit',
            marginTop: 8,
            transition: 'background 0.2s',
          }}
        >
          儲存設定
        </button>
      </form>
    </div>
  );
}

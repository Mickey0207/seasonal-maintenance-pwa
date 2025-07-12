
import React, { useState, useRef, useContext } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';


// 模擬保養資料庫
const maintenanceDB = [
  {
    site: '案場A',
    items: [
      { item: '電梯', location: '1樓', desc: '檢查運作', unit: '永泰企業' },
      { item: '水塔', location: '頂樓', desc: '清洗', unit: '永泰企業' },
    ],
  },
  {
    site: '案場B',
    items: [
      { item: '發電機', location: '地下室', desc: '測試', unit: '永泰企業' },
      { item: '消防栓', location: '1樓', desc: '檢查壓力', unit: '永泰企業' },
    ],
  },
];

const defaultUnit = '永泰企業';

export default function MaintenanceSetupForm() {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  // 狀態
  const [site, setSite] = useState(null);
  const [item, setItem] = useState(null);
  const [location, setLocation] = useState(null);
  const [desc, setDesc] = useState('');
  const [unit, setUnit] = useState(defaultUnit);
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState([]); // 已送出紀錄
  const canvasRef = useRef(null);

  // 當下日期
  const nowDate = new Date().toISOString().slice(0, 16);

  // 取得已送出紀錄
  React.useEffect(() => {
    const data = JSON.parse(localStorage.getItem('submittedMaintenances') || '[]');
    setSubmitted(data);
  }, []);


  // 取得所有案場選項 (react-select 格式)
  const siteOptions = React.useMemo(() => maintenanceDB.map(s => ({ value: s.site, label: s.site })), []);

  // 依據 site 篩選所有可選項目（不重複，react-select 格式）
  const itemOptions = React.useMemo(() => {
    let items = [];
    if (site) {
      const db = maintenanceDB.find(s => s.site === site.value);
      if (db) items = db.items;
    } else {
      items = maintenanceDB.flatMap(s => s.items);
    }
    const filtered = items.filter(i => !submitted.some(s => (!site || s.site === site.value) && s.item === i.item && s.location === i.location));
    // 只保留唯一 item
    return [...new Set(filtered.map(i => i.item))].map(i => ({ value: i, label: i }));
  }, [site, submitted]);

  // 依據 site/item 篩選所有可選位置（不重複，react-select 格式）
  const locationOptions = React.useMemo(() => {
    let items = [];
    if (site) {
      const db = maintenanceDB.find(s => s.site === site.value);
      if (db) items = db.items;
    } else {
      items = maintenanceDB.flatMap(s => s.items);
    }
    if (item) items = items.filter(i => i.item === item.value);
    const filtered = items.filter(i => !submitted.some(s => (!site || s.site === site.value) && s.item === i.item && s.location === i.location));
    return [...new Set(filtered.map(i => i.location))].map(i => ({ value: i, label: i }));
  }, [site, item, submitted]);

  // 依據 item/location 自動帶出 desc
  React.useEffect(() => {
    if (!site || !item || !location) {
      setDesc('');
      return;
    }
    const db = maintenanceDB.find(s => s.site === site.value);
    if (!db) return;
    const found = db.items.find(i => i.item === item.value && i.location === location.value);
    setDesc(found ? found.desc : '');
  }, [site, item, location]);

  // 圖片處理
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      // 浮水印文字（正確顯示 label）
      const lines = [
        `案場名稱: ${site?.label || ''}`,
        `檢查項目: ${item?.label || ''}`,
        `檢查位置: ${location?.label || ''}`,
        `檢查說明: ${desc}`,
        `檢查單位: ${unit}`,
        `檢查日期: ${nowDate.replace('T', ' ')}`,
      ];
      const fontSize = Math.max(16, img.width * 0.025);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      const lineHeight = fontSize * 1.3;
      // 計算浮水印區塊高度
      const totalHeight = lines.length * lineHeight + 16;
      // 畫黑色半透明底
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#000';
      ctx.fillRect(img.width - 10 - 420, img.height - 10 - totalHeight, 420, totalHeight);
      ctx.restore();
      // 畫白色字
      ctx.fillStyle = '#fff';
      lines.reverse().forEach((line, idx) => {
        ctx.fillText(line, img.width - 20, img.height - 20 - idx * lineHeight);
      });
      canvas.toBlob(blob => {
        setPhoto(blob);
        setPhotoUrl(canvas.toDataURL());
      }, 'image/jpeg', 0.92);
    };
  };

  // 表單送出
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!site || !item || !location || !desc || !unit || !photo) {
      setError('請完整填寫所有欄位並上傳照片');
      return;
    }
    // 新增紀錄
    const newRecord = {
      site: site.value,
      item: item.value,
      location: location.value,
      desc,
      unit,
      date: nowDate
    };
    const updated = [...submitted, newRecord];
    localStorage.setItem('submittedMaintenances', JSON.stringify(updated));
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
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #23272f 0%, #222 100%)'
          : 'linear-gradient(135deg, #e3f0ff 0%, #f5f5f5 100%)',
        padding: 'clamp(12px, 4vw, 32px)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'background 0.2s',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          color: theme === 'dark' ? '#90caf9' : '#1976d2',
          marginBottom: 'clamp(16px, 4vw, 32px)',
          fontSize: 'clamp(1.3rem, 5vw, 2rem)',
          letterSpacing: 1,
          fontWeight: 700,
          textShadow: theme === 'dark' ? '0 1px 2px #222' : 'none',
          transition: 'color 0.2s',
        }}
      >
        季保養表單
      </h2>
      <form onSubmit={handleSubmit} style={{ fontSize: 'clamp(1rem, 3vw, 1.15rem)', width: '100%', maxWidth: 420, background: theme === 'dark' ? 'rgba(30,34,40,0.98)' : '#fff', borderRadius: 18, boxShadow: theme === 'dark' ? '0 4px 24px rgba(25,118,210,0.18)' : '0 2px 12px rgba(25,118,210,0.10)', padding: 'clamp(18px, 4vw, 32px)', border: theme === 'dark' ? '1.5px solid #333' : '1.5px solid #e3f0ff', margin: '0 auto', transition: 'background 0.2s, box-shadow 0.2s, border 0.2s' }}>
        {/* 1. 保養案場 (react-select) */}
        <div style={{ marginBottom: 'clamp(10px, 2vw, 20px)' }}>
          <label style={{ fontWeight: 600, color: theme === 'dark' ? '#90caf9' : '#1976d2', letterSpacing: 1 }}>案場名稱：</label><br />
          <Select
            options={siteOptions}
            value={site}
            onChange={option => { setSite(option); setItem(null); setLocation(null); }}
            placeholder="請選擇案場"
            isClearable
            styles={{
              control: base => ({ ...base, borderRadius: 10, borderColor: theme === 'dark' ? '#444' : '#90caf9', background: theme === 'dark' ? '#23272f' : '#f7fbff', color: theme === 'dark' ? '#fff' : '#1976d2', boxShadow: 'none', minHeight: 44 }),
              menu: base => ({ ...base, zIndex: 20, borderRadius: 10, background: theme === 'dark' ? '#23272f' : '#fff', color: theme === 'dark' ? '#fff' : '#1976d2' }),
              singleValue: base => ({ ...base, color: theme === 'dark' ? '#fff' : '#1976d2' }),
              option: (base, state) => ({ ...base, background: state.isSelected ? (theme === 'dark' ? '#1976d2' : '#e3f0ff') : state.isFocused ? (theme === 'dark' ? '#333' : '#e3f0ff') : 'none', color: theme === 'dark' ? '#fff' : '#1976d2', borderRadius: 8 }),
              placeholder: base => ({ ...base, color: theme === 'dark' ? '#90caf9' : '#90caf9' }),
            }}
          />
        </div>
        {/* 2. 保養項目 (react-select) */}
        <div style={{ marginBottom: 'clamp(10px, 2vw, 20px)' }}>
          <label style={{ fontWeight: 600, color: theme === 'dark' ? '#90caf9' : '#1976d2', letterSpacing: 1 }}>保養項目：</label><br />
          <Select
            options={itemOptions}
            value={item}
            onChange={option => { setItem(option); setLocation(null); }}
            placeholder={site ? '請選擇項目' : '請先選擇案場'}
            isClearable
            isDisabled={!site}
            styles={{
              control: base => ({ ...base, borderRadius: 10, borderColor: theme === 'dark' ? '#444' : '#90caf9', background: theme === 'dark' ? '#23272f' : '#f7fbff', color: theme === 'dark' ? '#fff' : '#1976d2', boxShadow: 'none', minHeight: 44 }),
              menu: base => ({ ...base, zIndex: 20, borderRadius: 10, background: theme === 'dark' ? '#23272f' : '#fff', color: theme === 'dark' ? '#fff' : '#1976d2' }),
              singleValue: base => ({ ...base, color: theme === 'dark' ? '#fff' : '#1976d2' }),
              option: (base, state) => ({ ...base, background: state.isSelected ? (theme === 'dark' ? '#1976d2' : '#e3f0ff') : state.isFocused ? (theme === 'dark' ? '#333' : '#e3f0ff') : 'none', color: theme === 'dark' ? '#fff' : '#1976d2', borderRadius: 8 }),
              placeholder: base => ({ ...base, color: theme === 'dark' ? '#90caf9' : '#90caf9' }),
            }}
          />
        </div>
        {/* 3. 保養位置 (react-select) */}
        <div style={{ marginBottom: 'clamp(10px, 2vw, 20px)' }}>
          <label style={{ fontWeight: 600, color: theme === 'dark' ? '#90caf9' : '#1976d2', letterSpacing: 1 }}>保養位置：</label><br />
          <Select
            options={locationOptions}
            value={location}
            onChange={option => setLocation(option)}
            placeholder={item ? '請選擇位置' : '請先選擇項目'}
            isClearable
            isDisabled={!item}
            styles={{
              control: base => ({ ...base, borderRadius: 10, borderColor: theme === 'dark' ? '#444' : '#90caf9', background: theme === 'dark' ? '#23272f' : '#f7fbff', color: theme === 'dark' ? '#fff' : '#1976d2', boxShadow: 'none', minHeight: 44 }),
              menu: base => ({ ...base, zIndex: 20, borderRadius: 10, background: theme === 'dark' ? '#23272f' : '#fff', color: theme === 'dark' ? '#fff' : '#1976d2' }),
              singleValue: base => ({ ...base, color: theme === 'dark' ? '#fff' : '#1976d2' }),
              option: (base, state) => ({ ...base, background: state.isSelected ? (theme === 'dark' ? '#1976d2' : '#e3f0ff') : state.isFocused ? (theme === 'dark' ? '#333' : '#e3f0ff') : 'none', color: theme === 'dark' ? '#fff' : '#1976d2', borderRadius: 8 }),
              placeholder: base => ({ ...base, color: theme === 'dark' ? '#90caf9' : '#90caf9' }),
            }}
          />
        </div>
        {/* 4. 上傳圖片 */}
        <div style={{ marginBottom: 'clamp(10px, 2vw, 20px)' }}>
          <label style={{ fontWeight: 600, color: theme === 'dark' ? '#90caf9' : '#1976d2', letterSpacing: 1 }}>上傳照片：</label><br />
          <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ width: '100%', fontSize: 'inherit', padding: '8px', borderRadius: 10, border: `1.5px solid ${theme === 'dark' ? '#444' : '#bbb'}`, background: theme === 'dark' ? '#23272f' : '#f7fbff', color: theme === 'dark' ? '#fff' : '#1976d2', marginTop: 4, marginBottom: 4 }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {photoUrl && <img src={photoUrl} alt="預覽" style={{ width: '100%', marginTop: 8, borderRadius: 10, border: `1.5px solid ${theme === 'dark' ? '#444' : '#bbb'}` }} />}
        </div>
        {/* 5. 保養單位 */}
        <div style={{ marginBottom: 'clamp(10px, 2vw, 20px)' }}>
          <label style={{ fontWeight: 600, color: theme === 'dark' ? '#90caf9' : '#1976d2', letterSpacing: 1 }}>保養單位：</label><br />
          <input type="text" value={unit} onChange={e => setUnit(e.target.value)} style={{ width: '100%', fontSize: 'inherit', padding: '8px', borderRadius: 10, border: `1.5px solid ${theme === 'dark' ? '#444' : '#bbb'}`, background: theme === 'dark' ? '#23272f' : '#f7fbff', color: theme === 'dark' ? '#fff' : '#1976d2', marginTop: 4 }} />
        </div>
        {/* 6. 保養時間 */}
        <div style={{ marginBottom: 'clamp(10px, 2vw, 20px)' }}>
          <label style={{ fontWeight: 600, color: theme === 'dark' ? '#90caf9' : '#1976d2', letterSpacing: 1 }}>保養時間：</label><br />
          <input type="datetime-local" value={nowDate} readOnly style={{ width: '100%', fontSize: 'inherit', padding: '8px', borderRadius: 10, border: `1.5px solid ${theme === 'dark' ? '#444' : '#bbb'}`, background: theme === 'dark' ? '#23272f' : '#eee', color: theme === 'dark' ? '#fff' : '#1976d2', marginTop: 4 }} />
        </div>
        {/* 說明欄位（自動帶出） */}
        <div style={{ marginBottom: 'clamp(10px, 2vw, 20px)' }}>
          <label style={{ fontWeight: 600, color: theme === 'dark' ? '#90caf9' : '#1976d2', letterSpacing: 1 }}>檢查說明：</label><br />
          <input type="text" value={desc} readOnly style={{ width: '100%', fontSize: 'inherit', padding: '8px', borderRadius: 10, border: `1.5px solid ${theme === 'dark' ? '#444' : '#bbb'}`, background: theme === 'dark' ? '#23272f' : '#eee', color: theme === 'dark' ? '#fff' : '#1976d2', marginTop: 4 }} />
        </div>
        {error && <div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 600 }}>{error}</div>}
        <button
          type="submit"
          style={{
            width: '100%',
            background: theme === 'dark'
              ? 'linear-gradient(135deg, #1976d2 60%, #23272f 100%)'
              : 'linear-gradient(135deg, #e3f0ff 60%, #1976d2 100%)',
            color: theme === 'dark' ? '#fff' : '#1976d2',
            padding: 'clamp(12px, 2vw, 18px)',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 'inherit',
            marginTop: 8,
            boxShadow: theme === 'dark'
              ? '0 4px 16px rgba(25, 118, 210, 0.18)'
              : '0 2px 8px rgba(25, 118, 210, 0.10)',
            cursor: 'pointer',
            letterSpacing: 1,
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = theme === 'dark'
              ? 'linear-gradient(135deg, #1976d2 60%, #23272f 100%)'
              : 'linear-gradient(135deg, #1976d2 60%, #e3f0ff 100%)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(25, 118, 210, 0.22)';
            e.currentTarget.style.color = theme === 'dark' ? '#ffe082' : '#1565c0';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = theme === 'dark'
              ? 'linear-gradient(135deg, #1976d2 60%, #23272f 100%)'
              : 'linear-gradient(135deg, #e3f0ff 60%, #1976d2 100%)';
            e.currentTarget.style.boxShadow = theme === 'dark'
              ? '0 4px 16px rgba(25, 118, 210, 0.18)'
              : '0 2px 8px rgba(25, 118, 210, 0.10)';
            e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#1976d2';
          }}
        >
          提交表單
        </button>
      </form>
    </div>
  );
}

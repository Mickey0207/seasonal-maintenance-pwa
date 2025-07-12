
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';

export default function TopBarMenu({ user }) {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  // 響應式：桌面靠右、平板置中、手機靠左
  const getJustify = () => {
    if (window.innerWidth < 600) return 'flex-start'; // 手機
    if (window.innerWidth < 1024) return 'center';   // 平板
    return 'flex-end';                               // 桌面
  };
  const [justify, setJustify] = useState(getJustify());
  useEffect(() => {
    const onResize = () => setJustify(getJustify());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Atomize 風格按鈕
  const atomBtn = (text, onClick, extraStyle = {}, danger = false) => (
    <button
      onClick={onClick}
      style={{
        minWidth: danger ? 80 : 100,
        maxWidth: danger ? 120 : 220,
        flex: danger ? '1 1 80px' : '1 1 120px',
        margin: '0 12px 8px 0',
        padding: '10px 22px',
        fontSize: 16,
        fontWeight: 600,
        border: `1.5px solid ${danger ? '#d32f2f' : theme === 'dark' ? '#90caf9' : '#1976d2'}`,
        borderRadius: 12,
        background: danger
          ? (theme === 'dark' ? 'linear-gradient(135deg, #2d1a1a 60%, #d32f2f 100%)' : 'linear-gradient(135deg, #fff 60%, #ffd6d6 100%)')
          : (theme === 'dark' ? 'linear-gradient(135deg, #23272f 60%, #1976d2 100%)' : 'linear-gradient(135deg, #fff 60%, #e3f0ff 100%)'),
        color: danger ? '#d32f2f' : (theme === 'dark' ? '#fff' : '#1976d2'),
        boxShadow: theme === 'dark'
          ? '0 4px 16px rgba(25, 118, 210, 0.18)'
          : '0 2px 8px rgba(25, 118, 210, 0.10)',
        cursor: 'pointer',
        outline: 'none',
        transition: 'background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s',
        ...extraStyle,
      }}
      onMouseOver={e => {
        e.currentTarget.style.background = danger
          ? (theme === 'dark' ? 'linear-gradient(135deg, #d32f2f 60%, #2d1a1a 100%)' : 'linear-gradient(135deg, #ffd6d6 60%, #fff 100%)')
          : (theme === 'dark' ? 'linear-gradient(135deg, #1976d2 60%, #23272f 100%)' : 'linear-gradient(135deg, #e3f0ff 60%, #90caf9 100%)');
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(25, 118, 210, 0.22)';
        e.currentTarget.style.border = `1.5px solid ${danger ? '#d32f2f' : '#90caf9'}`;
      }}
      onMouseOut={e => {
        e.currentTarget.style.background = danger
          ? (theme === 'dark' ? 'linear-gradient(135deg, #2d1a1a 60%, #d32f2f 100%)' : 'linear-gradient(135deg, #fff 60%, #ffd6d6 100%)')
          : (theme === 'dark' ? 'linear-gradient(135deg, #23272f 60%, #1976d2 100%)' : 'linear-gradient(135deg, #fff 60%, #e3f0ff 100%)');
        e.currentTarget.style.boxShadow = theme === 'dark'
          ? '0 4px 16px rgba(25, 118, 210, 0.18)'
          : '0 2px 8px rgba(25, 118, 210, 0.10)';
        e.currentTarget.style.border = `1.5px solid ${danger ? '#d32f2f' : (theme === 'dark' ? '#90caf9' : '#1976d2')}`;
      }}
    >
      {text}
    </button>
  );

  return (
    <div
      style={{
        width: '100%',
        minHeight: 60,
        background: theme === 'dark'
          ? 'linear-gradient(90deg, #23272f 60%, #1976d2 100%)'
          : 'linear-gradient(90deg, #fff 60%, #e3f0ff 100%)',
        boxShadow: theme === 'dark'
          ? '0 2px 8px rgba(25, 118, 210, 0.18)'
          : '0 2px 8px rgba(25, 118, 210, 0.10)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 200,
        borderBottom: theme === 'dark' ? '1.5px solid #333' : '1.5px solid #e0e0e0',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        transition: 'background 0.2s, box-shadow 0.2s, border 0.2s',
      }}
    >
      <div style={{
        fontWeight: 700,
        fontSize: 22,
        marginRight: 24,
        minWidth: 0,
        flexShrink: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: theme === 'dark' ? '#fff' : '#1976d2',
        letterSpacing: 1,
        textShadow: theme === 'dark' ? '0 1px 2px #222' : 'none',
        transition: 'color 0.2s',
      }}>
        {user.displayName}
        <span style={{ color: theme === 'dark' ? '#90caf9' : '#888', fontSize: 14, marginLeft: 10 }}>{user.account}</span>
      </div>
      <div style={{
        display: 'flex',
        flex: 1,
        justifyContent: justify,
        flexWrap: 'wrap',
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'visible',
        alignItems: 'center',
      }}>
        {atomBtn('本次季保養設定', () => navigate('/setup'))}
        {atomBtn('本次季保養表單', () => navigate('/form'))}
        {atomBtn('本次保養季保養紀錄歷史', () => navigate('/history'))}
        {atomBtn('登出', () => { if(window.confirm('確定要登出？')) navigate('/'); }, {whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}, true)}
      </div>
    </div>
  );
}

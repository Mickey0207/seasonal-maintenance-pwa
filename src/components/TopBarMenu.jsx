import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopBarMenu({ user }) {
  const navigate = useNavigate();
  // 響應式：桌面靠右、平板置中、手機靠左
  const getJustify = () => {
    if (window.innerWidth < 600) return 'flex-start'; // 手機
    if (window.innerWidth < 1024) return 'center';   // 平板
    return 'space-evenly';                           // 桌面更靠左
  };
  const [justify, setJustify] = React.useState(getJustify());
  React.useEffect(() => {
    const onResize = () => setJustify(getJustify());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return (
    <div style={{
      width: '100%',
      minHeight: 56,
      background: '#fff',
      boxShadow: 'none',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 200,
      gap: 0,
      borderBottom: '1px solid #e0e0e0',
      flexWrap: 'wrap',
    }}>
      <div style={{ fontWeight: 'bold', fontSize: 20, marginRight: 16, minWidth: 0, flexShrink: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.displayName} <span style={{ color: '#888', fontSize: 14, marginLeft: 8 }}>{user.account}</span></div>
      <div style={{
        display: 'flex',
        gap: 0,
        flex: 1,
        justifyContent: justify,
        flexWrap: 'wrap',
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'visible',
      }}>
        <button style={{ ...btnStyle, minWidth: 100, maxWidth: 220, flex: '1 1 120px', marginLeft: 0, marginRight: 16, marginBottom: 4 }} onClick={() => navigate('/setup')}>本次季保養設定</button>
        <button style={{ ...btnStyle, minWidth: 100, maxWidth: 220, flex: '1 1 120px', marginLeft: 0, marginRight: 16, marginBottom: 4 }} onClick={() => navigate('/form')}>本次季保養表單</button>
        <button style={{ ...btnStyle, minWidth: 100, maxWidth: 220, flex: '1 1 120px', marginLeft: 0, marginRight: 16, marginBottom: 4 }} onClick={() => navigate('/history')}>本次保養季保養紀錄歷史</button>
        <button style={{ ...btnStyle, minWidth: 80, maxWidth: 120, flex: '1 1 80px', color: '#d32f2f', borderColor: '#d32f2f', marginLeft: 0, marginRight: 0, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => {
          if(window.confirm('確定要登出？')) navigate('/');
        }}>登出</button>
      </div>
    </div>
  );
}

const btnStyle = {
  marginLeft: 16,
  padding: '8px 20px',
  fontSize: 16,
  border: '1px solid #1976d2',
  borderRadius: 6,
  background: '#fff',
  color: '#1976d2',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

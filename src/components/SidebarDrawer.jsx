

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 側邊欄元件

export default function SidebarDrawer({ user, onClose }) {
  const [showLogout, setShowLogout] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const navigate = useNavigate();

  // 假重置邏輯
  const handleReset = () => {
    // TODO: 清空本地狀態與表單資料
    setShowReset(false);
    alert('已重置本次季保養所有設定！');
  };

  const handleLogout = () => {
    // TODO: 清空本地狀態與表單資料
    setShowLogout(false);
    navigate('/');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: 270,
      height: '100vh',
      background: 'var(--color-surface)',
      boxShadow: '2px 0 16px rgba(25, 118, 210, 0.10)',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      borderTopRightRadius: '24px',
      borderBottomRightRadius: '24px',
      borderRight: '1.5px solid var(--color-border)',
      transition: 'box-shadow 0.2s',
    }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: 'var(--color-primary)', borderRadius: '50%', width: 36, height: 36, transition: 'background 0.2s' }} aria-label="關閉側邊欄">&times;</button>
      <div style={{ padding: '36px 28px 18px 28px', borderBottom: '1.5px solid var(--color-border)', background: 'var(--color-primary-light)', borderTopRightRadius: '24px' }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--color-primary)' }}>{user.displayName}</div>
        <div style={{ color: '#888', fontSize: 14, marginTop: 2 }}>{user.account}</div>
      </div>
      <div style={{ flex: 1, padding: '28px 0 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button style={sidebarBtnStyle} onClick={() => navigate('/setup')}>本次季保養設定</button>
        <button style={sidebarBtnStyle} onClick={() => navigate('/form')}>本次季保養表單</button>
        <button style={sidebarBtnStyle} onClick={() => navigate('/history')}>本次保養季保養紀錄歷史</button>
        <button style={{ ...sidebarBtnStyle, color: '#d32f2f', borderColor: '#d32f2f', background: 'rgba(211,47,47,0.06)' }} onClick={() => setShowReset(true)}>重置本次季保養所有設定</button>
      </div>
      <div style={{ padding: 24, borderTop: '1.5px solid var(--color-border)' }}>
        <button style={{ ...sidebarBtnStyle, background: '#eee', color: '#333' }} onClick={() => setShowLogout(true)}>登出</button>
      </div>

      {/* 重置確認視窗 */}
      {showReset && (
        <div style={modalMask} onClick={() => setShowReset(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 16, fontWeight: 600, color: '#d32f2f' }}>確定要重置所有設定？</div>
            <button style={{ ...sidebarBtnStyle, background: '#d32f2f', color: '#fff' }} onClick={handleReset}>確定重置</button>
            <button style={{ ...sidebarBtnStyle, marginTop: 8 }} onClick={() => setShowReset(false)}>取消</button>
          </div>
        </div>
      )}
      {/* 登出確認視窗 */}
      {showLogout && (
        <div style={modalMask} onClick={() => setShowLogout(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 16, fontWeight: 600, color: 'var(--color-primary)' }}>確定要登出？</div>
            <button style={{ ...sidebarBtnStyle, background: 'var(--color-primary)', color: '#fff' }} onClick={handleLogout}>確定登出</button>
            <button style={{ ...sidebarBtnStyle, marginTop: 8 }} onClick={() => setShowLogout(false)}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
}

const sidebarBtnStyle = {
  width: '90%',
  margin: '0 auto',
  padding: '14px 0',
  fontSize: 16,
  borderRadius: 'var(--radius)',
  border: '1.5px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-primary)',
  fontWeight: 600,
  letterSpacing: 1,
  marginBottom: 4,
  boxShadow: 'var(--color-shadow)',
  cursor: 'pointer',
  transition: 'background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s',
};

const modalMask = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.2)',
  zIndex: 999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalBox = {
  background: '#fff',
  borderRadius: 8,
  padding: 32,
  minWidth: 240,
  boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
};

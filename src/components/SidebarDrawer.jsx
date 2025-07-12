

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
    <div style={{ position: 'fixed', top: 0, left: 0, width: 260, height: '100vh', background: '#fff', boxShadow: '2px 0 8px rgba(0,0,0,0.1)', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>&times;</button>
      <div style={{ padding: '32px 24px 16px 24px', borderBottom: '1px solid #eee' }}>
        <div style={{ fontWeight: 'bold', fontSize: 18 }}>{user.displayName}</div>
        <div style={{ color: '#888', fontSize: 14 }}>{user.account}</div>
      </div>
      <div style={{ flex: 1, padding: '24px 0' }}>
        <button style={btnStyle} onClick={() => navigate('/setup')}>本次季保養設定</button>
        <button style={btnStyle} onClick={() => navigate('/form')}>本次季保養表單</button>
        <button style={btnStyle} onClick={() => navigate('/history')}>本次保養季保養紀錄歷史</button>
        <button style={{ ...btnStyle, color: '#d32f2f', borderColor: '#d32f2f' }} onClick={() => setShowReset(true)}>重置本次季保養所有設定</button>
      </div>
      <div style={{ padding: 24, borderTop: '1px solid #eee' }}>
        <button style={{ ...btnStyle, background: '#eee', color: '#333' }} onClick={() => setShowLogout(true)}>登出</button>
      </div>

      {/* 重置確認視窗 */}
      {showReset && (
        <div style={modalMask} onClick={() => setShowReset(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 16 }}>確定要重置所有設定？</div>
            <button style={{ ...btnStyle, background: '#d32f2f', color: '#fff' }} onClick={handleReset}>確定重置</button>
            <button style={{ ...btnStyle, marginTop: 8 }} onClick={() => setShowReset(false)}>取消</button>
          </div>
        </div>
      )}
      {/* 登出確認視窗 */}
      {showLogout && (
        <div style={modalMask} onClick={() => setShowLogout(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 16 }}>確定要登出？</div>
            <button style={{ ...btnStyle, background: '#1976d2', color: '#fff' }} onClick={handleLogout}>確定登出</button>
            <button style={{ ...btnStyle, marginTop: 8 }} onClick={() => setShowLogout(false)}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  width: '100%',
  padding: '12px 0',
  margin: '8px 0',
  fontSize: 16,
  border: '1px solid #1976d2',
  borderRadius: 6,
  background: '#fff',
  color: '#1976d2',
  cursor: 'pointer',
  transition: 'all 0.2s',
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

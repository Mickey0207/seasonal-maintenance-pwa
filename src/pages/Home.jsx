
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarDrawer from '../components/SidebarDrawer';
import TopBarMenu from '../components/TopBarMenu';

// 主畫面
export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  // 假登入者資料
  const user = { account: 'user1', displayName: '王小明' };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'linear-gradient(135deg, #e3f0ff 0%, #f5f5f5 100%)' }}>
      {isMobile ? (
        <>
          {/* 左上三條線按鈕 */}
          <button aria-label="開啟選單" style={{ position: 'absolute', top: 16, left: 16, background: 'none', border: 'none', fontSize: 28, cursor: 'pointer' }} onClick={() => setSidebarOpen(true)}>
            <span style={{ display: 'block', width: 28, height: 4, background: '#333', margin: '5px 0', borderRadius: 2 }}></span>
            <span style={{ display: 'block', width: 28, height: 4, background: '#333', margin: '5px 0', borderRadius: 2 }}></span>
            <span style={{ display: 'block', width: 28, height: 4, background: '#333', margin: '5px 0', borderRadius: 2 }}></span>
          </button>
          {/* 側邊欄 */}
          {sidebarOpen && <SidebarDrawer user={user} onClose={() => setSidebarOpen(false)} />}
          <div
            style={{
              width: '100vw',
              minWidth: 0,
              margin: 0,
              paddingTop: 80,
              paddingLeft: 0,
              paddingRight: 0,
              boxSizing: 'border-box',
            }}
          >
            <h1
              style={{
                textAlign: 'center',
                marginBottom: 32,
                color: '#1976d2',
                fontSize: 'clamp(2rem, 8vw, 2.5rem)',
                fontWeight: 700,
                textShadow: '0 2px 8px #b3c6e6',
                wordBreak: 'break-word',
                background: 'rgba(255,255,255,0.7)',
                padding: '8px 0',
                borderRadius: 0,
              }}
            >
              主畫面
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 8px' }}>
              <button
                style={{
                  width: '100%',
                  padding: 'clamp(14px, 4vw, 22px)',
                  fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                  borderRadius: 0,
                  border: 'none',
                  background: '#1976d2',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background 0.2s',
                }}
                onClick={() => navigate('/setup')}
              >
                本次季保養設定
              </button>
              <button
                style={{
                  width: '100%',
                  padding: 'clamp(14px, 4vw, 22px)',
                  fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                  borderRadius: 0,
                  border: 'none',
                  background: '#388e3c',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background 0.2s',
                }}
                onClick={() => navigate('/form')}
              >
                本次季保養表單
              </button>
              <button
                style={{
                  width: '100%',
                  padding: 'clamp(14px, 4vw, 22px)',
                  fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                  borderRadius: 0,
                  border: 'none',
                  background: '#fbc02d',
                  color: '#333',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background 0.2s',
                }}
                onClick={() => navigate('/history')}
              >
                本次保養季保養紀錄歷史
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <TopBarMenu user={user} />
          <div
            style={{
              width: '100vw',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 0,
              boxShadow: 'none',
              padding: 'clamp(32px, 6vw, 64px) 0 clamp(24px, 4vw, 48px) 0',
              minHeight: '100vh',
              boxSizing: 'border-box',
            }}
          >
            <h1
              style={{
                textAlign: 'center',
                marginBottom: 40,
                color: '#1976d2',
                fontSize: 'clamp(2rem, 8vw, 2.5rem)',
                fontWeight: 700,
                letterSpacing: 2,
                wordBreak: 'break-word',
                background: 'rgba(255,255,255,0.7)',
                padding: '8px 0',
                borderRadius: 0,
              }}
            >
              ACL 季保養系統
            </h1>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 32, justifyContent: 'center', padding: '0 32px' }}>
              <button
                style={{
                  flex: 1,
                  minWidth: 180,
                  maxWidth: 320,
                  padding: 'clamp(18px, 4vw, 32px)',
                  fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                  borderRadius: 0,
                  border: 'none',
                  background: '#1976d2',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background 0.2s',
                }}
                onClick={() => navigate('/setup')}
              >
                本次季保養設定
              </button>
              <button
                style={{
                  flex: 1,
                  minWidth: 180,
                  maxWidth: 320,
                  padding: 'clamp(18px, 4vw, 32px)',
                  fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                  borderRadius: 0,
                  border: 'none',
                  background: '#388e3c',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background 0.2s',
                }}
                onClick={() => navigate('/form')}
              >
                本次季保養表單
              </button>
              <button
                style={{
                  flex: 1,
                  minWidth: 180,
                  maxWidth: 320,
                  padding: 'clamp(18px, 4vw, 32px)',
                  fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                  borderRadius: 0,
                  border: 'none',
                  background: '#fbc02d',
                  color: '#333',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background 0.2s',
                }}
                onClick={() => navigate('/history')}
              >
                本次保養季保養紀錄歷史
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

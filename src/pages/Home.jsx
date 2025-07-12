
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

  // 自動跳轉邏輯
  useEffect(() => {
    // 保養期間自動跳轉
    const periodStr = localStorage.getItem('maintenancePeriod');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (periodStr && isLoggedIn) {
      try {
        const { start, end } = JSON.parse(periodStr);
        const now = new Date();
        if (start && end && new Date(start) <= now && now <= new Date(end)) {
          navigate('/form', { replace: true });
        }
      } catch (e) {}
    }
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  return (
    <div className="card" style={{ position: 'relative', minHeight: '100vh', background: 'var(--color-primary-light)' }}>
      {isMobile ? (
        <>
          {/* 左上三條線按鈕 */}
          <button aria-label="開啟選單" style={{ position: 'absolute', top: 24, left: 24, background: 'var(--color-surface)', border: 'none', borderRadius: '50%', boxShadow: 'var(--color-shadow)', fontSize: 28, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s' }} onClick={() => setSidebarOpen(true)}>
            <span style={{ display: 'block', width: 28, height: 4, background: 'var(--color-primary)', margin: '5px 0', borderRadius: 2 }}></span>
            <span style={{ display: 'block', width: 28, height: 4, background: 'var(--color-primary)', margin: '5px 0', borderRadius: 2 }}></span>
            <span style={{ display: 'block', width: 28, height: 4, background: 'var(--color-primary)', margin: '5px 0', borderRadius: 2 }}></span>
          </button>
          {/* 側邊欄 */}
          {sidebarOpen && <SidebarDrawer user={user} onClose={() => setSidebarOpen(false)} />}
          <div style={{ width: '100vw', minWidth: 0, margin: 0, paddingTop: 80, paddingLeft: 0, paddingRight: 0, boxSizing: 'border-box' }}>
            <h1 style={{ textAlign: 'center', marginBottom: 32, color: 'var(--color-primary)', fontSize: 'clamp(2rem, 8vw, 2.5rem)', fontWeight: 700, letterSpacing: 1, wordBreak: 'break-word', background: 'rgba(255,255,255,0.7)', padding: '8px 0', borderRadius: 'var(--radius)', boxShadow: 'var(--color-shadow)' }}>
              主畫面
            </h1>
            <div className="flex flex-center gap-md" style={{ flexDirection: 'column', padding: '0 8px' }}>
              <button className="flex flex-center" style={{ width: '100%', borderRadius: 'var(--radius)', background: 'var(--color-primary)', color: '#fff', fontWeight: 600, fontSize: '1.1rem', boxShadow: 'var(--color-shadow)', border: 'none', padding: '1rem', marginBottom: 8, transition: 'background 0.2s, box-shadow 0.2s' }} onClick={() => navigate('/setup')}>
                本次季保養設定
              </button>
              <button className="flex flex-center" style={{ width: '100%', borderRadius: 'var(--radius)', background: '#388e3c', color: '#fff', fontWeight: 600, fontSize: '1.1rem', boxShadow: 'var(--color-shadow)', border: 'none', padding: '1rem', marginBottom: 8, transition: 'background 0.2s, box-shadow 0.2s' }} onClick={() => navigate('/form')}>
                本次季保養表單
              </button>
              <button className="flex flex-center" style={{ width: '100%', borderRadius: 'var(--radius)', background: '#fbc02d', color: '#333', fontWeight: 600, fontSize: '1.1rem', boxShadow: 'var(--color-shadow)', border: 'none', padding: '1rem', marginBottom: 8, transition: 'background 0.2s, box-shadow 0.2s' }} onClick={() => navigate('/history')}>
                本次保養季保養紀錄歷史
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <TopBarMenu user={user} />
          <div style={{ width: '100vw', background: 'rgba(255,255,255,0.95)', borderRadius: 'var(--radius)', boxShadow: 'var(--color-shadow)', padding: 'clamp(32px, 6vw, 64px) 0 clamp(24px, 4vw, 48px) 0', minHeight: '100vh', boxSizing: 'border-box' }}>
            <h1 style={{ textAlign: 'center', marginBottom: 40, color: 'var(--color-primary)', fontSize: 'clamp(2rem, 8vw, 2.5rem)', fontWeight: 700, letterSpacing: 2, wordBreak: 'break-word', background: 'rgba(255,255,255,0.7)', padding: '8px 0', borderRadius: 'var(--radius)', boxShadow: 'var(--color-shadow)' }}>
              ACL 季保養系統
            </h1>
            <div className="flex flex-center gap-md" style={{ flexDirection: 'row', justifyContent: 'center', padding: '0 32px' }}>
              <button className="flex flex-center" style={{ flex: 1, minWidth: 180, maxWidth: 320, borderRadius: 'var(--radius)', background: 'var(--color-primary)', color: '#fff', fontWeight: 600, fontSize: '1.1rem', boxShadow: 'var(--color-shadow)', border: 'none', padding: '1.2rem', margin: 8, transition: 'background 0.2s, box-shadow 0.2s' }} onClick={() => navigate('/setup')}>
                本次季保養設定
              </button>
              <button className="flex flex-center" style={{ flex: 1, minWidth: 180, maxWidth: 320, borderRadius: 'var(--radius)', background: '#388e3c', color: '#fff', fontWeight: 600, fontSize: '1.1rem', boxShadow: 'var(--color-shadow)', border: 'none', padding: '1.2rem', margin: 8, transition: 'background 0.2s, box-shadow 0.2s' }} onClick={() => navigate('/form')}>
                本次季保養表單
              </button>
              <button className="flex flex-center" style={{ flex: 1, minWidth: 180, maxWidth: 320, borderRadius: 'var(--radius)', background: '#fbc02d', color: '#333', fontWeight: 600, fontSize: '1.1rem', boxShadow: 'var(--color-shadow)', border: 'none', padding: '1.2rem', margin: 8, transition: 'background 0.2s, box-shadow 0.2s' }} onClick={() => navigate('/history')}>
                本次保養季保養紀錄歷史
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import React from 'react';
import AppSettings from '../components/AppSettings';

// 應用程式設定頁
export default function AppSettingsPage() {
  return (
    <div className="card" style={{ maxWidth: 600, margin: '2.5rem auto', boxShadow: 'var(--color-shadow)', borderRadius: 'var(--radius)', background: 'var(--color-surface)' }}>
      <AppSettings />
    </div>
  );
}

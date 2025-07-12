import React from 'react';
import UserSettings from '../components/UserSettings';

// 使用者設定頁
export default function UserSettingsPage() {
  return (
    <div className="card" style={{ maxWidth: 600, margin: '2.5rem auto', boxShadow: 'var(--color-shadow)', borderRadius: 'var(--radius)', background: 'var(--color-surface)' }}>
      <UserSettings />
    </div>
  );
}

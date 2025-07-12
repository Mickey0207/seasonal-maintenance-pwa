import React from 'react';
import MaintenanceSetupForm from '../components/MaintenanceSetupForm';

// 季保養設定頁
export default function Setup() {
  return (
    <div className="card" style={{ maxWidth: 700, margin: '2.5rem auto', boxShadow: 'var(--color-shadow)', borderRadius: 'var(--radius)', background: 'var(--color-surface)' }}>
      <MaintenanceSetupForm />
    </div>
  );
}

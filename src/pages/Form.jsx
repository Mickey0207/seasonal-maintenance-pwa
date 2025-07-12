import React from 'react';
import MaintenanceSetupForm from '../components/MaintenanceSetupForm';

// 季保養表單頁
export default function Form() {
  return (
    <div className="card" style={{ maxWidth: 700, margin: '2.5rem auto', boxShadow: 'var(--color-shadow)', borderRadius: 'var(--radius)', background: 'var(--color-surface)' }}>
      <MaintenanceSetupForm />
    </div>
  );
}

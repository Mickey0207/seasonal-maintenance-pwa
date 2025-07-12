import React from 'react';
import HistoryList from '../components/HistoryList';

// 歷史紀錄頁
export default function History() {
  return (
    <div className="card" style={{ maxWidth: 900, margin: '2.5rem auto', boxShadow: 'var(--color-shadow)', borderRadius: 'var(--radius)', background: 'var(--color-surface)' }}>
      <HistoryList />
    </div>
  );
}

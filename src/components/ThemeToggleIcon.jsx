import React, { useContext, useRef } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function ThemeToggleIcon() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const iconRef = useRef();
  return (
    <button
      onClick={() => {
        // icon 微縮放動畫
        if (iconRef.current) {
          iconRef.current.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(0.85)' },
            { transform: 'scale(1)' }
          ], { duration: 250 });
        }
        toggleTheme();
      }}
      style={{
        position: 'absolute',
        top: 20,
        right: 24,
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #23272f 60%, #333 100%)'
          : 'linear-gradient(135deg, #fff 60%, #e3f0ff 100%)',
        border: theme === 'dark' ? '2px solid #444' : '2px solid #e3f0ff',
        borderRadius: '50%',
        boxShadow: theme === 'dark'
          ? '0 4px 16px rgba(25, 118, 210, 0.18)'
          : '0 2px 8px rgba(25, 118, 210, 0.10)',
        cursor: 'pointer',
        fontSize: 28,
        width: 52,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.25s, box-shadow 0.25s, color 0.25s, border 0.25s',
        color: theme === 'dark' ? '#ffe082' : '#1976d2',
        zIndex: 1000,
        outline: 'none',
      }}
      aria-label="切換主題"
      title="切換主題"
      onMouseOver={e => {
        e.currentTarget.style.background = theme === 'dark'
          ? 'linear-gradient(135deg, #23272f 40%, #1976d2 100%)'
          : 'linear-gradient(135deg, #e3f0ff 40%, #90caf9 100%)';
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(25, 118, 210, 0.22)';
        e.currentTarget.style.border = theme === 'dark' ? '2px solid #1976d2' : '2px solid #90caf9';
      }}
      onMouseOut={e => {
        e.currentTarget.style.background = theme === 'dark'
          ? 'linear-gradient(135deg, #23272f 60%, #333 100%)'
          : 'linear-gradient(135deg, #fff 60%, #e3f0ff 100%)';
        e.currentTarget.style.boxShadow = theme === 'dark'
          ? '0 4px 16px rgba(25, 118, 210, 0.18)'
          : '0 2px 8px rgba(25, 118, 210, 0.10)';
        e.currentTarget.style.border = theme === 'dark' ? '2px solid #444' : '2px solid #e3f0ff';
      }}
      onFocus={e => {
        e.currentTarget.style.boxShadow = '0 0 0 3px #90caf9';
      }}
      onBlur={e => {
        e.currentTarget.style.boxShadow = theme === 'dark'
          ? '0 4px 16px rgba(25, 118, 210, 0.18)'
          : '0 2px 8px rgba(25, 118, 210, 0.10)';
      }}
    >
      <span ref={iconRef} style={{ transition: 'transform 0.25s' }}>
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </button>
  );
}

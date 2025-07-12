import React from 'react';
import { BulbOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../lib/ThemeContext';
import { Button } from 'antd';

export default function ThemeSwitchBtn({ style }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      type="text"
      icon={theme === 'dark' ? <BulbOutlined /> : <MoonOutlined />}
      style={{ fontSize: 22, position: 'absolute', top: 16, right: 16, zIndex: 100, ...style }}
      onClick={toggleTheme}
      aria-label="切換主題"
    />
  );
}

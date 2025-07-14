import React from 'react';
import { MoonOutlined } from '@ant-design/icons';
import { Button } from 'antd';

export default function ThemeSwitchBtn({ style }) {
  return (
    <Button
      type="text"
      icon={<MoonOutlined />}
      style={{ fontSize: 22, position: 'absolute', top: 16, right: 16, zIndex: 100, ...style }}
      aria-label="切換主題"
      disabled
    />
  );
}
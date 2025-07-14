import React from 'react';
import { Spin } from 'antd';

const LoadingSpinner = ({ tip = '載入中...', style = {} }) => {
  return (
    <div className="modern-loading" style={style}>
      <Spin tip={tip} size="large" />
    </div>
  );
};

export default LoadingSpinner;
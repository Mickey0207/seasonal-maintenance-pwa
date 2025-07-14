import React from 'react';
import { PlusOutlined } from '@ant-design/icons';

const AddProjectCard = ({ onClick, style = {} }) => {
  return (
    <div
      className="add-project-card"
      onClick={onClick}
      style={{ 
        height: 320,
        ...style 
      }}
    >
      <div className="add-content">
        <PlusOutlined />
        <div className="add-text">新增案場</div>
      </div>
    </div>
  );
};

export default AddProjectCard;
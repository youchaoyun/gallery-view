import React from 'react';
import { FileImageOutlined } from '@ant-design/icons';

interface ImagePlaceholderProps {
  width?: string | number;
  height?: string | number;
  text?: string;
  fontSize?: string | number;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  width = '100%',
  height = '100%',
  text = '暂无图片',
  fontSize = '18px',
}) => {
  const hasText = Boolean(text);

  return (
    <div
      style={{
        width,
        height,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        gap: hasText ? '12px' : '0',
      }}
    >
      <FileImageOutlined style={{ fontSize: '32px', opacity: 0.8 }} />
      {hasText ? <span style={{ fontSize, fontWeight: 500 }}>{text}</span> : null}
    </div>
  );
};

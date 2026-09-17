import React from 'react';

interface AvatarProps {
  children: React.ReactNode;
  className?: string;
  bgColor?: string;
  textColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  children, 
  className = '',
  bgColor = 'bg-blue-100',
  textColor = 'text-blue-600'
}) => {
  return (
    <div className={`flex items-center justify-center rounded-full w-12 h-12 ${bgColor} ${textColor} ${className}`}>
      {children}
    </div>
  );
};

import React from 'react';
import * as lucide from 'lucide';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className, size = 24 }) => {
  const iconNode = (lucide.icons as any)[name];

  if (!iconNode) {
    return null;
  }
  
  const iconHtml = iconNode.toSvg({
    class: className,
    width: size,
    height: size,
  });

  return <i dangerouslySetInnerHTML={{ __html: iconHtml || '' }} />;
};
import React, { useEffect, useState } from 'react';
import { Icons } from './Icon';

interface FloatingMenuButtonProps {
  onClick: () => void;
  screenWidth: number;
  mdBreakpoint: number;
}

export const FloatingMenuButton: React.FC<FloatingMenuButtonProps> = ({
  onClick,
  screenWidth,
  mdBreakpoint
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // 모바일에서만 표시
  const shouldShow = screenWidth < mdBreakpoint;

  // 페이드인 애니메이션
  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-[30%] right-4 z-40
        w-14 h-14 rounded-full
        bg-blue-600 text-white
        shadow-lg hover:shadow-xl
        hover:bg-blue-700 active:bg-blue-800
        transition-all duration-300
        flex items-center justify-center
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
      `}
      style={{
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4), 0 2px 6px rgba(0, 0, 0, 0.12)'
      }}
      aria-label="메뉴 열기"
    >
      <Icons.Menu size={24} />
    </button>
  );
};

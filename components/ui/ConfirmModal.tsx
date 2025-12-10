import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div className="relative w-full max-w-[280px] bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 transform">
        <div className="p-5 text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed break-keep">
            {message}
          </p>
        </div>
        <div className="flex border-t border-gray-100">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors active:bg-gray-100"
          >
            취소
          </button>
          <div className="w-px bg-gray-100"></div>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors active:bg-red-100"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};
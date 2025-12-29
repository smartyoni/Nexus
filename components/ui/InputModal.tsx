import React, { useState, useEffect } from 'react';

interface InputModalProps {
  isOpen: boolean;
  title: string;
  placeholder: string;
  initialValue?: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export const InputModal: React.FC<InputModalProps> = ({
  isOpen,
  title,
  placeholder,
  initialValue = '',
  onConfirm,
  onClose
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [isOpen, initialValue]);

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-[320px] bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 transform">
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            autoFocus
          />
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
            onClick={handleConfirm}
            disabled={!value.trim()}
            className="flex-1 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors active:bg-blue-100 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

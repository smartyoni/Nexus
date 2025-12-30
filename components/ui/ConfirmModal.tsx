import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string; // 확인 버튼 텍스트 (기본값: "삭제")
  cancelText?: string; // 취소 버튼 텍스트 (기본값: "취소")
  isDanger?: boolean; // true면 확인 버튼을 빨간색으로 표시 (기본값: true)
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
  confirmText = '삭제',
  cancelText = '취소',
  isDanger = true
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
            {cancelText}
          </button>
          <div className="w-px bg-gray-100"></div>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-sm font-bold transition-colors active:bg-opacity-75 ${
              isDanger
                ? 'text-red-600 hover:bg-red-50 active:bg-red-100'
                : 'text-blue-600 hover:bg-blue-50 active:bg-blue-100'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
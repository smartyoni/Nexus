import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    thirdButtonText?: string;
    onThirdButtonClick?: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onClose,
    confirmText = '삭제',
    cancelText = '취소',
    isDanger = true,
    thirdButtonText,
    onThirdButtonClick
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            {/* 백드롭 (Blurry Light) */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onThirdButtonClick || onClose}
            />

            {/* 모달 (White surface) */}
            <div className="relative w-full max-w-[340px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-fade-in mb-8 sm:mb-0">
                <div className="p-7">
                    <h3 className="text-[17px] font-bold text-slate-900 mb-2.5">{title}</h3>
                    <p className="text-[14px] text-slate-500 leading-relaxed break-keep font-medium">
                        {message}
                    </p>
                </div>
                <div className="flex border-t border-slate-100 bg-slate-50/50">
                    {thirdButtonText && (
                        <>
                            <button
                                onClick={onThirdButtonClick}
                                className="flex-1 py-4 text-sm font-semibold text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                                {thirdButtonText}
                            </button>
                            <div className="w-[1px] bg-slate-100" />
                        </>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors border-r border-slate-100"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-4 text-sm font-bold transition-all active:scale-95 ${isDanger
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-indigo-600 hover:bg-indigo-50'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

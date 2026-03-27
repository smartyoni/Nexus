import React, { useEffect, useRef } from 'react';
import { Icons } from './Icon';

interface DeleteConfirmPopoverProps {
    onConfirm: () => void;
    onCancel: () => void;
    message?: string;
    className?: string;
}

export const DeleteConfirmPopover: React.FC<DeleteConfirmPopoverProps> = ({
    onConfirm,
    onCancel,
    message = "정말 삭제하시겠습니까?",
    className = ""
}) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onConfirm();
            } else if (e.key === 'Escape') {
                onCancel();
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                onCancel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onConfirm, onCancel]);

    return (
        <div 
            ref={popoverRef}
            className={`absolute top-full right-0 mt-2 z-50 min-w-[200px] bg-white rounded-xl shadow-2xl border border-slate-200 p-4 animate-slide-up ${className}`}
            onClick={(e) => e.stopPropagation()}
        >
            <p className="text-sm font-bold text-slate-700 mb-3">{message}</p>
            <div className="flex items-center gap-2">
                <button
                    onClick={onConfirm}
                    className="flex-1 bg-rose-500 text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-rose-600 transition-colors flex items-center justify-center gap-1"
                >
                    <Icons.Trash size={14} />
                    삭제 (Enter)
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 bg-slate-100 text-slate-500 text-xs font-bold py-2 px-3 rounded-lg hover:bg-slate-200 transition-colors"
                >
                    취소
                </button>
            </div>
            {/* Arrow */}
            <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-t border-l border-slate-200 transform rotate-45" />
        </div>
    );
};

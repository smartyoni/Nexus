import React, { useState, useEffect } from 'react';
import { Icons } from './Icon';
import { ConfirmModal } from './ConfirmModal';

interface MemoModalProps {
    isOpen: boolean;
    memo?: string;
    onSave: (memo: string) => void;
    onDelete: () => void;
    onClose: () => void;
}

export const MemoModal: React.FC<MemoModalProps> = ({
    isOpen,
    memo = '',
    onSave,
    onDelete,
    onClose
}) => {
    const [isEditing, setIsEditing] = useState(!memo);
    const [memoText, setMemoText] = useState(memo);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        setMemoText(memo);
        setIsEditing(!memo);
    }, [isOpen, memo]);

    const handleSave = () => {
        onSave(memoText.trim());
        setIsEditing(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        onDelete();
        setIsEditing(false);
        setShowDeleteConfirm(false);
    };

    const handleDoubleClick = () => {
        if (memoText && !isEditing) {
            setIsEditing(true);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            {/* 백드롭 */}
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" />

            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-[400px] h-[80vh] flex flex-col pointer-events-auto overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
                {/* 헤더 */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
                    <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                        💬 항목 세부 메모
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200/50 rounded-xl transition-colors text-slate-400"
                    >
                        <Icons.Close size={20} />
                    </button>
                </div>

                {/* 콘텐츠 영역 */}
                <div className="flex-1 p-5 overflow-hidden flex flex-col min-h-0 bg-white">
                    {isEditing ? (
                        <textarea
                            value={memoText}
                            onChange={(e) => setMemoText(e.target.value)}
                            placeholder="메모 내용을 입력하세요..."
                            className="flex-1 w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 bg-slate-50 text-slate-800 placeholder:text-slate-400 resize-none text-[15px] leading-relaxed font-medium transition-all"
                            autoFocus
                        />
                    ) : (
                        <div
                            onDoubleClick={handleDoubleClick}
                            className="flex-1 p-4 bg-slate-50/50 border border-slate-100 rounded-xl overflow-y-auto whitespace-pre-wrap text-slate-700 cursor-text hover:bg-slate-50 transition-all text-[15px] leading-relaxed font-medium"
                            title="더블클릭하여 수정 가능"
                        >
                            {memoText || <span className="text-slate-300 italic font-normal">등록된 메모 내용이 없습니다.</span>}
                        </div>
                    )}
                </div>

                {/* 푸터 (액션 영역) */}
                <div className="flex gap-2.5 p-5 border-t border-slate-100 flex-shrink-0 bg-white">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => {
                                    setMemoText(memo);
                                    setIsEditing(false);
                                }}
                                className="flex-1 px-4 py-3 text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold transition-all text-sm active:scale-95"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-black font-bold transition-all text-sm shadow-md active:scale-95"
                            >
                                저장 완료
                            </button>
                        </>
                    ) : (
                        <>
                            {memoText && (
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-3 border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-50 transition-all text-sm font-bold active:scale-95"
                                    title="메모 삭제"
                                >
                                    <Icons.Trash size={18} />
                                </button>
                            )}
                            <button
                                onClick={handleEdit}
                                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold transition-all text-sm shadow-md flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Icons.Note size={18} /> 내용 수정하기
                            </button>
                        </>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="메모 삭제"
                message="이 메모를 삭제하시겠습니까? 삭제된 정보는 복구할 수 없습니다."
                onConfirm={handleConfirmDelete}
                onClose={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};

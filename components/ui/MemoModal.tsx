import React, { useState, useEffect } from 'react';
import { Icons } from './Icon';

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

  useEffect(() => {
    setMemoText(memo);
    setIsEditing(!memo);
  }, [isOpen, memo]);

  const handleBlur = () => {
    setIsEditing(false);
    if (memoText !== memo) {
      onSave(memoText.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setMemoText(memo);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm('메모를 삭제하시겠습니까?')) {
      onDelete();
      setIsEditing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full mx-4 max-h-[90vh] h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">메모</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Icons.Close size={20} />
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-4 flex flex-col"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {isEditing ? (
            <textarea
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="메모를 입력하세요... (Esc로 취소)"
              className="flex-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              autoFocus
            />
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsEditing(true);
              }}
              onMouseDown={(e) => {
                if (e.detail > 1) {
                  e.preventDefault();
                }
              }}
              className="flex-1 overflow-y-auto p-3 bg-gray-50 rounded-md whitespace-pre-wrap text-gray-700 cursor-text hover:bg-gray-100 transition-colors"
            >
              {memoText || '더블클릭하여 메모를 입력하세요'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200 flex-shrink-0">
          {memoText && (
            <button
              onClick={handleDelete}
              className="flex-1 px-3 py-2 text-gray-700 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

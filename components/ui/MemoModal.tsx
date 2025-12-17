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

  const handleSave = () => {
    onSave(memoText.trim());
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
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
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">메모</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Icons.Close size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isEditing ? (
            <textarea
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              placeholder="메모를 입력하세요..."
              className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              autoFocus
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-md min-h-40 max-h-96 overflow-y-auto whitespace-pre-wrap text-gray-700">
              {memoText || '메모가 없습니다.'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setMemoText(memo);
                  setIsEditing(false);
                }}
                className="flex-1 px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                저장
              </button>
            </>
          ) : (
            <>
              {memoText && (
                <button
                  onClick={handleDelete}
                  className="flex-1 px-3 py-2 text-gray-700 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  삭제
                </button>
              )}
              <button
                onClick={handleEdit}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                수정
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

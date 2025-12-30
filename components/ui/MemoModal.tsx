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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg w-[90%] h-[90vh] flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 bg-blue-100">
          <h2 className="text-lg font-semibold text-gray-800">메모</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Icons.Close size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
          {isEditing ? (
            <textarea
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              placeholder="메모를 입력하세요..."
              className="flex-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              autoFocus
            />
          ) : (
            <div
              onDoubleClick={handleDoubleClick}
              className="flex-1 p-3 bg-gray-50 rounded-md overflow-y-auto whitespace-pre-wrap text-gray-700 cursor-text hover:bg-gray-100 transition-colors"
              title="더블클릭하여 편집"
            >
              {memoText || '메모가 없습니다.'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200 flex-shrink-0">
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
                onClick={onClose}
                className="flex-1 px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="메모 삭제"
        message="메모를 영구적으로 삭제하시겠습니까?"
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

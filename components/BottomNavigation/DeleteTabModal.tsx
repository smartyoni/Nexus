import React from 'react';
import { Icons } from '../ui/Icon';

interface DeleteTabModalProps {
  tabName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteTabModal: React.FC<DeleteTabModalProps> = ({
  tabName,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 animate-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">탭 삭제</h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <Icons.Close size={20} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          "<span className="font-semibold">{tabName}</span>" 탭을 삭제하시겠습니까?
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Icons.Trash size={16} />
            <span>삭제</span>
          </button>
        </div>
      </div>
    </div>
  );
};

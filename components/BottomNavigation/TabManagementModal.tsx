import React, { useState } from 'react';
import { Tab } from '../../types';
import { Icons } from '../ui/Icon';

interface TabManagementModalProps {
  tab: Tab;
  onRename: (newName: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const TabManagementModal: React.FC<TabManagementModalProps> = ({
  tab,
  onRename,
  onDelete,
  onClose
}) => {
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [inputValue, setInputValue] = useState(tab.name);

  const handleRenameClick = () => {
    setShowRenameInput(true);
  };

  const handleConfirmRename = () => {
    const trimmedName = inputValue.trim();
    if (trimmedName && trimmedName !== tab.name) {
      onRename(trimmedName);
      onClose();
    }
  };

  const handleDeleteClick = () => {
    onDelete();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 animate-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">{tab.name}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <Icons.Close size={20} />
          </button>
        </div>

        {!showRenameInput ? (
          <div className="space-y-2">
            <button
              onClick={handleRenameClick}
              className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              이름 변경
            </button>
            <button
              onClick={handleDeleteClick}
              className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              삭제
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="새 탭 이름"
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmRename();
                if (e.key === 'Escape') setShowRenameInput(false);
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowRenameInput(false)}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmRename}
                disabled={!inputValue.trim() || inputValue.trim() === tab.name}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-lg transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

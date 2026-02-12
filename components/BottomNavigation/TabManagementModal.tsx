import React, { useState } from 'react';
import { Tab } from '../../types';
import { Icons } from '../ui/Icon';

interface TabManagementModalProps {
  tab: Tab;
  onRename: (newName: string) => void;
  onDelete: () => void;
  onClose: () => void;
  allTabs?: Tab[]; // 전체 탭 목록 (검증용)
}

export const TabManagementModal: React.FC<TabManagementModalProps> = ({
  tab,
  onRename,
  onDelete,
  onClose,
  allTabs = []
}) => {
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [inputValue, setInputValue] = useState(tab.name);
  const [error, setError] = useState('');

  const handleRenameClick = () => {
    setShowRenameInput(true);
    setError('');
  };

  const handleNameChange = (value: string) => {
    setInputValue(value);

    const trimmed = value.trim();

    // IN-BOX 이름 검증 (기본 탭이 아닌 경우만)
    if (trimmed.toUpperCase() === 'IN-BOX' && !tab.isDefault) {
      setError('IN-BOX는 기본 탭 전용 이름입니다');
      return;
    }

    // 중복 이름 검증
    if (trimmed && trimmed !== tab.name) {
      const isDuplicate = allTabs.some(t =>
        t.id !== tab.id && t.name.trim().toUpperCase() === trimmed.toUpperCase()
      );
      if (isDuplicate) {
        setError('이미 존재하는 탭 이름입니다');
        return;
      }
    }

    setError('');
  };

  const handleConfirmRename = () => {
    const trimmedName = inputValue.trim();
    if (trimmedName && trimmedName !== tab.name && !error) {
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
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="새 탭 이름"
              autoFocus
              className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/10'
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !error) handleConfirmRename();
                if (e.key === 'Escape') setShowRenameInput(false);
              }}
            />
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRenameInput(false);
                  setError('');
                  setInputValue(tab.name);
                }}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmRename}
                disabled={!inputValue.trim() || inputValue.trim() === tab.name || !!error}
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

import React, { useState, useRef } from 'react';
import { Tab } from '../../types';
import { Icons } from '../ui/Icon';
import { TabManagementModal } from './TabManagementModal';

interface BottomNavigationProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onAddTab: () => void;
  onRenameTab: (id: string, name: string) => void;
  onDeleteTab: (id: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onAddTab,
  onRenameTab,
  onDeleteTab
}) => {
  const [contextMenuTabId, setContextMenuTabId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [tabModalOpen, setTabModalOpen] = useState(false);
  const [selectedTabForModal, setSelectedTabForModal] = useState<Tab | null>(null);
  const [deleteConfirmTabId, setDeleteConfirmTabId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Find the active tab
  const activeTab = tabs.find(t => t.id === activeTabId);

  const handleTabLongPress = (tab: Tab, e: React.TouchEvent<HTMLButtonElement>) => {
    if (tab.isDefault) return;
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const longPressTimer = setTimeout(() => {
        setContextMenuTabId(tab.id);
        setContextMenuPos({ x: touch.clientX, y: touch.clientY });
      }, 500);
      (e.currentTarget as any).longPressTimer = longPressTimer;
    }
  };

  const handleTabRightClick = (tab: Tab, e: React.MouseEvent<HTMLButtonElement>) => {
    if (tab.isDefault) return;
    e.preventDefault();
    setContextMenuTabId(tab.id);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleTabTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    const timer = (e.currentTarget as any).longPressTimer;
    if (timer) clearTimeout(timer);
  };

  const handleOpenTabModal = (tab: Tab) => {
    setSelectedTabForModal(tab);
    setTabModalOpen(true);
    setContextMenuTabId(null);
  };

  const handleRenameConfirm = (newName: string) => {
    if (selectedTabForModal) {
      onRenameTab(selectedTabForModal.id, newName);
    }
    setTabModalOpen(false);
    setSelectedTabForModal(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedTabForModal) {
      onDeleteTab(selectedTabForModal.id);
    }
    setTabModalOpen(false);
    setSelectedTabForModal(null);
  };

  const canAddTab = tabs.length < 4;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-lg z-40 flex items-center px-2 gap-2 overflow-x-auto safe-bottom">
        {/* Scrollable tabs container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide"
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              onContextMenu={(e) => handleTabRightClick(tab, e)}
              onTouchStart={(e) => handleTabLongPress(tab, e)}
              onTouchEnd={(e) => handleTabTouchEnd(e)}
              className={`
                flex-shrink-0 px-3 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap
                ${activeTabId === tab.id
                  ? 'bg-blue-50 text-blue-600 border-t-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Add tab button */}
        <button
          onClick={onAddTab}
          disabled={!canAddTab}
          title={canAddTab ? '새 탭 추가' : '최대 4개의 탭만 가능합니다'}
          className={`
            flex-shrink-0 p-2 rounded-lg transition-colors
            ${canAddTab
              ? 'text-gray-600 hover:bg-gray-100'
              : 'text-gray-300 cursor-not-allowed'
            }
          `}
        >
          <Icons.Plus size={20} />
        </button>
      </div>

      {/* Context Menu */}
      {contextMenuTabId && contextMenuPos && (
        <div
          className="fixed bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[160px]"
          style={{ left: `${contextMenuPos.x}px`, top: `${contextMenuPos.y}px` }}
          onClick={() => setContextMenuTabId(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              const tab = tabs.find(t => t.id === contextMenuTabId);
              if (tab) {
                handleOpenTabModal(tab);
              }
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            이름 변경
          </button>
          <div className="h-px bg-gray-200 my-1"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirmTabId(contextMenuTabId);
              setContextMenuTabId(null);
            }}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            삭제
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTabId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 animate-in">
            <h3 className="text-lg font-bold text-gray-800 mb-2">탭 삭제</h3>
            <p className="text-gray-600 mb-6">
              "{tabs.find(t => t.id === deleteConfirmTabId)?.name}" 탭을 삭제하시겠습니까?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmTabId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  onDeleteTab(deleteConfirmTabId);
                  setDeleteConfirmTabId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Management Modal (Rename) */}
      {tabModalOpen && selectedTabForModal && (
        <TabManagementModal
          tab={selectedTabForModal}
          onRename={handleRenameConfirm}
          onDelete={handleDeleteConfirm}
          onClose={() => {
            setTabModalOpen(false);
            setSelectedTabForModal(null);
          }}
        />
      )}
    </>
  );
};

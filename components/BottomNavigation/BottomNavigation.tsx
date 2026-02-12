import React, { useState, useRef } from 'react';
import { Tab } from '../../types';
import { Icons } from '../ui/Icon';
import { TabManagementModal } from './TabManagementModal';
import { DeleteTabModal } from './DeleteTabModal';

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
      const longPressTimer = setTimeout(() => {
        setSelectedTabForModal(tab);
        setTabModalOpen(true);
      }, 500);
      (e.currentTarget as any).longPressTimer = longPressTimer;
    }
  };

  const handleTabRightClick = (tab: Tab, e: React.MouseEvent<HTMLButtonElement>) => {
    if (tab.isDefault) return;
    e.preventDefault();
    setSelectedTabForModal(tab);
    setTabModalOpen(true);
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
      setDeleteConfirmTabId(selectedTabForModal.id);
    }
    setTabModalOpen(false);
    setSelectedTabForModal(null);
  };

  const canAddTab = tabs.length < 4;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-lg z-40 flex items-center px-2 gap-2 safe-bottom">
        {/* Tabs container - equally distributed */}
        <div
          ref={scrollContainerRef}
          className="flex items-center flex-1"
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              onContextMenu={(e) => handleTabRightClick(tab, e)}
              onTouchStart={(e) => handleTabLongPress(tab, e)}
              onTouchEnd={(e) => handleTabTouchEnd(e)}
              className={`
                flex-1 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap truncate
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmTabId && (
        <DeleteTabModal
          tabName={tabs.find(t => t.id === deleteConfirmTabId)?.name || ''}
          onConfirm={() => {
            onDeleteTab(deleteConfirmTabId);
            setDeleteConfirmTabId(null);
          }}
          onCancel={() => setDeleteConfirmTabId(null)}
        />
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

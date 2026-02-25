import React, { useState } from 'react';
import { DocumentData } from '../../types';
import { Icons } from '../ui/Icon';
import { ConfirmModal } from '../ui/ConfirmModal';

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentData[];
  activeTabId: string;
  favoriteDocId: string | null;
  onSelectDocument: (doc: DocumentData) => void;
  onCreateNew: () => void;
  onDeleteDocument: (id: string) => void;
  onMultiDeleteDocuments?: (ids: string[]) => void;
  onSetFavoriteDocument: (id: string) => void;
  onClearFavoriteDocument: () => void;
  onReorderDocuments: (reorderedDocs: DocumentData[]) => void;
  onRefresh?: () => void; // Refresh data without page reload
}

export const DocumentDrawer: React.FC<DocumentDrawerProps> = ({
  isOpen,
  onClose,
  documents,
  activeTabId,
  favoriteDocId,
  onSelectDocument,
  onCreateNew,
  onDeleteDocument,
  onMultiDeleteDocuments,
  onSetFavoriteDocument,
  onClearFavoriteDocument,
  onReorderDocuments,
  onRefresh
}) => {
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [draggedDocId, setDraggedDocId] = useState<string | null>(null);
  const [dragOverDocId, setDragOverDocId] = useState<string | null>(null);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [isMultiDeleteModalOpen, setIsMultiDeleteModalOpen] = useState(false);

  // Filter documents by active tab
  const tabDocuments = documents.filter(doc => doc.tabId === activeTabId);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, docId: string) => {
    setDraggedDocId(docId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', docId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, docId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedDocId && draggedDocId !== docId) {
      setDragOverDocId(docId);
    }
  };

  const handleDragLeave = () => {
    setDragOverDocId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetDocId: string) => {
    e.preventDefault();
    if (!draggedDocId || draggedDocId === targetDocId) {
      setDraggedDocId(null);
      setDragOverDocId(null);
      return;
    }

    const draggedIndex = tabDocuments.findIndex(doc => doc.id === draggedDocId);
    const targetIndex = tabDocuments.findIndex(doc => doc.id === targetDocId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTabDocs = [...tabDocuments];
    const [draggedDoc] = newTabDocs.splice(draggedIndex, 1);
    newTabDocs.splice(targetIndex, 0, draggedDoc);

    // Reconstruct full documents array with new order
    const otherDocs = documents.filter(doc => doc.tabId !== activeTabId);
    const reorderedDocs = [...newTabDocs, ...otherDocs];

    onReorderDocuments(reorderedDocs);
    setDraggedDocId(null);
    setDragOverDocId(null);
  };

  const handleDragEnd = () => {
    setDraggedDocId(null);
    setDragOverDocId(null);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>, docId: string) => {
    e.preventDefault();
    setContextMenuId(docId);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedDocIds(new Set()); // Reset selection when toggling
  };

  const toggleDocumentSelection = (id: string) => {
    const newSelection = new Set(selectedDocIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedDocIds(newSelection);
  };

  const requestMultiDelete = () => {
    if (selectedDocIds.size === 0) return;
    setIsMultiDeleteModalOpen(true);
  };

  const handleMultiDelete = () => {
    onMultiDeleteDocuments?.(Array.from(selectedDocIds));
    setIsSelectionMode(false);
    setSelectedDocIds(new Set());
    setIsMultiDeleteModalOpen(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, docId: string) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const longPressTimer = setTimeout(() => {
        setContextMenuId(docId);
        setContextMenuPos({ x: touch.clientX, y: touch.clientY });
      }, 500);
      (e.target as any).longPressTimer = longPressTimer;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const timer = (e.target as any).longPressTimer;
    if (timer) clearTimeout(timer);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-30 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer - full screen with bottom nav on top */}
      <div
        className={`
          fixed inset-0 bg-white shadow-2xl z-30 flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 border-b flex-shrink-0 gap-2 bg-green-500 text-white h-16">
          <h2 className="text-lg font-bold">메모장</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onCreateNew}
              className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-none flex items-center justify-center p-1.5"
              title="새 문서 추가"
            >
              <Icons.Plus size={18} />
            </button>
            <button
              onClick={toggleSelectionMode}
              className={`px-3 py-1 text-sm font-medium rounded-none transition-colors ${isSelectionMode
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
            >
              {isSelectionMode ? '취소' : '선택'}
            </button>
            <button
              onClick={() => {
                console.log('🔄 Refresh button clicked, onRefresh:', typeof onRefresh);
                onRefresh?.();
              }}
              className="p-1.5 hover:bg-green-600 rounded-none transition-colors"
              title="새로고침"
            >
              <Icons.Refresh size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-green-600 rounded-none"
            >
              <Icons.Close size={20} />
            </button>
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-2">
          {tabDocuments.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              문서가 없습니다
            </div>
          ) : (
            <div className="space-y-0">
              {tabDocuments.map((doc, index) => (
                <div
                  key={doc.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, doc.id)}
                  onDragOver={(e) => handleDragOver(e, doc.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, doc.id)}
                  onDragEnd={handleDragEnd}
                  onContextMenu={(e) => {
                    if (!isSelectionMode) handleContextMenu(e, doc.id);
                  }}
                  onTouchStart={(e) => {
                    if (!isSelectionMode) handleTouchStart(e, doc.id);
                  }}
                  onTouchEnd={(e) => {
                    if (!isSelectionMode) handleTouchEnd(e);
                  }}
                  className={`group bg-white p-3 transition-all relative ${index < tabDocuments.length - 1 ? 'border-b border-gray-200' : ''
                    } ${favoriteDocId === doc.id ? 'ring-2 ring-yellow-400' : ''
                    } ${draggedDocId === doc.id ? 'opacity-40 cursor-grabbing' : (isSelectionMode ? 'cursor-pointer hover:bg-gray-50' : 'cursor-grab hover:bg-gray-50')
                    } ${dragOverDocId === doc.id ? 'border-blue-500 border-b-2 bg-blue-50' : ''
                    }`}
                  onClick={() => {
                    if (isSelectionMode) {
                      toggleDocumentSelection(doc.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {isSelectionMode ? (
                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selectedDocIds.has(doc.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                        }`}>
                        {selectedDocIds.has(doc.id) && <Icons.Check size={14} className="text-white" />}
                      </div>
                    ) : (
                      <span className="text-red-600 text-2xl flex-shrink-0" style={{ transform: 'scale(0.7)' }}>●</span>
                    )}
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={(e) => {
                        if (isSelectionMode) {
                          e.stopPropagation();
                          toggleDocumentSelection(doc.id);
                        } else {
                          onSelectDocument(doc);
                          onClose();
                        }
                      }}
                    >
                      <h3 className="font-semibold text-gray-800 truncate text-lg">
                        {(doc.title || '제목없음').slice(0, 30)}
                      </h3>
                    </div>
                  </div>

                  {/* Context Menu */}
                  {contextMenuId === doc.id && contextMenuPos && (
                    <div
                      className="fixed bg-white border border-gray-200 rounded-none shadow-lg z-50 min-w-[160px]"
                      style={{ left: `${contextMenuPos.x}px`, top: `${contextMenuPos.y}px` }}
                      onClick={() => setContextMenuId(null)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (favoriteDocId === doc.id) {
                            onClearFavoriteDocument();
                          } else {
                            onSetFavoriteDocument(doc.id);
                          }
                          setContextMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 transition-colors flex items-center gap-2"
                      >
                        <span className="text-lg">⭐</span>
                        <span>{favoriteDocId === doc.id ? '즐겨찾기 해제' : '즐겨찾기 지정'}</span>
                      </button>

                      <div className="h-px bg-gray-200 my-1"></div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDocument(doc.id);
                          setContextMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <Icons.Trash size={16} />
                        <span>삭제</span>
                      </button>

                      <div className="h-px bg-gray-200 my-1"></div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selection Mode Bottom Action Bar */}
        {isSelectionMode && (
          <div className="px-4 py-3 bg-white border-t flex justify-between items-center shadow-lg">
            <span className="text-sm font-medium text-gray-700">
              {selectedDocIds.size}개 선택됨
            </span>
            <button
              onClick={requestMultiDelete}
              disabled={selectedDocIds.size === 0}
              className={`px-4 py-2 rounded-none font-medium transition-colors flex items-center gap-2 ${selectedDocIds.size > 0
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              <Icons.Trash size={18} />
              삭제
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="bg-green-500 text-white py-3 px-4 text-center text-sm font-medium flex-shrink-0">
          © {new Date().getFullYear()} 인사이트부동산 - 메모장 리스트
        </div>

      </div>

      {/* Multi-Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isMultiDeleteModalOpen}
        title="문서 다중 삭제"
        message={`선택한 ${selectedDocIds.size}개의 문서를 영구적으로 삭제하시겠습니까?`}
        onConfirm={handleMultiDelete}
        onClose={() => setIsMultiDeleteModalOpen(false)}
      />
    </>
  );
};

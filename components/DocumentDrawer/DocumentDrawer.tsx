import React, { useState } from 'react';
import { DocumentData } from '../../types';
import { Icons } from '../ui/Icon';

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentData[];
  activeTabId: string;
  favoriteDocId: string | null;
  onSelectDocument: (doc: DocumentData) => void;
  onCreateNew: () => void;
  onCreateNewWithContent: (content: string) => void;
  onDeleteDocument: (id: string) => void;
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
  onCreateNewWithContent,
  onDeleteDocument,
  onSetFavoriteDocument,
  onClearFavoriteDocument,
  onReorderDocuments,
  onRefresh
}) => {
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [draggedDocId, setDraggedDocId] = useState<string | null>(null);
  const [dragOverDocId, setDragOverDocId] = useState<string | null>(null);
  const [quickInputValue, setQuickInputValue] = useState<string>('');

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

  // Quick input handlers
  const handleQuickAddDocument = () => {
    if (quickInputValue.trim()) {
      onCreateNewWithContent(quickInputValue);
      setQuickInputValue('');
      onClose();
    }
  };

  const handleQuickInputKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleQuickAddDocument();
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>, docId: string) => {
    e.preventDefault();
    setContextMenuId(docId);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
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
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0 gap-2">
          <h2 className="text-lg font-bold text-gray-800">문서 리스트</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                console.log('🔄 Refresh button clicked, onRefresh:', typeof onRefresh);
                onRefresh?.();
              }}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="새로고침"
            >
              <Icons.Refresh size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <Icons.Close size={20} />
            </button>
          </div>
        </div>

        {/* Quick Input Section */}
        <div className="px-2 py-3 border-b bg-gray-50 flex-shrink-0">
          <div className="flex gap-2">
            <textarea
              value={quickInputValue}
              onChange={(e) => setQuickInputValue(e.target.value)}
              onKeyPress={handleQuickInputKeyPress}
              placeholder="문서 내용 입력... (Ctrl+Enter로 추가)"
              rows={2}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
            <button
              onClick={handleQuickAddDocument}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center flex-shrink-0"
              title="추가 (Ctrl+Enter)"
            >
              <Icons.Plus size={20} />
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
            <div className="space-y-2">
              {tabDocuments.map(doc => (
                <div
                  key={doc.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, doc.id)}
                  onDragOver={(e) => handleDragOver(e, doc.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, doc.id)}
                  onDragEnd={handleDragEnd}
                  onContextMenu={(e) => handleContextMenu(e, doc.id)}
                  onTouchStart={(e) => handleTouchStart(e, doc.id)}
                  onTouchEnd={(e) => handleTouchEnd(e)}
                  className={`group bg-white p-3 rounded-lg border shadow-sm transition-all relative ${
                    favoriteDocId === doc.id ? 'ring-2 ring-yellow-400' : ''
                  } ${
                    draggedDocId === doc.id ? 'opacity-40 cursor-grabbing' : 'cursor-grab hover:shadow-md'
                  } ${
                    dragOverDocId === doc.id ? 'border-blue-500 border-2 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-red-600 text-2xl flex-shrink-0" style={{ transform: 'scale(0.7)' }}>●</span>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        onSelectDocument(doc);
                        onClose();
                      }}
                    >
                      <h3 className="font-semibold text-gray-800 truncate text-lg">
                        {(doc.content?.split('\n')[0] || doc.title || '무제 (Untitled)').slice(0, 30)}
                      </h3>
                    </div>
                  </div>

                  {/* Context Menu */}
                  {contextMenuId === doc.id && contextMenuPos && (
                    <div
                      className="fixed bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[160px]"
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

      </div>
    </>
  );
};

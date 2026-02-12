import React, { useState } from 'react';
import { DocumentData, Tab } from '../../types';
import { Icons } from '../ui/Icon';

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentData[];
  activeTabId: string;
  favoriteDocId: string | null;
  onSelectDocument: (doc: DocumentData) => void;
  onCreateNew: () => void;
  onDeleteDocument: (id: string) => void;
  onSetFavoriteDocument: (id: string) => void;
  onClearFavoriteDocument: () => void;
  onReorderDocuments: (reorderedDocs: DocumentData[]) => void;
  onMoveToTab: (docId: string, tabId: string) => void;
  tabs: Tab[];
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
  onSetFavoriteDocument,
  onClearFavoriteDocument,
  onReorderDocuments,
  onMoveToTab,
  tabs
}) => {
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [draggedDocId, setDraggedDocId] = useState<string | null>(null);
  const [dragOverDocId, setDragOverDocId] = useState<string | null>(null);

  // Filter documents by active tab
  const tabDocuments = documents.filter(doc => doc.tabId === activeTabId);

  const formatDate = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

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
        style={{ bottom: '64px' }}
      />

      {/* Drawer */}
      <div
        className={`
          fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-40 flex flex-col max-h-[80vh]
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">문서</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <Icons.Close size={20} />
          </button>
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
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-none mt-0.5 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icons.DragHandle size={18} />
                    </div>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        onSelectDocument(doc);
                        onClose();
                      }}
                    >
                      <h3 className="font-semibold text-gray-800 truncate">{doc.title || '제목 없음'}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(doc.updatedAt)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument(doc.id);
                      }}
                      className="flex-none p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="삭제"
                    >
                      <Icons.Trash size={16} />
                    </button>
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

                      {/* Move to tab submenu */}
                      {tabs.length > 1 && (
                        <>
                          {tabs.map(tab => (
                            <button
                              key={tab.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (tab.id !== activeTabId) {
                                  onMoveToTab(doc.id, tab.id);
                                }
                                setContextMenuId(null);
                              }}
                              disabled={tab.id === activeTabId}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                                tab.id === activeTabId ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700'
                              } disabled:cursor-default`}
                            >
                              {tab.name}로 이동
                            </button>
                          ))}
                          <div className="h-px bg-gray-200 my-1"></div>
                        </>
                      )}

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
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - New Document Button */}
        <div className="border-t p-3 flex-shrink-0">
          <button
            onClick={() => {
              onCreateNew();
              onClose();
            }}
            className="w-full flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Icons.Plus size={16} className="mr-1" />
            <span className="text-sm font-medium">새문서추가</span>
          </button>
        </div>
      </div>
    </>
  );
};

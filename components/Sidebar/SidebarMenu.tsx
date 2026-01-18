import React, { useState } from 'react';
import { DocumentData } from '../../types';
import { Icons } from '../ui/Icon';

interface SidebarMenuProps {
  isMobileOpen: boolean;
  isAlwaysOpen: boolean;
  onClose: () => void;
  documents: DocumentData[];
  favoriteDocId: string | null;
  onSelectDocument: (doc: DocumentData) => void;
  onCreateNew: () => void;
  onDeleteDocument: (id: string) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
  onSetFavoriteDocument: (id: string) => void;
  onClearFavoriteDocument: () => void;
  onReorderDocuments: (reorderedDocs: DocumentData[]) => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  isMobileOpen,
  isAlwaysOpen,
  onClose,
  documents,
  favoriteDocId,
  onSelectDocument,
  onCreateNew,
  onDeleteDocument,
  onBackup,
  onRestore,
  onSetFavoriteDocument,
  onClearFavoriteDocument,
  onReorderDocuments
}) => {
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [draggedDocId, setDraggedDocId] = useState<string | null>(null);
  const [dragOverDocId, setDragOverDocId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isMobileOpen && !isAlwaysOpen) return null;

  // Format date helper
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // --- Drag and Drop Handlers ---
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

    const draggedIndex = documents.findIndex(doc => doc.id === draggedDocId);
    const targetIndex = documents.findIndex(doc => doc.id === targetDocId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newDocs = [...documents];
    const [draggedDoc] = newDocs.splice(draggedIndex, 1);
    newDocs.splice(targetIndex, 0, draggedDoc);

    onReorderDocuments(newDocs);
    setDraggedDocId(null);
    setDragOverDocId(null);
  };

  const handleDragEnd = () => {
    setDraggedDocId(null);
    setDragOverDocId(null);
  };

  return (
    <div className={`
      ${isAlwaysOpen ? 'relative flex-shrink-0 w-[250px] h-full' : 'fixed inset-0 z-50 flex'}
      ${!isAlwaysOpen && !isMobileOpen ? 'transform -translate-x-full' : 'transform translate-x-0'}
      transition-transform duration-300 ease-in-out
    `}>
      {/* Backdrop */}
      { !isAlwaysOpen && isMobileOpen && (
        <div 
          className="absolute inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Content */}
      <div className={`
        relative flex flex-col h-full bg-white shadow-xl
        ${!isAlwaysOpen ? 'w-[90%] max-w-none' : 'w-full'}
      `}>
        
        {/* Header with Menu, Backup, Restore, and Close */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">메뉴</h2>

          {/* Refresh button + Close */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-xs font-medium"
              title="새로고침"
            >
              <Icons.Refresh size={14} />
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full flex-shrink-0">
              <Icons.Close size={16} />
            </button>
          </div>
        </div>


        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50 relative">
          <div className="space-y-2">
              {documents.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">저장된 문서가 없습니다.</div>
              )}
              {documents.map(doc => (
                <div
                  key={doc.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, doc.id)}
                  onDragOver={(e) => handleDragOver(e, doc.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, doc.id)}
                  onDragEnd={handleDragEnd}
                  className={`group bg-white p-3 rounded-lg border shadow-sm transition-all relative ${
                    favoriteDocId === doc.id ? 'ring-2 ring-yellow-400' : ''
                  } ${
                    draggedDocId === doc.id ? 'opacity-40 cursor-grabbing' : 'cursor-grab hover:shadow-md'
                  } ${
                    dragOverDocId === doc.id ? 'border-blue-500 border-2 bg-blue-50' : ''
                  }`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenuId(doc.id);
                    setContextMenuPos({ x: e.clientX, y: e.clientY });
                  }}
                  onTouchStart={(e) => {
                    if (e.touches.length > 0) {
                      const touch = e.touches[0];
                      const longPressTimer = setTimeout(() => {
                        setContextMenuId(doc.id);
                        setContextMenuPos({ x: touch.clientX, y: touch.clientY });
                      }, 500);
                      (e.target as any).longPressTimer = longPressTimer;
                    }
                  }}
                  onTouchEnd={(e) => {
                    const timer = (e.target as any).longPressTimer;
                    if (timer) clearTimeout(timer);
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div
                      className="flex-none mt-0.5 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                      title="드래그하여 순서 변경"
                    >
                      <Icons.DragHandle size={18} />
                    </div>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => { onSelectDocument(doc); onClose(); }}
                    >
                      <h3 className="font-semibold text-gray-800 truncate">{doc.title || '제목 없음'}</h3>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteDocument(doc.id); }}
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
                    </div>
                  )}
                </div>
              ))}

              {/* 새문서추가 버튼 */}
              <button
                onClick={() => { onCreateNew(); onClose(); }}
                className="w-full flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-2"
              >
                <Icons.Plus size={16} className="mr-1" />
                <span className="text-xs font-medium">새문서추가</span>
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

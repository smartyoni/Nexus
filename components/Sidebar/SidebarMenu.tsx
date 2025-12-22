import React, { useState } from 'react';
import { DocumentData } from '../../types';
import { Icons } from '../ui/Icon';

interface SidebarMenuProps {
  isMobileOpen: boolean;
  isAlwaysOpen: boolean;
  onClose: () => void;
  documents: DocumentData[];
  templates: DocumentData[];
  favoriteDocId: string | null;
  onSelectDocument: (doc: DocumentData) => void;
  onPreviewTemplate: (tpl: DocumentData) => void;
  onCreateTemplate: () => void;
  onCreateNew: () => void;
  onCreateDiary: () => void;
  onDeleteDocument: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
  onEditTemplate: (tpl: DocumentData) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
  onSetFavoriteDocument: (id: string) => void;
  onClearFavoriteDocument: () => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  isMobileOpen,
  isAlwaysOpen,
  onClose,
  documents,
  templates,
  favoriteDocId,
  onSelectDocument,
  onPreviewTemplate,
  onCreateTemplate,
  onCreateNew,
  onCreateDiary,
  onDeleteDocument,
  onDeleteTemplate,
  onEditTemplate,
  onBackup,
  onRestore,
  onSetFavoriteDocument,
  onClearFavoriteDocument
}) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'diaries' | 'templates'>('docs');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isMobileOpen && !isAlwaysOpen) return null;

  // Format date helper
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

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
        ${!isAlwaysOpen ? 'w-[85%] max-w-sm' : 'w-full'}
      `}>
        
        {/* Header with Menu, Backup, Restore, and Close */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">메뉴</h2>

          {/* Backup & Restore buttons + Close */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onBackup}
              className="flex items-center justify-center px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs font-medium"
            >
              <span>백업</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-xs font-medium"
            >
              <span>복원</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onRestore(file);
                  // Reset file input
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full flex-shrink-0 ml-0.5">
              <Icons.Close size={16} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 grid grid-cols-3 gap-2 border-b">
          <button
            onClick={() => { onCreateNew(); onClose(); }}
            className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="text-xs font-medium">새문서추가</span>
          </button>
          <button
             onClick={() => { onCreateTemplate(); onClose(); }}
             className="flex items-center justify-center p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <span className="text-xs font-medium">템플릿추가</span>
          </button>
          <button
            onClick={() => { onCreateDiary(); onClose(); }}
            className="flex items-center justify-center p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <span className="text-xs font-medium">일지추가</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 p-3 text-sm font-medium ${activeTab === 'docs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('docs')}
          >
            문서목록 ({documents.filter(d => !d.isDiary).length})
          </button>
          <button
            className={`flex-1 p-3 text-sm font-medium ${activeTab === 'diaries' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('diaries')}
          >
            일지목록 ({documents.filter(d => d.isDiary).length})
          </button>
          <button
            className={`flex-1 p-3 text-sm font-medium ${activeTab === 'templates' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('templates')}
          >
            템플릿목록
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50 relative">
          {activeTab === 'docs' ? (
            <div className="space-y-2">
              {documents.filter(d => !d.isDiary).length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">저장된 문서가 없습니다.</div>
              )}
              {documents.filter(d => !d.isDiary).map(doc => (
                <div
                  key={doc.id}
                  className={`group bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all relative ${
                    favoriteDocId === doc.id ? 'ring-2 ring-yellow-400' : ''
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
                  <div className="flex justify-between items-start">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => { onSelectDocument(doc); onClose(); }}
                    >
                      <h3 className="font-semibold text-gray-800 truncate">{doc.title || '제목 없음'}</h3>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(doc.updatedAt)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteDocument(doc.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
            </div>
          ) : activeTab === 'diaries' ? (
            <div className="space-y-2">
              {documents.filter(d => d.isDiary).length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">저장된 일지가 없습니다.</div>
              )}
              {documents.filter(d => d.isDiary).map(doc => (
                <div
                  key={doc.id}
                  className={`group bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all relative ${
                    favoriteDocId === doc.id ? 'ring-2 ring-yellow-400' : ''
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
                  <div className="flex justify-between items-start">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => { onSelectDocument(doc); onClose(); }}
                    >
                      <h3 className="font-semibold text-gray-800 truncate">{doc.title || '제목 없음'}</h3>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(doc.updatedAt)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteDocument(doc.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
            </div>
          ) : (
            <div className="space-y-2">
               {templates.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">
                  등록된 템플릿이 없습니다.<br/>'템플릿 생성' 버튼을 눌러 생성하세요.
                </div>
              )}
              {templates.map(tpl => (
                <div
                  key={tpl.id}
                  className="bg-white p-3 rounded-lg border border-dashed border-gray-300 hover:border-blue-400 transition-all relative"
                >
                  {/* Main clickable area - template preview */}
                  <div
                    onClick={() => { onPreviewTemplate(tpl); onClose(); }}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icons.Copy size={16} className="text-blue-500" />
                      <span className="font-semibold text-gray-800">{tpl.title || '(제목 없음)'}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === tpl.id ? null : tpl.id);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Icons.More size={16} />
                    </button>
                  </div>

                  {/* Context Menu */}
                  {openMenuId === tpl.id && (
                    <div className="absolute right-2 top-10 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[150px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTemplate(tpl);
                          setOpenMenuId(null);
                          onClose();
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 border-b border-gray-100"
                      >
                        <Icons.Edit size={14} />
                        <span>원본 수정</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTemplate(tpl.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <Icons.Trash size={14} />
                        <span>삭제</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

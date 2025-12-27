import React, { useState } from 'react';
import { DocumentData, generateId } from '../../types';
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
  onCreateDailyNote: () => void;
  onCreateContract: () => void;
  onCreateJangeuum: () => void;
  onDeleteDocument: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
  onEditTemplate: (tpl: DocumentData) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
  onSetFavoriteDocument: (id: string) => void;
  onClearFavoriteDocument: () => void;
  onReorderDocuments: (docs: DocumentData[]) => void;
  onReorderTemplates: (tpls: DocumentData[]) => void;
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
  onCreateDailyNote,
  onCreateContract,
  onCreateJangeuum,
  onDeleteDocument,
  onDeleteTemplate,
  onEditTemplate,
  onBackup,
  onRestore,
  onSetFavoriteDocument,
  onClearFavoriteDocument,
  onReorderDocuments,
  onReorderTemplates
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'contracts' | 'jangeuums' | 'dailyNotes'>('tasks');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showTemplateList, setShowTemplateList] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Separate tasks, contracts, jangeuums, and daily notes
  const tasks = documents.filter(d => !d.isTemplate && !d.isDailyNote && !d.isContract && !d.isJangeuum);
  const contracts = documents.filter(d => !d.isTemplate && d.isContract);
  const jangeuums = documents.filter(d => !d.isTemplate && d.isJangeuum);
  const dailyNotes = documents.filter(d => !d.isTemplate && d.isDailyNote);

  if (!isMobileOpen && !isAlwaysOpen) return null;

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer!.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer!.dropEffect = 'move';
  };

  const handleDropOnDocument = (e: React.DragEvent, targetDoc: DocumentData) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedId || draggedId === targetDoc.id) {
      setDraggedId(null);
      return;
    }

    const currentList = activeTab === 'tasks' ? tasks : activeTab === 'contracts' ? contracts : activeTab === 'jangeuums' ? jangeuums : activeTab === 'dailyNotes' ? dailyNotes : templates;
    const draggedIndex = currentList.findIndex(d => d.id === draggedId);
    const targetIndex = currentList.findIndex(d => d.id === targetDoc.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    const newList = [...currentList];
    const [removed] = newList.splice(draggedIndex, 1);
    newList.splice(targetIndex, 0, removed);

    if (activeTab === 'tasks' || activeTab === 'contracts' || activeTab === 'jangeuums' || activeTab === 'dailyNotes') {
      const updatedDocs = documents.map(d => {
        const updatedItem = newList.find(item => item.id === d.id);
        return updatedItem || d;
      });

      // Create index maps for each category
      const taskIndices = new Map(newList.filter(d => !d.isDailyNote && !d.isContract && !d.isJangeuum).map((t, i) => [t.id, i]));
      const contractIndices = new Map(newList.filter(d => d.isContract).map((c, i) => [c.id, i]));
      const jangeumIndices = new Map(newList.filter(d => d.isJangeuum).map((j, i) => [j.id, i]));
      const dailyIndices = new Map(newList.filter(d => d.isDailyNote).map((d, i) => [d.id, i]));

      const sortedDocs = updatedDocs.sort((a, b) => {
        // Determine category priority: tasks -> contracts -> jangeuums -> dailyNotes
        const getCategory = (d: DocumentData) => {
          if (d.isDailyNote) return 3;
          if (d.isJangeuum) return 2;
          if (d.isContract) return 1;
          return 0; // tasks
        };

        const aCat = getCategory(a);
        const bCat = getCategory(b);
        if (aCat !== bCat) return aCat - bCat;

        // Within same category, maintain order
        if (aCat === 0) {
          return (taskIndices.get(a.id) ?? 0) - (taskIndices.get(b.id) ?? 0);
        } else if (aCat === 1) {
          return (contractIndices.get(a.id) ?? 0) - (contractIndices.get(b.id) ?? 0);
        } else if (aCat === 2) {
          return (jangeumIndices.get(a.id) ?? 0) - (jangeumIndices.get(b.id) ?? 0);
        } else {
          return (dailyIndices.get(a.id) ?? 0) - (dailyIndices.get(b.id) ?? 0);
        }
      });

      onReorderDocuments(sortedDocs);
    } else {
      onReorderTemplates(newList);
    }

    setDraggedId(null);
  };

  // 문서 카드 렌더링 헬퍼 함수
  const renderDocCard = (doc: DocumentData) => (
    <div
      key={doc.id}
      draggable
      onDragStart={(e) => handleDragStart(e, doc.id)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDropOnDocument(e, doc)}
      onDragEnd={() => setDraggedId(null)}
      className={`group bg-white p-2 rounded-lg border shadow-sm hover:shadow-md transition-all relative cursor-move ${
        favoriteDocId === doc.id ? 'ring-2 ring-yellow-400' : ''
      } ${draggedId === doc.id ? 'opacity-50' : ''}`}
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
          <h3 className="text-sm font-semibold text-gray-800 truncate">{doc.title || '제목 없음'}</h3>
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
  );

  // 템플릿 카드 렌더링 헬퍼 함수
  const renderTemplateCard = (category: 'task' | 'contract' | 'jangeeum' | 'dailyNote') => {
    const template = templates.find(t => t.templateCategory === category);

    if (!template) {
      return (
        <div className="p-3 text-center">
          <p className="text-sm text-gray-400 mb-2">템플릿이 설정되지 않았습니다</p>
          <button
            onClick={() => {
              const newTemplate: DocumentData = {
                id: generateId(),
                title: '',
                content: '',
                checklist: [],
                updatedAt: Date.now(),
                isTemplate: true,
                templateCategory: category
              };
              onEditTemplate(newTemplate);
              onClose();
            }}
            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium"
          >
            + 템플릿 생성
          </button>
        </div>
      );
    }

    return (
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div
            onClick={() => { onPreviewTemplate(template); onClose(); }}
            className="flex-1 cursor-pointer flex items-center gap-2 min-w-0"
          >
            <Icons.Copy size={16} className="text-blue-500 flex-shrink-0" />
            <span className="font-medium text-gray-800 truncate">{template.title || '(제목 없음)'}</span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditTemplate(template);
                onClose();
              }}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="원본 수정"
            >
              <Icons.Edit size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTemplate(template.id);
              }}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="삭제"
            >
              <Icons.Trash size={14} />
            </button>
          </div>
        </div>

        {/* Template Info Preview */}
        <div className="mt-2 text-xs text-gray-500">
          <p className="truncate">{template.content ? template.content.substring(0, 50) + '...' : '내용 없음'}</p>
          <p className="mt-1">체크리스트: {template.checklist.length}개</p>
        </div>
      </div>
    );
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
        ${!isAlwaysOpen ? 'w-[95%]' : 'w-full'}
      `}>
        
        {/* Header with Menu and Controls */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 gap-2">
          <h2 className="text-lg font-bold text-gray-800 flex-shrink-0">메뉴</h2>

          {/* Template, Backup & Restore buttons + Close (Right) */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setShowTemplateList(!showTemplateList)}
              className="flex items-center justify-center px-2.5 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium"
              title="템플릿"
            >
              <span>템플릿({templates.length})</span>
            </button>
            <button
              onClick={onBackup}
              className="flex items-center justify-center px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs font-medium"
              title="백업"
            >
              <span>백업</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-xs font-medium"
              title="복원"
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
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full flex-shrink-0">
              <Icons.Close size={16} />
            </button>
          </div>
        </div>

        {/* Template List Panel - Collapsed by default */}
        {showTemplateList && (
          <div className="bg-white border-b p-2 space-y-2">
            {templates.length === 0 ? (
              <div className="text-center py-3 space-y-2">
                <p className="text-sm text-gray-400">등록된 템플릿이 없습니다</p>
                <button
                  onClick={() => { onCreateTemplate(); onClose(); }}
                  className="w-full px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium"
                >
                  + 새 템플릿 추가
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map(template => (
                  <div key={template.id} className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="flex-1 cursor-pointer flex items-center gap-2 min-w-0"
                        onClick={() => { onPreviewTemplate(template); onClose(); }}
                      >
                        <Icons.Copy size={14} className="text-green-600 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-800 truncate">{template.title || '(제목 없음)'}</span>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTemplate(template);
                            onClose();
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="편집"
                        >
                          <Icons.Edit size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTemplate(template.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="삭제"
                        >
                          <Icons.Trash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => { onCreateTemplate(); onClose(); }}
                  className="w-full px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium"
                >
                  + 새 템플릿 추가
                </button>
              </div>
            )}
          </div>
        )}


        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          <button
            className={`flex-1 min-w-max px-2 py-3 text-xs font-medium ${activeTab === 'tasks' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('tasks')}
          >
            업무({tasks.length})
          </button>
          <button
            className={`flex-1 min-w-max px-2 py-3 text-xs font-medium ${activeTab === 'contracts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('contracts')}
          >
            계약({contracts.length})
          </button>
          <button
            className={`flex-1 min-w-max px-2 py-3 text-xs font-medium ${activeTab === 'jangeuums' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('jangeuums')}
          >
            잔금({jangeuums.length})
          </button>
          <button
            className={`flex-1 min-w-max px-2 py-3 text-xs font-medium ${activeTab === 'dailyNotes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('dailyNotes')}
          >
            일상({dailyNotes.length})
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50 relative">
          {activeTab === 'tasks' ? (
            <div className="space-y-2 flex flex-col h-full" onDragOver={handleDragOver} onDrop={(e) => {e.preventDefault(); e.stopPropagation();}}>
              <div className="flex-1">
                {tasks.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-sm">저장된 업무가 없습니다.</div>
                )}
                {tasks.map(doc => renderDocCard(doc))}
              </div>
              <button
                onClick={() => { onCreateNew(); onClose(); }}
                className="mt-2 w-full flex items-center justify-center px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                title="새업무"
              >
                <span>+ 새업무</span>
              </button>
            </div>
          ) : activeTab === 'contracts' ? (
            <div className="space-y-2 flex flex-col h-full" onDragOver={handleDragOver} onDrop={(e) => {e.preventDefault(); e.stopPropagation();}}>
              <div className="flex-1">
                {contracts.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-sm">저장된 계약이 없습니다.</div>
                )}
                {contracts.map(doc => renderDocCard(doc))}
              </div>
              <button
                onClick={() => { onCreateContract(); onClose(); }}
                className="mt-2 w-full flex items-center justify-center px-2 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-xs font-medium"
                title="새계약"
              >
                <span>+ 새계약</span>
              </button>
            </div>
          ) : activeTab === 'jangeuums' ? (
            <div className="space-y-2 flex flex-col h-full" onDragOver={handleDragOver} onDrop={(e) => {e.preventDefault(); e.stopPropagation();}}>
              <div className="flex-1">
                {jangeuums.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-sm">저장된 잔금이 없습니다.</div>
                )}
                {jangeuums.map(doc => renderDocCard(doc))}
              </div>
              <button
                onClick={() => { onCreateJangeuum(); onClose(); }}
                className="mt-2 w-full flex items-center justify-center px-2 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium"
                title="새잔금"
              >
                <span>+ 새잔금</span>
              </button>
            </div>
          ) : activeTab === 'dailyNotes' ? (
            <div className="space-y-2 flex flex-col h-full" onDragOver={handleDragOver} onDrop={(e) => {e.preventDefault(); e.stopPropagation();}}>
              <div className="flex-1">
                {dailyNotes.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-sm">저장된 일상이 없습니다.</div>
                )}
                {dailyNotes.map(doc => renderDocCard(doc))}
              </div>
              <button
                onClick={() => { onCreateDailyNote(); onClose(); }}
                className="mt-2 w-full flex items-center justify-center px-2 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs font-medium"
                title="새일상"
              >
                <span>+ 새일상</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

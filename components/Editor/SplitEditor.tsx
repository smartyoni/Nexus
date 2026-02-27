import React, { useEffect, useState } from 'react';
import { DocumentData } from '../../types';
import { TextEditor } from './TextEditor';
import { Icons } from '../ui/Icon';

interface SplitEditorProps {
  data: DocumentData | null;
  onSave: (data: DocumentData) => void;
  onCancel?: () => void;
  screenWidth: number;
  mdBreakpoint: number;
  onMoveItem?: (itemId: string, targetDocId: string) => void;
  availableDocuments?: DocumentData[];
  isSaving?: boolean;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onContentChange?: (content: string) => void;
  onDelete?: () => void;
  onRefresh?: () => void;
  onGoBack?: () => void;
}

export const SplitEditor: React.FC<SplitEditorProps> = ({
  data,
  onSave,
  isSaving = false,
  isEditing,
  setIsEditing,
  onContentChange,
  onDelete,
  onRefresh,
  onGoBack
}) => {
  // Handle null data gracefully
  if (!data) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex-1 flex items-center justify-center text-gray-400">
          문서를 불러오는 중입니다...
        </div>
      </div>
    );
  }
  const [content, setContent] = useState(data.content || '');
  const [title, setTitle] = useState(data.title || '');
  const [isTitleEditing, setIsTitleEditing] = useState(false);

  // Sync local state when prop data changes (switching documents)
  useEffect(() => {
    setContent(data.content || '');
    setTitle(data.title || '');
  }, [data]);

  // Exit title edit mode when switching documents
  useEffect(() => {
    setIsTitleEditing(false);
  }, [data?.id]);

  // Auto-enter edit mode for empty new documents
  useEffect(() => {
    if (data && !data.content && !data.title && data.checklist.length === 0) {
      setIsEditing(true);
    }
  }, [data?.id, setIsEditing]);

  const handleSave = () => {
    onSave({
      ...data,
      content,
      title,
      updatedAt: Date.now()
    });
  };

  // Handle content change - propagate to App
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onContentChange?.(newContent);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Propagate title change to App so navigation guard sees the latest
    onSave({
      ...data,
      title: newTitle,
      content, // Use current local content
      updatedAt: Date.now()
    });
  };

  const handleTitleBlur = () => {
    if (isTitleEditing) {
      handleTitleChange(title);
      setIsTitleEditing(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setTitle(data.title || '');
      setIsTitleEditing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Bar for Editor - Compact for Sidebar */}
      <div className="flex items-center justify-between px-3 py-2 border-b shadow-sm z-10 bg-blue-600 flex-none h-16">
        <div className="flex-1 min-w-0 mr-2">
          {isEditing || isTitleEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              placeholder="제목 (Untitled)"
              className="w-full bg-transparent text-white font-bold text-lg border-none focus:outline-none placeholder:text-blue-100/50"
              autoFocus={isTitleEditing || (!data.content && !data.title)}
            />
          ) : (
            <h1
              onDoubleClick={() => setIsTitleEditing(true)}
              className="text-lg font-bold text-white truncate cursor-pointer hover:bg-blue-700/50 px-1 transition-colors"
              title="더블클릭하여 제목 수정"
            >
              {title || '제목없음'}
            </h1>
          )}
        </div>

        <button
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          className={`
            px-4 py-1.5 ml-1 rounded-none transition-all flex items-center gap-1.5 flex-shrink-0 text-sm font-bold shadow-sm
            ${isEditing
              ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse-subtle'
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }
          `}
          title={isEditing ? '저장 및 편집 종료' : '문서 수정'}
        >
          {isEditing ? (
            <>
              <Icons.Save size={16} />
              저장
            </>
          ) : (
            <>
              <Icons.Edit size={16} />
              수정
            </>
          )}
        </button>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="p-1.5 ml-1 rounded-none bg-red-500 hover:bg-red-600 text-white transition-colors flex-shrink-0"
          title="문서 삭제"
        >
          <Icons.Trash size={18} />
        </button>

        {/* Saving Indicator */}
        {isSaving && (
          <div className="ml-1 px-2 py-1.5 rounded-none bg-green-50 flex items-center gap-1 flex-shrink-0 text-green-600 text-xs animate-pulse">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-none"></div>
            저장 중
          </div>
        )}

        {/* List Button (Back) */}
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="px-4 py-1.5 ml-1 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 flex-shrink-0 text-sm font-bold shadow-sm"
            title="문서 리스트로 돌아가기"
          >
            <Icons.List size={16} />
            리스트
          </button>
        )}
      </div>

      {/* Text Editor Area - Full Height */}
      <div className="flex-1 overflow-hidden">
        <TextEditor
          content={content}
          onChange={handleContentChange}
          isEditing={isEditing}
          onEditingChange={setIsEditing}
        />
      </div>

      {/* Footer */}
      <div className="bg-blue-600 text-white py-3 px-4 text-center text-sm font-medium flex-none">
        © {new Date().getFullYear()} 인사이트부동산 - 메모 상세
      </div>
    </div>
  );
};
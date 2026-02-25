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
  isSaving?: boolean; // Indicate if document is being auto-saved
  onContentChange?: (content: string) => void; // Propagate content changes to App
  onRefresh?: () => void; // Refresh data without page reload
  onGoBack?: () => void; // Go back to document list
}

export const SplitEditor: React.FC<SplitEditorProps> = ({
  data,
  onSave,
  isSaving = false,
  onContentChange,
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
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isTitleEditing, setIsTitleEditing] = useState(false);

  // Sync local state when prop data changes (switching documents)
  useEffect(() => {
    setContent(data.content || '');
    setTitle(data.title || '');
  }, [data]);

  // Exit edit mode when switching documents
  useEffect(() => {
    setIsEditing(false);
  }, [data?.id]);

  // Auto-enter edit mode for empty new documents
  useEffect(() => {
    if (data && !data.content && !data.title && data.checklist.length === 0) {
      setIsEditing(true);
    }
  }, [data?.id]);

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

  const handleTitleBlur = () => {
    if (isTitleEditing) {
      handleSave();
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
          onClick={() => setIsEditing(!isEditing)}
          className={`
            px-3 py-1.5 ml-1 rounded-none transition-colors flex items-center gap-1 flex-shrink-0 text-sm font-medium
            ${isEditing
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }
          `}
          title={isEditing ? '편집 완료' : '문서 수정'}
        >
          {isEditing ? (
            <>
              <Icons.Check size={16} />
              완료
            </>
          ) : (
            <>
              <Icons.Edit size={16} />
              수정
            </>
          )}
        </button>

        {/* Saving Indicator */}
        {isSaving && (
          <div className="ml-1 px-2 py-1.5 rounded-none bg-green-50 flex items-center gap-1 flex-shrink-0 text-green-600 text-xs animate-pulse">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-none"></div>
            저장 중
          </div>
        )}

        {/* Back Button */}
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="p-1.5 ml-1 rounded-none transition-colors flex-shrink-0 text-white hover:bg-blue-700"
            title="문서 리스트로 돌아가기"
          >
            <Icons.Back size={18} />
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
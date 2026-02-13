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

  // Auto-extract title from first line of content
  useEffect(() => {
    const firstLine = content.split('\n')[0] || '';
    setTitle(firstLine.slice(0, 20) || '무제 (Untitled)');
  }, [content]);

  // Update local state when prop data changes (switching documents)
  useEffect(() => {
    setContent(data.content || '');
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

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Bar for Editor - Compact for Sidebar */}
      <div className="flex items-center justify-between px-3 py-2 border-b shadow-sm z-10 bg-white flex-none h-12">
        <h1 className="text-base font-bold text-gray-800 truncate flex-1">{title}</h1>

        {/* Edit/Complete Button */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`
            px-3 py-1.5 ml-1 rounded-md transition-colors flex items-center gap-1 flex-shrink-0 text-sm font-medium
            ${isEditing
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
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
          <div className="ml-1 px-2 py-1.5 rounded-md bg-green-50 flex items-center gap-1 flex-shrink-0 text-green-600 text-xs animate-pulse">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            저장 중
          </div>
        )}

        {/* Back Button */}
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="p-1.5 ml-1 rounded-md transition-colors flex-shrink-0 text-gray-600 hover:bg-gray-100"
            title="문서 리스트로 돌아가기"
          >
            <Icons.Back size={18} />
          </button>
        )}
      </div>

      {/* Text Editor Area - Full Height */}
      <TextEditor
        content={content}
        onChange={handleContentChange}
        isEditing={isEditing}
        onEditingChange={setIsEditing}
      />
    </div>
  );
};
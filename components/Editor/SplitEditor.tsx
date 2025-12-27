import React, { useEffect, useState } from 'react';
import { ChecklistItem, DocumentData } from '../../types';
import { ChecklistManager } from '../Checklist/ChecklistManager';
import { Icons } from '../ui/Icon';
import { PreviewModal } from '../ui/PreviewModal';

interface SplitEditorProps {
  data: DocumentData;
  onSave: (data: DocumentData) => void;
  isTemplateMode?: boolean; // Changes labels slightly if managing a template
  isTemplatePreview?: boolean; // Indicate template preview mode (save as new document)
  sourceTemplateName?: string; // Name of the source template for display
  onCancel?: () => void; // For template manager back button
  onOpenSidebar?: () => void; // Function to open the sidebar menu
  screenWidth: number;
  mdBreakpoint: number;
}

export const SplitEditor: React.FC<SplitEditorProps> = ({
  data,
  onSave,
  isTemplateMode = false,
  isTemplatePreview = false,
  sourceTemplateName,
  onCancel,
  onOpenSidebar,
  screenWidth,
  mdBreakpoint
}) => {
  const [title, setTitle] = useState(data.title);
  const [content, setContent] = useState(data.content);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(data.checklist);
  const [isPreview, setIsPreview] = useState(false);
  const [templateCategory, setTemplateCategory] = useState<'task' | 'contract' | 'jangeuum' | 'dailyNote'>(
    data.templateCategory || 'task'
  );

  // Update local state when prop data changes (switching documents)
  useEffect(() => {
    setTitle(data.title);
    setContent(data.content);
    setChecklist(data.checklist);
    setTemplateCategory(data.templateCategory || 'task');
  }, [data.id]);

  // Auto-save with debounce when title, content, or checklist changes
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only save if there are actual changes
      if (title !== data.title || content !== data.content || JSON.stringify(checklist) !== JSON.stringify(data.checklist) || templateCategory !== data.templateCategory) {
        onSave({
          ...data,
          title,
          content,
          checklist,
          templateCategory: isTemplateMode ? templateCategory : data.templateCategory,
          updatedAt: Date.now()
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content, checklist, templateCategory, data, onSave, isTemplateMode]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Template Category Selector - Only in Template Mode */}
      {isTemplateMode && (
        <div className="px-3 py-2 bg-blue-50 border-b border-blue-200 flex-none">
          <label className="block text-xs font-medium text-gray-700 mb-1">생성될 문서 카테고리</label>
          <select
            value={templateCategory}
            onChange={(e) => setTemplateCategory(e.target.value as any)}
            className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="task">업무</option>
            <option value="contract">계약</option>
            <option value="jangeuum">잔금</option>
            <option value="dailyNote">일상</option>
          </select>
        </div>
      )}

      {/* Top Bar for Editor - Compact for Sidebar */}
      <div className="flex items-center justify-between px-3 py-2 border-b shadow-sm z-10 bg-white flex-none h-12">
        <div className="flex items-center gap-2 flex-1 mr-2 min-w-0">
          
          {/* Left Navigation Button: Back (for templates) or Menu (for docs) */}
          {isTemplateMode && onCancel ? (
            <button onClick={onCancel} className="mr-1 p-1 hover:bg-gray-100 rounded text-gray-600 flex-shrink-0">
              <Icons.Back size={18} />
            </button>
          ) : (
            screenWidth < mdBreakpoint && onOpenSidebar && ( // Only show on small screens
              <button 
                onClick={onOpenSidebar}
                className="mr-1 p-1 hover:bg-gray-100 rounded text-gray-700 flex-shrink-0"
              >
                <Icons.Menu size={18} />
              </button>
            )
          )}

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isTemplateMode ? "템플릿 제목" : "제목 (선택사항)"}
            className="text-base font-bold text-gray-800 placeholder-gray-300 outline-none bg-transparent w-full truncate leading-tight"
          />
        </div>
        <button
          onClick={() => setIsPreview(true)}
          className="p-1.5 ml-1 rounded-md transition-colors flex-shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200"
          title="미리보기"
        >
          <Icons.Eye size={18} />
        </button>
        <button
          onClick={() => window.location.reload()}
          className="p-1.5 ml-1 rounded-md transition-colors flex-shrink-0 text-gray-600 hover:bg-gray-100"
          title="새로고침"
        >
          <Icons.Refresh size={18} />
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 ml-1 rounded-md transition-colors flex-shrink-0 text-gray-600 hover:bg-gray-100"
            title="뒤로가기"
          >
            <Icons.Back size={18} />
          </button>
        )}
      </div>

      {/* Split Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOP HALF: Text Content */}
        <div className="flex-1 flex flex-col border-b border-gray-200 relative group min-h-0 basis-1/3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isTemplateMode ? "템플릿 텍스트 입력..." : "여기에 내용을 입력하세요..."}
            className="flex-1 w-full p-3 resize-none outline-none text-gray-700 leading-relaxed text-sm"
          />
        </div>

        {/* BOTTOM HALF: Checklist */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 min-h-0 basis-2/3">
          <ChecklistManager
            items={checklist}
            onChange={(items) => setChecklist(items)}
          />
        </div>

      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreview}
        title={title}
        content={content}
        onClose={() => setIsPreview(false)}
        onSave={(newTitle, newContent) => {
          setTitle(newTitle);
          setContent(newContent);
        }}
      />
    </div>
  );
};
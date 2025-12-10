import React, { useEffect, useState } from 'react';
import { ChecklistItem, DocumentData } from '../../types';
import { ChecklistManager } from '../Checklist/ChecklistManager';
import { Icons } from '../ui/Icon';

interface SplitEditorProps {
  data: DocumentData;
  onSave: (data: DocumentData) => void;
  isTemplateMode?: boolean; // Changes labels slightly if managing a template
  isTemplatePreview?: boolean; // Indicate template preview mode (save as new document)
  sourceTemplateName?: string; // Name of the source template for display
  onCancel?: () => void; // For template manager back button
  onOpenSidebar?: () => void; // Function to open the sidebar menu
}

export const SplitEditor: React.FC<SplitEditorProps> = ({
  data,
  onSave,
  isTemplateMode = false,
  isTemplatePreview = false,
  sourceTemplateName,
  onCancel,
  onOpenSidebar
}) => {
  const [title, setTitle] = useState(data.title);
  const [content, setContent] = useState(data.content);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(data.checklist);
  const [isDirty, setIsDirty] = useState(false);

  // Update local state when prop data changes (switching documents)
  useEffect(() => {
    setTitle(data.title);
    setContent(data.content);
    setChecklist(data.checklist);
    setIsDirty(false);
  }, [data.id]);

  const handleSave = () => {
    onSave({
      ...data,
      title,
      content,
      checklist,
      updatedAt: Date.now()
    });
    setIsDirty(false);
  };

  // Helper to detect changes
  const markDirty = () => setIsDirty(true);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Bar for Editor - Compact for Sidebar */}
      <div className="flex items-center justify-between px-3 py-2 border-b shadow-sm z-10 bg-white flex-none h-12">
        <div className="flex items-center gap-2 flex-1 mr-2 min-w-0">
          
          {/* Left Navigation Button: Back (for templates) or Menu (for docs) */}
          {isTemplateMode && onCancel ? (
            <button onClick={onCancel} className="mr-1 p-1 hover:bg-gray-100 rounded text-gray-600 flex-shrink-0">
              <Icons.Back size={18} />
            </button>
          ) : (
            onOpenSidebar && (
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
            onChange={(e) => { setTitle(e.target.value); markDirty(); }}
            placeholder={isTemplateMode ? "템플릿 제목" : "제목 (선택사항)"}
            className="text-base font-bold text-gray-800 placeholder-gray-300 outline-none bg-transparent w-full truncate leading-tight"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${isDirty ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          title="저장"
        >
          <Icons.Save size={18} />
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
        <div className="flex-1 flex flex-col border-b border-gray-200 relative group min-h-0 basis-1/2">
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); markDirty(); }}
            placeholder={isTemplateMode ? "템플릿 텍스트 입력..." : "여기에 내용을 입력하세요..."}
            className="flex-1 w-full p-3 resize-none outline-none text-gray-700 leading-relaxed text-sm"
          />
        </div>

        {/* BOTTOM HALF: Checklist */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 min-h-0 basis-1/2">
          <ChecklistManager 
            items={checklist} 
            onChange={(items) => { setChecklist(items); markDirty(); }} 
          />
        </div>

      </div>
    </div>
  );
};
import React, { useEffect, useRef, useState } from 'react';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ content, onChange, isEditing, onEditingChange }) => {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const lastSavedContentRef = useRef(content);

  // Update ref when content prop changes (e.g., when switching documents)
  useEffect(() => {
    lastSavedContentRef.current = content;
    if (contentEditableRef.current) {
      contentEditableRef.current.innerText = content;
    }
  }, [content, isEditing]);

  // Auto-focus and set cursor to end when entering edit mode
  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      contentEditableRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      if (sel) {
        range.selectNodeContents(contentEditableRef.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [isEditing]);

  // Handle blur - sync changes to parent but don't exit edit mode
  const handleBlur = () => {
    if (!contentEditableRef.current) return;

    const text = contentEditableRef.current.innerText || '';

    // Only update parent if content changed
    if (text !== lastSavedContentRef.current) {
      onChange(text);
      lastSavedContentRef.current = text;
    }
  };

  // Handle paste to ensure plain text only
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent rich text formatting (Ctrl+B, Ctrl+I, Ctrl+U, etc.)
    if (e.ctrlKey || e.metaKey) {
      const formattingKeys = ['b', 'i', 'u'];
      if (formattingKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    }
  };

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  // Handle right click
  const handleContextMenu = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div
      className="flex-1 overflow-y-auto overflow-x-hidden bg-white p-4 relative"
      onContextMenu={handleContextMenu}
    >
      {isEditing ? (
        <div
          ref={contentEditableRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          className="outline-none min-h-full whitespace-pre-wrap break-words text-gray-800 text-base leading-relaxed font-sans"
          style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
        />
      ) : (
        <pre
          className="whitespace-pre-wrap text-gray-800 text-base leading-relaxed font-sans break-words rounded-none"
          style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
        >
          {content || '문서 내용이 비어 있습니다.'}
        </pre>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[100] bg-white border border-gray-200 shadow-xl py-1 min-w-[180px] rounded-md overflow-hidden ring-1 ring-black ring-opacity-5"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-600 hover:text-white transition-all duration-200 flex items-center gap-3 font-medium group"
            onClick={(e) => {
              e.stopPropagation();
              onEditingChange(true);
              setContextMenu(null);
            }}
          >
            <span className="text-blue-500 group-hover:text-white transform group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </span>
            수정하시겠습니까?
          </button>
        </div>
      )}
    </div>
  );
};

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

  // Handle blur - save changes when exiting edit mode
  const handleBlur = () => {
    if (!contentEditableRef.current) return;

    const text = contentEditableRef.current.innerText || '';

    // Only save if content changed
    if (text !== lastSavedContentRef.current) {
      onChange(text);
      lastSavedContentRef.current = text;
    }

    // Exit edit mode when losing focus
    onEditingChange(false);
  };

  // Handle paste to ensure plain text only
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // ESC key to exit edit mode
    if (e.key === 'Escape') {
      e.preventDefault();
      onEditingChange(false);
      return;
    }

    // Prevent rich text formatting (Ctrl+B, Ctrl+I, Ctrl+U, etc.)
    if (e.ctrlKey || e.metaKey) {
      const formattingKeys = ['b', 'i', 'u'];
      if (formattingKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white p-4">
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
          onDoubleClick={() => onEditingChange(true)}
          className="whitespace-pre-wrap text-gray-800 text-base leading-relaxed font-sans break-words cursor-text hover:bg-blue-50/30 transition-colors rounded p-2 -m-2"
          style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
        >
          {content || '더블클릭으로 편집을 시작하세요...'}
        </pre>
      )}
    </div>
  );
};

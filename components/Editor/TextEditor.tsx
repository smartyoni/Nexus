import React, { useEffect, useRef, useState } from 'react';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ content, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const lastSavedContentRef = useRef(content);

  // Update ref when content prop changes (e.g., when switching documents)
  useEffect(() => {
    lastSavedContentRef.current = content;
    if (contentEditableRef.current) {
      contentEditableRef.current.textContent = content;
    }
  }, [content]);

  // Handle blur - save changes
  const handleBlur = () => {
    if (!contentEditableRef.current) return;

    const text = contentEditableRef.current.textContent || '';

    // Only save if content changed
    if (text !== lastSavedContentRef.current) {
      onChange(text);
      lastSavedContentRef.current = text;
    }

    setIsEditing(false);
  };

  // Handle double-click to enter edit mode
  const handleDoubleClick = () => {
    setIsEditing(true);
    // Focus and set cursor to end
    setTimeout(() => {
      if (contentEditableRef.current) {
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
    }, 0);
  };

  // Handle paste to ensure plain text only
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Prevent HTML tags from being pasted or inserted
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow standard text editing keys
    if (e.ctrlKey || e.metaKey) {
      // Allow Ctrl+A, Ctrl+C, Ctrl+X, Ctrl+Z, Ctrl+Y, etc.
      const allowedKeys = ['a', 'c', 'x', 'z', 'y'];
      if (!allowedKeys.includes(e.key.toLowerCase())) {
        return;
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
          onDoubleClick={handleDoubleClick}
          className="whitespace-pre-wrap cursor-text text-gray-800 text-base leading-relaxed font-sans break-words"
          style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
        >
          {content || '더블클릭하여 입력 시작...'}
        </pre>
      )}
    </div>
  );
};

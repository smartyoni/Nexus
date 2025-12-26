import React, { useState, useEffect } from 'react';
import { Icons } from './Icon';

interface PreviewModalProps {
  isOpen: boolean;
  title: string;
  content: string;
  onClose: () => void;
  onSave: (title: string, content: string) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  title: initialTitle,
  content: initialContent,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setContent(initialContent);
      setEditingTitle(false);
      setEditingContent(false);
    }
  }, [isOpen, initialTitle, initialContent]);

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (title !== initialTitle || content !== initialContent) {
      onSave(title, content);
    }
  };

  const handleContentBlur = () => {
    setEditingContent(false);
    if (title !== initialTitle || content !== initialContent) {
      onSave(title, content);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingTitle(false);
      if (title !== initialTitle || content !== initialContent) {
        onSave(title, content);
      }
    } else if (e.key === 'Escape') {
      setTitle(initialTitle);
      setEditingTitle(false);
    }
  };

  const handleContentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setContent(initialContent);
      setEditingContent(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full mx-4 max-h-[90vh] h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">미리보기</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Icons.Close size={20} />
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-4 flex flex-col"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* Title */}
          <div className="mb-4 flex-shrink-0">
            {editingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="제목"
                className="w-full text-xl font-bold text-gray-800 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <h3
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingTitle(true);
                }}
                className="text-xl font-bold text-gray-800 cursor-text hover:bg-gray-100 p-2 rounded-md transition-colors"
              >
                {title || <span className="text-gray-400">제목을 입력하세요</span>}
              </h3>
            )}
          </div>

          {/* Text Content */}
          {editingContent ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleContentBlur}
              onKeyDown={handleContentKeyDown}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="내용을 입력하세요... (Esc로 취소)"
              className="flex-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              autoFocus
            />
          ) : (
            <>
              {content ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingContent(true);
                  }}
                  onMouseDown={(e) => {
                    if (e.detail > 1) {
                      e.preventDefault();
                    }
                  }}
                  className="flex-1 overflow-y-auto text-gray-700 leading-relaxed whitespace-pre-wrap break-words text-sm cursor-text hover:bg-gray-100 p-2 rounded-md transition-colors"
                >
                  {content}
                </div>
              ) : (
                <div
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingContent(true);
                  }}
                  className="flex-1 overflow-y-auto flex flex-col items-center justify-center text-center text-gray-400 cursor-text hover:bg-gray-100 p-2 rounded-md transition-colors select-none"
                >
                  <Icons.File size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">더블클릭하여 내용을 입력하세요</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

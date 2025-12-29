import React, { useEffect } from 'react';
import { DocumentData } from '../../types';
import { Icons } from './Icon';

interface TemplateSelectModalProps {
  isOpen: boolean;
  categoryId: string;
  categoryName: string;
  templates: DocumentData[];  // 필터링된 템플릿
  onSelect: (template: DocumentData | null) => void;  // null = 빈 문서
  onClose: () => void;
}

export const TemplateSelectModal: React.FC<TemplateSelectModalProps> = ({
  isOpen,
  categoryId,
  categoryName,
  templates,
  onSelect,
  onClose
}) => {
  // Escape 키 지원
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">새 문서 만들기</h2>
              <p className="text-sm text-gray-600 mt-1">{categoryName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icons.Close size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Blank Document Option */}
            <button
              onClick={() => {
                onSelect(null);
              }}
              className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">📄</div>
                <div>
                  <h3 className="font-semibold text-gray-800">빈 문서</h3>
                  <p className="text-sm text-gray-600 mt-1">새 빈 문서로 시작</p>
                </div>
              </div>
            </button>

            {/* Templates Section */}
            {templates.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">템플릿에서 시작:</p>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        onSelect(template);
                      }}
                      className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">📋</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate">
                            {template.title || '(제목 없음)'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {template.checklist.length > 0
                              ? `${template.checklist.length}개 체크리스트`
                              : '체크리스트 없음'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  이 카테고리에 사용 가능한 템플릿이 없습니다.
                </p>
              </div>
            )}
          </div>

          {/* Footer (optional) */}
          <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

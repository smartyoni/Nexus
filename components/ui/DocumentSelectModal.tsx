import React from 'react';
import { DocumentData } from '../../types';
import { Icons } from './Icon';

interface DocumentSelectModalProps {
  isOpen: boolean;
  documents: DocumentData[];
  currentDocId: string;
  onSelect: (targetDocId: string) => void;
  onClose: () => void;
}

export const DocumentSelectModal: React.FC<DocumentSelectModalProps> = ({
  isOpen,
  documents,
  currentDocId,
  onSelect,
  onClose
}) => {
  // Filter documents: exclude current document
  const availableDocuments = documents.filter(
    d => d.id !== currentDocId
  );

  const handleSelectDocument = (docId: string) => {
    onSelect(docId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 bg-purple-100">
          <h2 className="text-lg font-semibold text-gray-800">항목 이동</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Icons.Close size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto min-h-0">
          {availableDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Icons.File size={28} className="mb-2 opacity-30" />
              <span className="text-sm">이동 가능한 문서 없음</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">이동할 문서를 선택하세요:</p>
              {availableDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleSelectDocument(doc.id)}
                  className="w-full text-left p-3 rounded-lg border border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all"
                >
                  <div className="flex items-start gap-2">
                    <Icons.File size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{doc.title || '무제'}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {doc.checklist.length}개 항목
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

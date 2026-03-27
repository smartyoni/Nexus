import React, { useEffect, useState, useRef } from 'react';
import { DocumentData } from '../../types';
import { LegalPadEditor } from './LegalPadEditor';

interface SplitEditorProps {
    data: DocumentData;
    currentPageIndex: number;
    onSave: (data: DocumentData) => void;
    isSaving?: boolean;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    onContentChange?: (content: string) => void;
    onAddPage: () => void;
    onRemovePage: (index: number) => void;
    onSwitchPage: (index: number) => void;
    onPageTitleChange?: (title: string) => void;
    onDeleteDocument?: (id: string) => void;
}

/**
 * 문서 에디터 컴포넌트 (영역 최대화 버전)
 */
export const SplitEditor: React.FC<SplitEditorProps> = ({
    data,
    currentPageIndex,
    onSave,
    isSaving = false,
    isEditing,
    setIsEditing,
    onContentChange,
    onAddPage,
    onRemovePage,
    onSwitchPage,
    onPageTitleChange,
    onDeleteDocument,
}) => {
    const [content, setContent] = useState('');
    const latestContentRef = useRef(data.content || '');
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    useEffect(() => {
        const currentContent = data.pages?.[currentPageIndex] || '';
        setContent(currentContent);
        latestContentRef.current = currentContent;
    }, [data.id, currentPageIndex, data.pages]);


    const handleContentChange = (newContent: string) => {
        setContent(newContent);
        latestContentRef.current = newContent;
        onContentChange?.(newContent);
    };

    const handleReset = () => {
        const resetContent = '';
        setContent(resetContent);
        onContentChange?.(resetContent);
        onSave({ ...data, content: resetContent, updatedAt: Date.now() });
        setIsResetModalOpen(false);
    };

    const handleSave = () => {
        const updatedPages = [...(data.pages || [])];
        if (updatedPages.length > 0) {
            updatedPages[currentPageIndex] = content;
        } else {
            updatedPages[0] = content;
        }
        
        onSave({
            ...data,
            pages: updatedPages,
            content: updatedPages.join('\n'), // 기존 호환성 유지
            updatedAt: Date.now()
        });
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-50 relative">
            {/* Modal Layer for Reset Confirm */}
            {isResetModalOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl border border-slate-100 animate-slide-up">
                        <h3 className="text-base font-black text-slate-800 mb-2">초기화 하시겠습니까?</h3>
                        <p className="text-xs font-bold text-slate-400 mb-6 leading-relaxed">
                            현재 페이지의 모든 내용이 삭제되며 복구할 수 없습니다. 계속하시겠습니까?
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsResetModalOpen(false)}
                                className="flex-1 py-3 px-4 rounded-xl text-xs font-black text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                            >
                                아니오
                            </button>
                            <button 
                                onClick={handleReset}
                                className="flex-1 py-3 px-4 rounded-xl text-xs font-black text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all"
                            >
                                네, 삭제합니다
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Left/Main Content Section */}
            <div className="flex-1 overflow-hidden z-10">
                <LegalPadEditor
                    data={data}
                    currentPageIndex={currentPageIndex}
                    onContentChange={handleContentChange}
                    onAddPage={onAddPage}
                    onRemovePage={onRemovePage}
                    onSwitchPage={onSwitchPage}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    onSave={handleSave}
                    isSaving={isSaving}
                    onTitleChange={(title) => onSave({ ...data, title, updatedAt: Date.now() })}
                    onPageTitleChange={onPageTitleChange}
                    onDeleteDocument={onDeleteDocument}
                />
            </div>

            {/* Floating UI Elements if any... */}
        </div>
    );
};

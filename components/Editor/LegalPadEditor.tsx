import React, { useRef, useEffect, useState } from 'react';
import { DocumentData } from '../../types';
import { Icons } from '../ui/Icon';
import { ChevronLeft, ChevronRight, Pin, Plus, Eye, Edit3, Bold, Italic, Type, List as ListIcon, Quote } from 'lucide-react';
import { MarkdownPreview } from './MarkdownPreview';
import { DeleteConfirmPopover } from '../ui/DeleteConfirmPopover';

interface LegalPadEditorProps {
    data: DocumentData;
    currentPageIndex: number;
    onContentChange: (content: string) => void;
    onAddPage: () => void;
    onRemovePage: (index: number) => void;
    onSwitchPage: (index: number) => void;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    onSave: () => void;
    isSaving: boolean;
    onTitleChange?: (title: string) => void;
    onPageTitleChange?: (title: string) => void;
    onDeleteDocument?: (id: string) => void;
}

export const LegalPadEditor: React.FC<LegalPadEditorProps> = ({
    data,
    currentPageIndex,
    onContentChange,
    onAddPage,
    onRemovePage,
    onSwitchPage,
    isEditing,
    setIsEditing,
    onSave,
    isSaving,
    onTitleChange,
    onPageTitleChange,
    onDeleteDocument
}) => {
    const [isEditingPageTitle, setIsEditingPageTitle] = React.useState(false);
    const [tempPageTitle, setTempPageTitle] = React.useState('');
    const [isDeletingDoc, setIsDeletingDoc] = React.useState(false);
    const [isDeletingPageIndex, setIsDeletingPageIndex] = React.useState<number | null>(null);
    const [showSavedToast, setShowSavedToast] = React.useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const totalPages = data.pages?.length || 1;
    const currentContent = data.pages?.[currentPageIndex] || '';
    const currentPageTitle = data.pageTitles?.[currentPageIndex] || `대항목 ${currentPageIndex + 1}`;

    useEffect(() => {
        setTempPageTitle(data.pageTitles?.[currentPageIndex] || '');
    }, [currentPageIndex, data.pageTitles]);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerText !== currentContent) {
            editorRef.current.innerText = currentContent;
        }
    }, [currentContent, currentPageIndex]);

    const handleInput = () => {
        if (editorRef.current) {
            onContentChange(editorRef.current.innerText);
        }
    };

    const insertMarkdown = (syntax: string, type: 'wrap' | 'prefix' = 'prefix') => {
        if (editorRef.current) {
            if (type === 'prefix') {
                document.execCommand('insertText', false, syntax + ' ');
            } else {
                document.execCommand('insertText', false, syntax + '텍스트' + syntax);
            }
            handleInput();
        }
    };

    const handleLocalSave = () => {
        onSave();
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 1000);
    };

    return (
        <div className="flex flex-col h-full bg-white select-none">
            {/* Top Header */}
            <header className="relative flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-white z-30">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <Pin size={16} fill="currentColor" />
                    </div>
                    <input 
                        type="text"
                        value={data.title}
                        onChange={(e) => onTitleChange?.(e.target.value)}
                        placeholder="제목 없음"
                        className="text-base font-bold text-slate-800 outline-none border-none bg-transparent w-40 sm:w-64"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button 
                            onClick={() => setIsDeletingDoc(true)}
                            className={`text-slate-400 p-1.5 rounded-lg transition-all ${
                                isDeletingDoc ? 'text-rose-600 bg-rose-50' : 'hover:text-rose-500 hover:bg-rose-50'
                            }`}
                        >
                            <Icons.Trash size={18} />
                        </button>

                        {isDeletingDoc && (
                            <DeleteConfirmPopover
                                onConfirm={() => {
                                    onDeleteDocument?.(data.id);
                                    setIsDeletingDoc(false);
                                }}
                                onCancel={() => setIsDeletingDoc(false)}
                                message="이 문서를 완전히 삭제하시겠습니까?"
                                className="right-0 top-full mt-2"
                            />
                        )}
                    </div>
                </div>
            </header>

            {/* Sub Header (Page Title) */}
            <div className="relative flex-shrink-0 flex items-center justify-between px-6 py-2 bg-slate-50 border-b border-slate-100 z-20">
                <div 
                    className="text-slate-500 text-[11px] font-black cursor-text hover:text-indigo-600 transition-colors flex items-center gap-2"
                    onDoubleClick={() => setIsEditingPageTitle(true)}
                >
                    <div className="w-1 h-1 rounded-full bg-indigo-400" />
                    {isEditingPageTitle ? (
                        <input
                            type="text"
                            value={tempPageTitle}
                            onChange={(e) => setTempPageTitle(e.target.value)}
                            onBlur={() => {
                                setIsEditingPageTitle(false);
                                onPageTitleChange?.(tempPageTitle);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setIsEditingPageTitle(false);
                                    onPageTitleChange?.(tempPageTitle);
                                }
                            }}
                            className="bg-white border border-indigo-200 rounded px-2 py-0.5 text-indigo-600 outline-none w-32"
                            autoFocus
                        />
                    ) : (
                        <span>{currentPageTitle}</span>
                    )}
                </div>
            </div>

            {/* Consolidated Segmented Toolbar */}
            <div className="relative flex-shrink-0 px-2 py-1.5 bg-white border-b border-slate-100 z-[40] overflow-visible">
                <div className="flex items-center gap-1.5">
                    {/* Pagination Group */}
                    <div className="flex items-center p-[1px] bg-slate-100 rounded-lg border border-slate-200/60 shadow-sm">
                        <button 
                            onClick={() => onSwitchPage(Math.max(0, currentPageIndex - 1))}
                            disabled={currentPageIndex === 0}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-indigo-600 disabled:opacity-20 transition-all font-bold"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <div className="px-1 text-[9px] font-black text-slate-500 min-w-[2.5rem] text-center tracking-tighter">
                            {currentPageIndex + 1}/{totalPages}
                        </div>
                        <button 
                            onClick={() => onSwitchPage(Math.min(totalPages - 1, currentPageIndex + 1))}
                            disabled={currentPageIndex === totalPages - 1}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-indigo-600 disabled:opacity-20 transition-all font-bold"
                        >
                            <ChevronRight size={14} />
                        </button>

                        <div className="w-[1px] h-3 bg-slate-200 mx-0.5" />
                        <button 
                            onClick={onAddPage}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-indigo-500 hover:bg-white hover:shadow-sm transition-all"
                            title="항목 추가"
                        >
                            <Plus size={14} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="w-[1px] h-5 bg-slate-200" />

                    {/* Markdown Tools Group */}
                    {!isPreviewMode && (
                        <>
                            <div className="flex items-center p-[1px] bg-slate-100 rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
                                {[
                                    { icon: <Type size={13} />, syntax: '#', label: 'H1' },
                                    { icon: <Type size={11} />, syntax: '##', label: 'H2' },
                                    { icon: <Bold size={13} />, syntax: '**', type: 'wrap', label: 'B' },
                                    { icon: <Italic size={13} />, syntax: '*', type: 'wrap', label: 'I' },
                                    { icon: <ListIcon size={13} />, syntax: '-', label: 'Li' },
                                    { icon: <Quote size={13} />, syntax: '>', label: 'Qt' }
                                ].map((tool, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => insertMarkdown(tool.syntax, tool.type as 'wrap' | 'prefix')}
                                        className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-indigo-600 transition-all active:scale-90"
                                        title={tool.label}
                                    >
                                        {tool.icon}
                                    </button>
                                ))}
                            </div>
                            <div className="w-[1px] h-5 bg-slate-200" />
                        </>
                    )}

                    {/* View Mode Toggle */}
                    <div className="flex items-center p-[1px] bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm overflow-hidden">
                        <button
                            onClick={() => setIsPreviewMode(false)}
                            className={`w-8 h-7 flex items-center justify-center rounded-md transition-all ${!isPreviewMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-indigo-300 hover:text-indigo-500'}`}
                            title="편집 모드"
                        >
                            <Edit3 size={14} />
                        </button>
                        <button
                            onClick={() => setIsPreviewMode(true)}
                            className={`w-8 h-7 flex items-center justify-center rounded-md transition-all ${isPreviewMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-indigo-300 hover:text-indigo-500'}`}
                            title="보기 모드"
                        >
                            <Eye size={14} />
                        </button>
                    </div>

                    <div className="ml-auto flex items-center gap-1.5">
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="px-2 py-1.5 rounded-lg text-[9px] font-black text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                        >
                            취소
                        </button>
                        <button 
                            onClick={handleLocalSave}
                            disabled={isSaving}
                            className="px-3 py-1.5 rounded-lg text-[9px] font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                            저장
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area (Lined Paper or Clean Markdown) */}
            <main className={`flex-1 relative overflow-y-auto group ${isPreviewMode ? 'bg-[#f4f7f6]' : 'legal-pad-container'}`}>
                {isPreviewMode ? (
                    <MarkdownPreview content={currentContent} className="shadow-2xl my-10 rounded-xl" />
                ) : (
                    <div className="legal-pad-paper min-h-full">
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={handleInput}
                            onFocus={() => setIsEditing(true)}
                            className="legal-pad-editor"
                        />
                    </div>
                )}

                {/* Floating Next Page Arrow */}
                {currentPageIndex < totalPages - 1 && (
                    <button 
                        onClick={() => onSwitchPage(currentPageIndex + 1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                        <ChevronRight size={20} />
                    </button>
                )}

                {/* Saved Toast */}
                {showSavedToast && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-800/90 backdrop-blur-sm text-white px-6 py-2.5 rounded-2xl text-[11px] font-black shadow-2xl animate-bounce-in flex items-center gap-2 border border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        저장되었습니다
                    </div>
                )}
            </main>
        </div>
    );
};

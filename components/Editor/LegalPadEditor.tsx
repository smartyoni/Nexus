import React, { useRef, useEffect, useState } from 'react';
import { DocumentData } from '../../types';
import { Icons } from '../ui/Icon';
import { ChevronLeft, ChevronRight, Pin, Plus, Eye, Edit3, Bold, Italic, Type, List as ListIcon, Quote } from 'lucide-react';
import { MarkdownPreview } from './MarkdownPreview';
import { DeleteConfirmPopover } from '../ui/DeleteConfirmPopover';

interface LegalPadEditorProps {
    data: DocumentData;
    currentPageIndex: number;
    scrollTarget?: { pageIndex: number; lineIndex: number; timestamp: number } | null;
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
    scrollTarget,
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
    const [isPreviewMode, setIsPreviewMode] = useState(true);
    const [localDocTitle, setLocalDocTitle] = useState(data.title);
    const editorRef = useRef<HTMLDivElement>(null);
    const mainAreaRef = useRef<HTMLElement>(null);
    const isComposingBody = useRef(false);
    const isComposingTitle = useRef(false);
    const isTitleFocused = useRef(false);
    const isPageTitleFocused = useRef(false);
    const isComposingPageTitle = useRef(false);
    const totalPages = data.pages?.length || 1;
    const currentContent = data.pages?.[currentPageIndex] || '';
    const currentPageTitle = data.pageTitles?.[currentPageIndex] || `대항목 ${currentPageIndex + 1}`;

    useEffect(() => {
        if (!isPageTitleFocused.current && !isComposingPageTitle.current) {
            setTempPageTitle(data.pageTitles?.[currentPageIndex] || '');
        }
    }, [currentPageIndex, data.pageTitles]);

    useEffect(() => {
        // Only sync from props if the ID changed or if NOT currently focused/composing
        if (data.id !== data.id /* actually data.id is just for triggering check */ || (!isTitleFocused.current && !isComposingTitle.current)) {
            setLocalDocTitle(data.title);
        }
    }, [data.id, data.title]);

    useEffect(() => {
        if (editorRef.current && !isComposingBody.current) {
            if (editorRef.current.innerText !== currentContent) {
                editorRef.current.innerText = currentContent;
            }
        }
    }, [currentContent, currentPageIndex, isPreviewMode]);

    // ToC Navigation Support
    useEffect(() => {
        if (scrollTarget && scrollTarget.pageIndex === currentPageIndex) {
            setIsPreviewMode(true);
            
            // Give some time for MarkdownPreview to render
            const timer = setTimeout(() => {
                const element = document.getElementById(`toc-${scrollTarget.lineIndex}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('highlight-target');
                    
                    // Remove class after animation
                    setTimeout(() => {
                        element.classList.remove('highlight-target');
                    }, 3000);
                }
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [scrollTarget, currentPageIndex]);

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
        setTimeout(() => {
            setShowSavedToast(false);
            setIsPreviewMode(true); // Return to view mode after saving
        }, 1000);
    };

    return (
        <div className="flex flex-col h-full bg-white select-none">
            {/* Unified Header (Title & Sub-Title) */}
            <header className="relative flex-shrink-0 flex items-stretch border-b border-slate-100 bg-white z-30 h-11">
                <div className="flex-1 flex items-center px-4 border-r border-slate-50 group/title">
                    <input 
                        type="text"
                        value={localDocTitle}
                        onFocus={() => { isTitleFocused.current = true; }}
                        onBlur={() => { 
                            isTitleFocused.current = false; 
                            onTitleChange?.(localDocTitle);
                        }}
                        onCompositionStart={() => { isComposingTitle.current = true; }}
                        onCompositionEnd={(e) => { 
                            isComposingTitle.current = false; 
                            onTitleChange?.((e.target as HTMLInputElement).value);
                        }}
                        onChange={(e) => {
                            setLocalDocTitle(e.target.value);
                            if (!isComposingTitle.current) {
                                onTitleChange?.(e.target.value);
                            }
                        }}
                        placeholder="제목"
                        className="text-sm font-bold text-slate-700 outline-none border-none bg-transparent flex-1 placeholder:text-slate-300 placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
                    />
                </div>
                <div className="flex-1 flex items-center px-4 group/page">
                    {isEditingPageTitle ? (
                        <input
                            type="text"
                            value={tempPageTitle}
                            placeholder="대항목"
                            onFocus={() => { isPageTitleFocused.current = true; }}
                            onCompositionStart={() => { isComposingPageTitle.current = true; }}
                            onCompositionEnd={() => { isComposingPageTitle.current = false; }}
                            onChange={(e) => setTempPageTitle(e.target.value)}
                            onBlur={() => {
                                isPageTitleFocused.current = false;
                                setIsEditingPageTitle(false);
                                onPageTitleChange?.(tempPageTitle);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    isPageTitleFocused.current = false;
                                    setIsEditingPageTitle(false);
                                    onPageTitleChange?.(tempPageTitle);
                                }
                            }}
                            className="text-sm font-bold text-indigo-600 outline-none border-none bg-transparent flex-1 placeholder:text-slate-300 placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
                            autoFocus
                        />
                    ) : (
                        <div 
                            className={`text-sm cursor-text flex-1 truncate ${tempPageTitle ? 'font-medium text-slate-500' : 'font-black text-slate-300 uppercase tracking-widest'}`}
                            onDoubleClick={() => setIsEditingPageTitle(true)}
                        >
                            {tempPageTitle || '대항목'}
                        </div>
                    )}
                </div>
            </header>

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


                    <div className="ml-auto flex items-center gap-1.5">
                        {isPreviewMode ? (
                            <>
                                <button 
                                    onClick={() => setIsPreviewMode(false)}
                                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Edit3 size={14} />
                                    수정하기
                                </button>
                                {/* Delete in View Mode */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setIsDeletingDoc(true)}
                                        className={`p-1.5 rounded-lg transition-all ${
                                            isDeletingDoc ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                                        }`}
                                    >
                                        <Icons.Trash size={16} />
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
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => setIsPreviewMode(true)}
                                    className="px-2 py-1.5 rounded-lg text-[10px] font-black text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all font-serif"
                                >
                                    취소
                                </button>
                                <button 
                                    onClick={handleLocalSave}
                                    disabled={isSaving}
                                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-50 font-serif"
                                >
                                    저장
                                </button>
                                {/* Delete in Edit Mode */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setIsDeletingDoc(true)}
                                        className={`p-1.5 rounded-lg transition-all ${
                                            isDeletingDoc ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                                        }`}
                                    >
                                        <Icons.Trash size={16} />
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
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area (Lined Paper) */}
            <main className="flex-1 relative overflow-y-auto group legal-pad-container">
                <div className="legal-pad-paper min-h-full">
                    {isPreviewMode ? (
                        <MarkdownPreview content={currentContent} />
                    ) : (
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={handleInput}
                            onFocus={() => setIsEditing(true)}
                            onCompositionStart={() => { isComposingBody.current = true; }}
                            onCompositionEnd={() => { isComposingBody.current = false; handleInput(); }}
                            className="legal-pad-editor"
                        />
                    )}
                </div>

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

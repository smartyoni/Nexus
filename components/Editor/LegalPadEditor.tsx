import React, { useRef, useEffect, useState } from 'react';
import { DocumentData } from '../../types';
import { Icons } from '../ui/Icon';
import { ChevronLeft, ChevronRight, Plus, Edit3, ArrowUp, ArrowDown } from 'lucide-react';
import { MarkdownPreview } from './MarkdownPreview';
import { MilkdownEditor } from './MilkdownEditor';
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
    onPageTitleChange?: (title: string, index?: number) => void;
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
    const [isDeletingCurrentPage, setIsDeletingCurrentPage] = React.useState(false);
    const [isDeletingPageIndex, setIsDeletingPageIndex] = React.useState<number | null>(null);
    const [showSavedToast, setShowSavedToast] = React.useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(true);
    const [localDocTitle, setLocalDocTitle] = useState(data.title);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const mainAreaRef = useRef<HTMLElement>(null);
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



    const handleLocalSave = () => {
        onSave();
        setShowSavedToast(true);
        setTimeout(() => {
            setShowSavedToast(false);
            setIsPreviewMode(true); // Return to view mode after saving
        }, 1000);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!isPreviewMode) return;
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isPreviewMode) return;
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!isPreviewMode || !touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const Threshold = 70; // Slightly higher threshold for page turns
        
        if (distance > Threshold && currentPageIndex < totalPages - 1) {
            // Swipe Left -> Next Page
            onSwitchPage(currentPageIndex + 1);
            e.stopPropagation();
        } else if (distance < -Threshold && currentPageIndex > 0) {
            // Swipe Right -> Previous Page
            onSwitchPage(currentPageIndex - 1);
            e.stopPropagation();
        }
        
        setTouchStart(null);
        setTouchEnd(null);
    };

    const handleGoToTop = () => {
        mainAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleGoToBottom = () => {
        mainAreaRef.current?.scrollTo({ top: mainAreaRef.current?.scrollHeight ?? 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col h-full bg-[#fafafa] select-none relative">
            {/* Unified Header (Title & Sub-Title) - FIXED ON MOBILE */}
            <header className="sticky top-0 flex-shrink-0 flex items-stretch border-b border-slate-100 bg-white z-50 h-11">
                <div className="flex-1 flex items-center px-4 border-r border-slate-100 group/title gap-2">
                    <span className="text-[15px] font-bold text-rose-600 font-serif flex-none">문서제목:</span>
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
                        placeholder="제목을 입력하세요"
                        className="text-[15px] font-bold text-black outline-none border-none bg-transparent flex-1 placeholder:text-slate-300 font-serif"
                    />
                </div>
                <div className="flex-1 flex items-center px-4 group/page gap-2">
                    <span className="text-[15px] font-bold text-emerald-600 font-serif flex-none">챕터명:</span>
                    {isEditingPageTitle ? (
                        <input
                            type="text"
                            value={tempPageTitle}
                            placeholder="챕터명을 입력하세요"
                            onFocus={() => { isPageTitleFocused.current = true; }}
                            onCompositionStart={() => { isComposingPageTitle.current = true; }}
                            onCompositionEnd={() => { isComposingPageTitle.current = false; }}
                            onChange={(e) => setTempPageTitle(e.target.value)}
                            onBlur={() => {
                                isPageTitleFocused.current = false;
                                setIsEditingPageTitle(false);
                                onPageTitleChange?.(tempPageTitle.trim() || `Chapter ${currentPageIndex + 1}`);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    isPageTitleFocused.current = false;
                                    setIsEditingPageTitle(false);
                                    onPageTitleChange?.(tempPageTitle.trim() || `Chapter ${currentPageIndex + 1}`);
                                } else if (e.key === 'Escape') {
                                    isPageTitleFocused.current = false;
                                    setIsEditingPageTitle(false);
                                    setTempPageTitle(data.pageTitles?.[currentPageIndex] || '');
                                }
                            }}
                            className="text-[15px] font-bold text-black outline-none border-b-2 border-slate-900 bg-transparent flex-1 placeholder:text-slate-300 font-serif"
                            autoFocus
                        />
                    ) : (
                        <div 
                            className={`text-[15px] cursor-pointer flex-1 truncate select-text transition-colors hover:text-indigo-600 font-serif ${tempPageTitle ? 'font-bold text-black' : 'font-black text-slate-300 uppercase tracking-widest'}`}
                            onDoubleClick={() => setIsEditingPageTitle(true)}
                            title="Double click to edit chapter title"
                        >
                            {tempPageTitle || '챕터명을 입력하세요'}
                        </div>
                    )}
                </div>
            </header>

            {/* Consolidated Segmented Toolbar - FIXED ON MOBILE */}
            <div className="sticky top-11 flex-shrink-0 px-2 py-1.5 bg-white border-b border-slate-100 z-[40] overflow-visible shadow-sm">
                <div className="flex items-center gap-1.5">
                    {/* Pagination Group - Expanded & Distinct */}
                    <div className="flex items-center p-1 bg-indigo-50/80 rounded-lg border border-indigo-200/60 shadow-inner">
                        <button 
                            onClick={() => onSwitchPage(Math.max(0, currentPageIndex - 1))}
                            disabled={currentPageIndex === 0}
                            className="w-10 h-7 flex items-center justify-center rounded-md text-indigo-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm disabled:opacity-20 transition-all font-bold"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="px-2 text-[10px] font-black text-indigo-900 min-w-[3.2rem] text-center tracking-tighter font-serif">
                            {currentPageIndex + 1} / {totalPages}
                        </div>
                        <button 
                            onClick={() => onSwitchPage(Math.min(totalPages - 1, currentPageIndex + 1))}
                            disabled={currentPageIndex === totalPages - 1}
                            className="w-10 h-7 flex items-center justify-center rounded-md text-indigo-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm disabled:opacity-20 transition-all font-bold"
                        >
                            <ChevronRight size={16} />
                        </button>

                        <div className="w-[1px] h-4 bg-indigo-200/60 mx-1" />
                        <button 
                            onClick={onAddPage}
                            className="w-9 h-7 flex items-center justify-center rounded-md text-indigo-600 bg-white shadow-sm hover:bg-indigo-600 hover:text-white transition-all"
                            title="항목 추가"
                        >
                            <Plus size={14} strokeWidth={4} />
                        </button>
                    </div>

                    <div className="w-[1px] h-5 bg-slate-200" />


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
                                        onClick={() => setIsDeletingCurrentPage(true)}
                                        disabled={totalPages <= 1}
                                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold ${
                                            isDeletingCurrentPage ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-20'
                                        }`}
                                    >
                                        <Icons.Trash size={14} />
                                        페이지삭제
                                    </button>
                                    {isDeletingCurrentPage && (
                                        <DeleteConfirmPopover
                                            onConfirm={() => {
                                                onRemovePage(currentPageIndex);
                                                setIsDeletingCurrentPage(false);
                                            }}
                                            onCancel={() => setIsDeletingCurrentPage(false)}
                                            message="현재 페이지를 삭제하시겠습니까?"
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
                                        onClick={() => setIsDeletingCurrentPage(true)}
                                        disabled={totalPages <= 1}
                                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold ${
                                            isDeletingCurrentPage ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-20'
                                        }`}
                                    >
                                        <Icons.Trash size={14} />
                                        페이지삭제
                                    </button>
                                    {isDeletingCurrentPage && (
                                        <DeleteConfirmPopover
                                            onConfirm={() => {
                                                onRemovePage(currentPageIndex);
                                                setIsDeletingCurrentPage(false);
                                            }}
                                            onCancel={() => setIsDeletingCurrentPage(false)}
                                            message="현재 페이지를 삭제하시겠습니까?"
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
            <main 
                ref={mainAreaRef}
                className="flex-1 relative overflow-y-auto group book-theme-container select-text cursor-text"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDoubleClick={(e) => {
                    if (isPreviewMode) {
                        e.preventDefault(); // Stop native text selection
                        setIsPreviewMode(false);
                    }
                }}
            >

                <div className="book-theme-paper min-h-full">
                    {isPreviewMode ? (
                        <MarkdownPreview content={currentContent} />
                    ) : (
                        <div className="book-theme-editor">
                            <MilkdownEditor 
                                key={`${data.id}-${currentPageIndex}`}
                                content={currentContent}
                                onChange={onContentChange}
                            />
                        </div>
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

            {/* Floating Navigation Buttons (Fixed relative to editor container) */}
            <div className="absolute right-4 bottom-8 z-[100] flex flex-col gap-3">
                <button 
                    onClick={handleGoToTop}
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl flex items-center justify-center text-indigo-600 hover:scale-110 active:scale-95 transition-all opacity-90 hover:opacity-100"
                    title="문서 가장 위로"
                >
                    <ArrowUp size={22} />
                </button>
                <button 
                    onClick={handleGoToBottom}
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl flex items-center justify-center text-indigo-600 hover:scale-110 active:scale-95 transition-all opacity-90 hover:opacity-100"
                    title="문서 가장 아래로"
                >
                    <ArrowDown size={22} />
                </button>
            </div>
        </div>
    );
};

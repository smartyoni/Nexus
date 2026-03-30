import React, { useState } from 'react';
import { DocumentData } from '../../types';
import { List, ArrowLeft, Plus, Minus } from 'lucide-react';

interface DocumentToCProps {
    data: DocumentData;
    currentPageIndex: number;
    onSwitchPage: (index: number) => void;
    onViewDetail: () => void;
    onAddPage: () => void;
    onReorderPages: (newPages: string[], newPageTitles: string[]) => void;
    onNavigate?: (pageIndex: number, lineIndex: number) => void;
}

export const DocumentToC: React.FC<DocumentToCProps> = ({
    data,
    currentPageIndex,
    onSwitchPage,
    onViewDetail,
    onAddPage,
    onReorderPages,
    onNavigate
}) => {
    const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const totalPages = data.pages?.length || 1;

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        const target = e.currentTarget as HTMLElement;
        setTimeout(() => {
            target.classList.add('opacity-40');
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedIndex(null);
        const target = e.currentTarget as HTMLElement;
        target.classList.remove('opacity-40');
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const newPages = [...(data.pages || [])];
        const newPageTitles = [...(data.pageTitles || [])];
        
        if (newPages.length === 0) return;
        
        const [movedPage] = newPages.splice(draggedIndex, 1);
        newPages.splice(dropIndex, 0, movedPage);
        
        // Sync page titles
        const titlesToSync = [...newPageTitles];
        while (titlesToSync.length < (data.pages?.length || 1)) {
            titlesToSync.push('');
        }
        const [movedTitle] = titlesToSync.splice(draggedIndex, 1);
        titlesToSync.splice(dropIndex, 0, movedTitle);
        
        onReorderPages(newPages, titlesToSync);
    };

    const togglePage = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedPages(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const extractSubItems = (content: string) => {
        if (!content) return [];
        return content.split('\n')
            .map((line, index) => {
                const trimmed = line.trim();
                let level = 0;
                if (trimmed.startsWith('## ')) level = 2;
                else if (trimmed.startsWith('# ')) level = 1;
                
                if (level > 0) {
                    let text = trimmed.substring(level).trim();
                    // Remove any remaining leading #s for safety
                    text = text.replace(/^#+\s*/, '');
                    
                    if (text && !text.endsWith('.')) {
                        text += '.';
                    }
                    return { text, index, level };
                }
                return null;
            })
            .filter((item): item is { text: string; index: number; level: number } => item !== null && item.text.length > 0);
    };

    return (
        <div className="flex flex-col h-full bg-[#fafafa] select-none overflow-hidden font-serif">
            {/* Elegant Book Header */}
            <div className="flex-shrink-0 px-8 pt-6 pb-10 text-center border-b border-slate-100 bg-white">
                <div className="max-w-xl mx-auto relative group">
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <h1 className="text-3xl font-light text-slate-800 tracking-tight font-serif">
                            {data.title || 'Untitled Document'}
                        </h1>
                        <button
                            onClick={onAddPage}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 transition-all active:scale-95"
                            title="Add New Page"
                        >
                            <Plus size={14} strokeWidth={3} />
                            <span>페이지추가</span>
                        </button>
                    </div>
                    <div className="w-12 h-[1px] bg-slate-200 mx-auto my-4" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Table of Contents</p>
                </div>
            </div>

            {/* Classic Book-style List Area */}
            <div className="flex-1 overflow-y-auto bg-white">
                <div className="max-w-2xl mx-auto px-8 py-16">
                    <div className="space-y-6">
                        {Array.from({ length: totalPages }).map((_, i) => {
                            const title = data.pageTitles?.[i] || `Chapter ${i + 1}`;
                            const isActive = i === currentPageIndex;
                            const isExpanded = expandedPages.has(i);
                            const subItems = extractSubItems(data.pages?.[i] || '');
                            
                            return (
                                <div 
                                    key={i} 
                                    draggable="true"
                                    onDragStart={(e) => handleDragStart(e, i)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, i)}
                                    className="flex flex-col group/row"
                                >
                                    <div className="w-full group flex items-baseline gap-2 text-left transition-opacity cursor-grab active:cursor-grabbing">
                                        <button
                                            onClick={() => {
                                                onSwitchPage(i);
                                                onViewDetail();
                                            }}
                                            className="flex-1 flex items-baseline gap-2 text-left hover:opacity-70 transition-opacity"
                                        >
                                            {/* Chapter Number & Title */}
                                            <div className="flex items-baseline gap-4 flex-none">
                                                <span className="text-[11px] font-bold text-slate-400 w-6 italic font-serif">
                                                    {String(i + 1).padStart(2, '0')}.
                                                </span>
                                                <span className={`text-[15px] font-medium tracking-tight ${isActive ? 'text-indigo-600 font-bold' : 'text-slate-700'} group-hover/row:text-amber-700 transition-colors`}>
                                                    {title}
                                                </span>
                                            </div>

                                            {/* Dotted Leader */}
                                            <div className="flex-1 border-b border-dotted border-slate-200 h-0 translate-y-[-4px]" />
                                        </button>

                                        {/* Page Indicator & Accordion Toggle */}
                                        <div className="flex items-center gap-1 flex-none ml-2">
                                            {subItems.length > 0 ? (
                                                <button 
                                                    onClick={(e) => togglePage(i, e)}
                                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
                                                        isExpanded ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-500'
                                                    }`}
                                                >
                                                    <span className="text-[13px] font-bold">
                                                        p.{i + 1}
                                                    </span>
                                                    {isExpanded ? <Minus size={10} strokeWidth={3} /> : <Plus size={10} strokeWidth={3} />}
                                                </button>
                                            ) : (
                                                <div className="px-2 py-1 text-slate-400">
                                                    <span className="text-[13px] font-bold">
                                                        p.{i + 1}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sub Items Area (Level 2 & 3) - Accordion Content */}
                                    {isExpanded && subItems.length > 0 && (
                                        <div className="flex flex-col gap-1.5 ml-[42px] mt-2 mb-4 border-l-2 border-slate-50 pl-4 py-1 animate-fade-in text-serif">
                                            {subItems.map((sub, idx) => (
                                                <button 
                                                    key={idx} 
                                                    onClick={() => onNavigate?.(i, sub.index)}
                                                    className={`group/sub flex items-start gap-2.5 text-left w-full hover:bg-slate-50 rounded-md py-1 px-1.5 transition-colors ${
                                                        sub.level === 2 ? 'ml-5' : ''
                                                    }`}
                                                >
                                                    <span className={`mt-1 flex-none ${sub.level === 2 ? 'text-[8px] text-slate-300' : 'text-[10px] text-indigo-300'}`}>
                                                        {sub.level === 2 ? '◦' : '•'}
                                                    </span>
                                                    <span className={`leading-relaxed tracking-tight transition-colors ${
                                                        sub.level === 2 
                                                            ? 'text-[11px] text-slate-500 font-medium group-hover/sub:text-indigo-500' 
                                                            : 'text-[12px] text-slate-600 font-bold group-hover/sub:text-indigo-600'
                                                    }`}>
                                                        {sub.text}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty State message if no pages (shouldn't happen) */}
                    {totalPages === 0 && (
                        <div className="text-center py-20 text-slate-300 italic">
                            No chapters found.
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex-shrink-0 px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-center">
                <button 
                    onClick={onViewDetail}
                    className="flex items-center gap-2 group text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Document
                </button>
            </div>
        </div>
    );
};

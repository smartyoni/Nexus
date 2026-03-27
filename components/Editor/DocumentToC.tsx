import React from 'react';
import { DocumentData } from '../../types';
import { List, ArrowLeft } from 'lucide-react';

interface DocumentToCProps {
    data: DocumentData;
    currentPageIndex: number;
    onSwitchPage: (index: number) => void;
    onViewDetail: () => void;
    onNavigate?: (pageIndex: number, lineIndex: number) => void;
}

export const DocumentToC: React.FC<DocumentToCProps> = ({
    data,
    currentPageIndex,
    onSwitchPage,
    onViewDetail,
    onNavigate
}) => {
    const totalPages = data.pages?.length || 1;

    const extractSubItems = (content: string) => {
        if (!content) return [];
        return content.split('\n')
            .map((line, index) => ({ line: line.trim(), index }))
            .filter(item => item.line.startsWith('#'))
            .map(item => {
                let text = item.line.substring(1).trim();
                // If it's ## or ###, remove leading #s as well for cleaner display
                text = text.replace(/^#+\s*/, '');
                
                if (text && !text.endsWith('.')) {
                    text += '.';
                }
                return { text, index: item.index };
            })
            .filter(item => item.text.length > 0);
    };

    return (
        <div className="flex flex-col h-full bg-[#fdfdfd] select-none overflow-hidden font-serif">
            {/* Elegant Book Header */}
            <div className="flex-shrink-0 px-8 py-12 text-center border-b border-slate-100 bg-[#f8f9fa]">
                <div className="max-w-xl mx-auto">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-slate-200 mb-6 text-slate-400">
                        <List size={20} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-light text-slate-800 tracking-tight mb-2 font-serif">
                        {data.title || 'Untitled Document'}
                    </h1>
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
                            const charCount = data.pages?.[i]?.length || 0;
                            
                            return (
                                <div key={i} className="flex flex-col">
                                    <button
                                        onClick={() => {
                                            onSwitchPage(i);
                                            onViewDetail();
                                        }}
                                        className="w-full group flex items-baseline gap-2 text-left hover:opacity-70 transition-opacity"
                                    >
                                        {/* Chapter Number & Title */}
                                        <div className="flex items-baseline gap-4 flex-none">
                                            <span className="text-[11px] font-bold text-slate-400 w-6 italic font-serif">
                                                {String(i + 1).padStart(2, '0')}.
                                            </span>
                                            <span className={`text-[15px] font-medium tracking-tight ${isActive ? 'text-indigo-600 font-bold' : 'text-slate-700'}`}>
                                                {title}
                                            </span>
                                        </div>

                                        {/* Dotted Leader */}
                                        <div className="flex-1 border-b border-dotted border-slate-200 h-0 translate-y-[-4px]" />

                                        {/* Page Info / Character Count */}
                                        <div className="flex items-baseline gap-2 flex-none">
                                            <span className="text-[11px] font-bold text-slate-400 italic">
                                                {charCount} chars
                                            </span>
                                            <span className={`text-[13px] font-bold ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                p.{i + 1}
                                            </span>
                                        </div>
                                    </button>

                                    {/* Sub Items Area (Level 2) */}
                                    {(() => {
                                        const subItems = extractSubItems(data.pages?.[i] || '');
                                        if (subItems.length === 0) return null;
                                        return (
                                            <div className="flex flex-col gap-2 ml-[42px] mt-2 mb-4 border-l-2 border-slate-50 pl-4 py-1">
                                                {subItems.map((sub, idx) => (
                                                    <button 
                                                        key={idx} 
                                                        onClick={() => onNavigate?.(i, sub.index)}
                                                        className="group/sub flex items-start gap-2.5 text-left w-full hover:bg-slate-50 rounded-md py-0.5 px-1 transition-colors"
                                                    >
                                                        <span className="text-[10px] text-indigo-300 mt-1 flex-none">•</span>
                                                        <span className="text-[12px] text-slate-600 font-bold leading-relaxed tracking-tight group-hover/sub:text-indigo-600 transition-colors">
                                                            {sub.text}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        );
                                    })()}
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
            <div className="flex-shrink-0 px-8 py-6 bg-[#f8f9fa] border-t border-slate-100 flex items-center justify-center">
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

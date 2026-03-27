import React, { useState } from 'react';
import { DocumentData } from '../../types';
import { DeleteConfirmPopover } from '../ui/DeleteConfirmPopover';
import { Library, Trash2 } from 'lucide-react';

interface DocumentListProps {
    documents: DocumentData[];
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
    documents,
    onSelect,
    onDelete
}) => {
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
    // 최근 수정순 정렬
    const sortedDocs = [...documents].sort((a, b) => b.updatedAt - a.updatedAt);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-full bg-[#fdfdfd] select-none overflow-hidden font-serif">
            {/* Elegant Library Header */}
            <div className="flex-shrink-0 px-8 py-10 text-center border-b border-slate-100 bg-[#f8f9fa]">
                <div className="max-w-xl mx-auto">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-slate-200 mb-6 text-slate-400">
                        <Library size={20} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-light text-slate-800 tracking-tight mb-2 font-serif">
                        Document Collection
                    </h1>
                    <div className="w-12 h-[1px] bg-slate-200 mx-auto my-4" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Stored Chronicles</p>
                </div>
            </div>

            {/* Classic Book-style List Area */}
            <div className="flex-1 overflow-y-auto bg-white">
                <div className="max-w-2xl mx-auto px-8 py-12">
                    {sortedDocs.length === 0 ? (
                        <div className="text-center py-20 text-slate-300 italic">
                            Your library is currently empty.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {sortedDocs.map((doc, i) => {
                                const isActive = false; // 리스트에서는 활성 표시 생략하거나 다르게 처리
                                const pageCount = doc.pages?.length || 1;
                                
                                return (
                                    <div key={doc.id} className="group relative">
                                        <button
                                            onClick={() => onSelect(doc.id)}
                                            className="w-full flex items-baseline gap-2 text-left hover:opacity-70 transition-opacity"
                                        >
                                            {/* Index & Title */}
                                            <div className="flex items-baseline gap-4 flex-none">
                                                <span className="text-[11px] font-bold text-slate-400 w-6 italic font-serif">
                                                    {String(i + 1).padStart(2, '0')}.
                                                </span>
                                                <span className="text-[15px] font-medium tracking-tight text-slate-700 group-hover:text-indigo-600 transition-colors">
                                                    {doc.title || 'Untitled Archive'}
                                                </span>
                                            </div>

                                            {/* Dotted Leader */}
                                            <div className="flex-1 border-b border-dotted border-slate-200 h-0 translate-y-[-4px]" />

                                            {/* Metadata */}
                                            <div className="flex items-baseline gap-3 flex-none pr-8">
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                                    {pageCount} vol.
                                                </span>
                                                <span className="text-[11px] font-bold text-slate-400 italic">
                                                    {formatDate(doc.updatedAt)}
                                                </span>
                                            </div>
                                        </button>

                                        {/* Action: Delete (Subtle) */}
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeletingDocId(doc.id);
                                                    }}
                                                    className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                
                                                {deletingDocId === doc.id && (
                                                    <DeleteConfirmPopover
                                                        onConfirm={() => {
                                                            onDelete(doc.id);
                                                            setDeletingDocId(null);
                                                        }}
                                                        onCancel={() => setDeletingDocId(null)}
                                                        message="Delete?"
                                                        className="right-0 top-full mt-1"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Summary */}
            <div className="flex-shrink-0 px-8 py-5 bg-[#f8f9fa] border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Total: {sortedDocs.length} Documents
                </div>
            </div>
        </div>
    );
};

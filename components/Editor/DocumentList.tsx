import React, { useState } from 'react';
import { DocumentData } from '../../types';
import { DeleteConfirmPopover } from '../ui/DeleteConfirmPopover';
import { Trash2 } from 'lucide-react';

interface DocumentListProps {
    documents: DocumentData[];
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onReorder: (newOrder: DocumentData[]) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
    documents,
    onSelect,
    onDelete,
    onReorder
}) => {
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Native DND Handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        
        // Add a small delay to allow the ghost image to be created before we change the style
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

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        // You could add visual feedback here (e.g. border-t-2 on the hover target)
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const newDocs = [...documents];
        const [movedItem] = newDocs.splice(draggedIndex, 1);
        newDocs.splice(dropIndex, 0, movedItem);
        
        onReorder(newDocs);
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-full bg-[#fdfdfd] select-none overflow-hidden font-serif">
            {/* Elegant Library Header */}
            <div className="flex-shrink-0 px-8 pt-5 pb-8 text-center border-b border-slate-100 bg-[#f8f9fa]">
                <div className="max-w-xl mx-auto">
                    <h1 className="text-3xl font-light text-slate-800 tracking-tight mb-2 font-serif">
                        Document Collection
                    </h1>
                    <div className="w-12 h-[1px] bg-slate-200 mx-auto my-4" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Stored Chronicles</p>
                </div>
            </div>

            {/* Classic Book-style List Area */}
            <div className="flex-1 overflow-y-auto bg-white scrollbar-hide">
                <div className="max-w-2xl mx-auto px-8 py-12">
                    {documents.length === 0 ? (
                        <div className="text-center py-20 text-slate-300 italic">
                            Your library is currently empty.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {documents.map((doc, i) => {
                                const pageCount = doc.pages?.length || 1;
                                
                                return (
                                    <div 
                                        key={doc.id} 
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, i)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => handleDragOver(e, i)}
                                        onDrop={(e) => handleDrop(e, i)}
                                        className="group relative"
                                    >
                                        <button
                                            onClick={() => onSelect(doc.id)}
                                            className="w-full flex items-baseline gap-2 text-left hover:opacity-70 transition-opacity cursor-grab active:cursor-grabbing"
                                        >
                                            {/* Index & Title */}
                                            <div className="flex items-baseline gap-4 flex-none">
                                                <span className="text-[11px] font-bold text-slate-400 w-6 italic font-serif">
                                                    {String(i + 1).padStart(2, '0')}.
                                                </span>
                                                <span className="text-[15px] font-medium tracking-tight text-slate-700 group-hover:text-amber-700 transition-colors">
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
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Total: {documents.length} Documents</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-slate-300">v1.2.4</span>
                </div>
            </div>
        </div>
    );
};

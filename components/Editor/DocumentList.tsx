import React, { useState } from 'react';
import { DocumentData } from '../../types';
import { DeleteConfirmPopover } from '../ui/DeleteConfirmPopover';
import { Trash2, Lock, Unlock } from 'lucide-react';

interface DocumentListProps {
    documents: DocumentData[];
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onToggleLock: (id: string) => void;
    onReorder: (newOrder: DocumentData[]) => void;
    onAddDocument: () => void;
    onUpdateTitle: (id: string, title: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
    documents,
    onSelect,
    onDelete,
    onToggleLock,
    onReorder,
    onAddDocument,
    onUpdateTitle
}) => {
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [editingDocId, setEditingDocId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');

    const handleStartEditing = (id: string, currentTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingDocId(id);
        setEditingTitle(currentTitle);
    };

    const handleTitleSubmit = () => {
        if (editingDocId) {
            onUpdateTitle(editingDocId, editingTitle.trim() || 'Untitled Archive');
            setEditingDocId(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleTitleSubmit();
        if (e.key === 'Escape') setEditingDocId(null);
    };

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
        <div className="flex flex-col h-full bg-[#fafafa] select-none overflow-hidden font-serif">
            {/* Elegant Library Header */}
            <div className="flex-shrink-0 px-8 pt-5 pb-5 text-center border-b border-slate-100 bg-white">
                <div className="max-w-xl mx-auto flex items-center justify-center gap-4">
                    <h1 className="text-3xl font-light text-slate-800 tracking-tight font-serif">
                        문서목록
                    </h1>
                    <button
                        onClick={onAddDocument}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
                        title="새 문서 작성"
                    >
                        <span className="text-sm">+</span>
                        <span>문서추가</span>
                    </button>
                </div>
            </div>

            {/* Classic Book-style List Area */}
            <div className="flex-1 overflow-y-auto bg-white scrollbar-hide">
                <div className="max-w-2xl mx-auto px-8 py-8">
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
                                                <span 
                                                    onClick={(e) => handleStartEditing(doc.id, doc.title || '', e)}
                                                    className="text-[11px] font-bold text-slate-400 w-6 italic font-serif hover:text-indigo-600 transition-colors cursor-pointer"
                                                    title="클릭하여 제목 수정"
                                                >
                                                    {String(i + 1).padStart(2, '0')}.
                                                </span>
                                                {editingDocId === doc.id ? (
                                                    <input
                                                        autoFocus
                                                        value={editingTitle}
                                                        onChange={(e) => setEditingTitle(e.target.value)}
                                                        onBlur={handleTitleSubmit}
                                                        onKeyDown={handleKeyDown}
                                                        className="text-[17px] font-medium tracking-tight bg-white border-b-2 border-indigo-500 outline-none w-full max-w-[240px] text-slate-700"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <span className="text-[17px] font-medium tracking-tight text-slate-700 group-hover:text-amber-700 transition-colors">
                                                        {doc.title || 'Untitled Archive'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Dotted Leader */}
                                            <div className="flex-1 border-b border-dotted border-slate-200 h-0 translate-y-[-4px]" />

                                            {/* Metadata: Volume info only */}
                                            <div className="flex items-baseline gap-3 flex-none pr-32">
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                                    {pageCount} vol.
                                                </span>
                                            </div>
                                        </button>

                                        {/* Action: Lock & Delete Segmented Tab */}
                                        <div 
                                            className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center transition-all duration-200 z-20 ${
                                                deletingDocId === doc.id 
                                                    ? 'opacity-100 translate-x-0 pointer-events-auto' 
                                                    : 'opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto pointer-events-none'
                                            }`}
                                        >
                                            <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-visible h-8 shadow-md">
                                                {/* Lock Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleLock(doc.id);
                                                    }}
                                                    className={`px-3 h-full flex items-center justify-center transition-colors ${
                                                        doc.isLocked 
                                                            ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                                                            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                                    } border-r border-slate-200`}
                                                    title={doc.isLocked ? "Unlock" : "Lock"}
                                                >
                                                    {doc.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                                                </button>

                                                {/* Delete Button */}
                                                <div className="relative h-full">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (doc.isLocked) {
                                                                alert('Locked documents cannot be deleted.');
                                                                return;
                                                            }
                                                            setDeletingDocId(doc.id);
                                                        }}
                                                        disabled={doc.isLocked}
                                                        className={`px-3 h-full flex items-center justify-center transition-colors ${
                                                            doc.isLocked 
                                                                ? 'text-slate-200 cursor-not-allowed' 
                                                                : 'text-slate-400 hover:bg-rose-50 hover:text-rose-500'
                                                        }`}
                                                        title="Delete"
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
                                                            className="right-0 top-full mt-2"
                                                        />
                                                    )}
                                                </div>
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
                    <span className="text-slate-300">v1.2.5</span>
                </div>
            </div>
        </div>
    );
};

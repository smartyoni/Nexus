import React, { useState, useEffect, useRef } from 'react';
import { ChecklistItem, generateId } from '../../types';
import { Icons } from '../ui/Icon';
import { ConfirmModal } from '../ui/ConfirmModal';

// --- Checklist Item Sub-Component ---
interface ChecklistItemComponentProps {
  item: ChecklistItem;
  onToggle: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
}

const ChecklistItemComponent: React.FC<ChecklistItemComponentProps> = ({ item, onToggle, onEdit, onDelete }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Adjust height on initial render and when text changes from props
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [item.text]);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    // Adjust height while typing
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <div 
      className={`group flex items-start gap-3 p-3 rounded-lg border shadow-sm transition-all duration-200 ${
        item.isChecked 
          ? 'bg-gray-50 border-gray-200' 
          : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-md'
      }`}
    >
      <button 
        onClick={() => onToggle(item.id)}
        className={`mt-0.5 flex-none transition-colors ${item.isChecked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
      >
        {item.isChecked ? <Icons.Check size={20} /> : <div className="w-[20px] h-[20px] border-2 border-current rounded-md" />}
      </button>
      
      <textarea 
        ref={textareaRef}
        className={`flex-1 bg-transparent text-sm resize-none outline-none h-auto min-h-[1.5rem] leading-relaxed py-0.5 ${item.isChecked ? 'line-through text-gray-400' : 'text-gray-800 font-medium'}`}
        value={item.text}
        onChange={(e) => onEdit(item.id, e.target.value)}
        onInput={handleInput}
        rows={1} // Keep rows={1} to ensure it starts small and grows
      />

      <button 
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
      >
        <Icons.Trash size={16} />
      </button>
    </div>
  );
};


// --- Main Checklist Manager Component ---
interface ChecklistManagerProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export const ChecklistManager: React.FC<ChecklistManagerProps> = ({ items, onChange }) => {
  const [newItemText, setNewItemText] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAddItem = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: generateId(),
      text: newItemText.trim(),
      isChecked: false
    };
    
    onChange([...items, newItem]);
    setNewItemText('');
  };

  const handleToggle = (id: string) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    );
    onChange(updated);
  };

  const requestDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onChange(items.filter(item => item.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleEdit = (id: string, newText: string) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, text: newText } : item
    );
    onChange(updated);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-t border-gray-200">
      {/* Header / Input Area */}
      <div className="px-3 py-3 border-b bg-white flex-none shadow-sm z-10">
        <form onSubmit={handleAddItem} className="flex gap-2 items-center">
          <div className="flex-1 relative">
             <input 
              type="text" 
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="체크리스트 추가..."
              className="w-full pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all"
            />
          </div>
          <button 
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors flex-shrink-0 shadow-sm"
          >
            <Icons.Plus size={18} />
          </button>
        </form>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-20 text-gray-400">
            <Icons.Check size={28} className="mb-2 opacity-30" />
            <span className="text-sm">항목 없음</span>
          </div>
        )}
        {items.map((item) => (
          <ChecklistItemComponent 
            key={item.id}
            item={item}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={requestDelete}
          />
        ))}
      </div>

      {/* Delete Confirmation Modal for Checklist Item */}
      <ConfirmModal 
        isOpen={!!deleteId}
        title="항목 삭제"
        message="이 체크리스트 항목을 삭제하시겠습니까?"
        onConfirm={confirmDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
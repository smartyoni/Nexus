import React, { useState, useEffect, useRef } from 'react';
import { ChecklistItem, generateId } from '../../types';
import { Icons } from '../ui/Icon';
import { ConfirmModal } from '../ui/ConfirmModal';
import { MemoModal } from '../ui/MemoModal';

// --- Checklist Item Sub-Component ---
interface ChecklistItemComponentProps {
  item: ChecklistItem;
  onToggle: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
  onMemoOpen: (id: string) => void;
  isDragging: boolean;
  onDragStart: (id: string, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (id: string, e: React.DragEvent) => void;
  onDragEnd: () => void;
  isEditing: boolean;
  onStartEdit: (id: string) => void;
  onEndEdit: (id: string) => void;
}

const ChecklistItemComponent: React.FC<ChecklistItemComponentProps> = ({
  item,
  onToggle,
  onEdit,
  onDelete,
  onMemoOpen,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isEditing,
  onStartEdit,
  onEndEdit
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editText, setEditText] = useState(item.text);

  useEffect(() => {
    // When editing mode is activated, focus the textarea and adjust height
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  useEffect(() => {
    // Reset edit text when item changes and not editing
    if (!isEditing) {
      setEditText(item.text);
    }
  }, [item.text, isEditing]);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    // Adjust height while typing
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleEditBlur = () => {
    // Save changes on blur
    if (editText.trim() !== item.text) {
      onEdit(item.id, editText);
    }
    onEndEdit(item.id);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      // Cancel editing without saving
      setEditText(item.text);
      onEndEdit(item.id);
    }
  };

  return (
    <div
      draggable={true}
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart(item.id, e);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDragOver(e);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop(item.id, e);
      }}
      onDragEnd={(e) => {
        e.stopPropagation();
        onDragEnd();
      }}
      className={`group flex items-start gap-3 p-3 rounded-lg border shadow-sm transition-all duration-200 cursor-move select-none ${
        isDragging ? 'opacity-50 bg-blue-50 border-blue-400' : ''
      } ${
        item.isChecked
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-md'
      }`}
    >
      <button
        draggable={false}
        onClick={() => onToggle(item.id)}
        className={`mt-0.5 flex-none transition-colors ${item.isChecked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
      >
        {item.isChecked ? <Icons.Check size={20} /> : <div className="w-[20px] h-[20px] border-2 border-current rounded-md" />}
      </button>

      {isEditing ? (
        <textarea
          draggable={false}
          ref={textareaRef}
          className="flex-1 bg-white text-sm resize-none outline-none h-auto min-h-[1.5rem] leading-relaxed py-0.5 px-2 border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onInput={handleInput}
          onBlur={handleEditBlur}
          onKeyDown={handleEditKeyDown}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          rows={1}
          placeholder="텍스트를 입력하세요..."
        />
      ) : (
        <div
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onStartEdit(item.id);
          }}
          onMouseDown={(e) => {
            if (e.detail > 1) {
              e.preventDefault();
            }
          }}
          className={`flex-1 text-sm leading-relaxed py-0.5 px-2 rounded-md cursor-text transition-colors hover:bg-gray-100 ${item.isChecked ? 'line-through text-gray-400' : 'text-gray-800 font-medium'}`}
        >
          {item.text}
        </div>
      )}

      <div draggable={false} className="flex gap-1 flex-shrink-0">
        <button
          draggable={false}
          onClick={() => onMemoOpen(item.id)}
          className={`p-2 ${item.memo ? 'text-green-500' : 'text-gray-400'} hover:text-blue-500 hover:bg-blue-50 rounded transition-all flex-shrink-0`}
          title="메모"
        >
          <Icons.Memo size={18} />
        </button>
        <button
          draggable={false}
          onClick={() => onDelete(item.id)}
          className="p-2 text-gray-400 hover:text-white hover:bg-red-600 rounded transition-all font-semibold flex-shrink-0"
          title="삭제"
        >
          <Icons.Trash size={18} />
        </button>
      </div>
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
  const [memoModalOpen, setMemoModalOpen] = useState(false);
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

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

  const handleMemoOpen = (id: string) => {
    setSelectedMemoId(id);
    setMemoModalOpen(true);
  };

  const handleMemoSave = (memo: string) => {
    if (selectedMemoId) {
      const updated = items.map(item =>
        item.id === selectedMemoId ? { ...item, memo: memo || undefined } : item
      );
      onChange(updated);
    }
    setMemoModalOpen(false);
  };

  const handleMemoDelete = () => {
    if (selectedMemoId) {
      const updated = items.map(item =>
        item.id === selectedMemoId ? { ...item, memo: undefined } : item
      );
      onChange(updated);
    }
    setMemoModalOpen(false);
  };

  const selectedItem = selectedMemoId ? items.find(item => item.id === selectedMemoId) : null;

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (id: string, e: React.DragEvent) => {
    setDraggedId(id);
    e.dataTransfer!.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer!.dropEffect = 'move';
  };

  const handleDropOnItem = (targetId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = items.findIndex(item => item.id === draggedId);
    const targetIndex = items.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    onChange(newItems);
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
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
      <div
        className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5"
        onDragOver={handleDragOver}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
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
            onMemoOpen={handleMemoOpen}
            isDragging={draggedId === item.id}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDropOnItem}
            onDragEnd={handleDragEnd}
            isEditing={editingItemId === item.id}
            onStartEdit={setEditingItemId}
            onEndEdit={() => setEditingItemId(null)}
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

      {/* Memo Modal */}
      <MemoModal
        isOpen={memoModalOpen}
        memo={selectedItem?.memo}
        onSave={handleMemoSave}
        onDelete={handleMemoDelete}
        onClose={() => setMemoModalOpen(false)}
      />
    </div>
  );
};
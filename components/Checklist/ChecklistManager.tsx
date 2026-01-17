import React, { useState, useEffect, useRef } from 'react';
import { ChecklistItem, DocumentData, generateId } from '../../types';
import { Icons } from '../ui/Icon';
import { ConfirmModal } from '../ui/ConfirmModal';
import { MemoModal } from '../ui/MemoModal';
import { DocumentSelectModal } from '../ui/DocumentSelectModal';

// --- Checklist Item Sub-Component ---
interface ChecklistItemComponentProps {
  item: ChecklistItem;
  onToggle: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
  onMemoOpen: (id: string) => void;
  onMoveClick: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  isDraggedOver: boolean;
  hasMoveTargets: boolean;
}

const ChecklistItemComponent: React.FC<ChecklistItemComponentProps> = ({ item, onToggle, onEdit, onDelete, onMemoOpen, onMoveClick, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd, onTouchStart, onTouchMove, onTouchEnd, isDragging, isDraggedOver, hasMoveTargets }) => {
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
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      data-checklist-item-id={item.id}
      className={`group flex items-start gap-3 p-3 rounded-lg border shadow-sm transition-all duration-200 ${
        item.isChecked
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-md'
      } ${
        isDragging ? 'opacity-40 cursor-grabbing' : 'cursor-grab'
      } ${
        isDraggedOver ? 'border-blue-500 border-2 bg-blue-50' : ''
      }`}
    >
      <div
        className="flex-none mt-0.5 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        title="드래그하여 순서 변경"
      >
        <Icons.DragHandle size={20} />
      </div>

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

      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={() => onMemoOpen(item.id)}
          className={`p-2 rounded transition-all flex-shrink-0 ${
            item.memo
              ? 'text-green-500 hover:text-green-600 hover:bg-green-50'
              : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
          }`}
          title="메모"
        >
          <Icons.Note size={18} />
        </button>
        <button
          onClick={() => onMoveClick(item.id)}
          disabled={!hasMoveTargets}
          className={`p-2 rounded transition-all flex-shrink-0 ${
            hasMoveTargets
              ? 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title={hasMoveTargets ? "다른 문서로 이동" : "이동 가능한 문서 없음"}
        >
          <Icons.More size={18} />
        </button>
        <button
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
  onMoveItem?: (itemId: string, targetDocId: string) => void;
  availableDocuments?: DocumentData[];
  currentDocId?: string;
}

export const ChecklistManager: React.FC<ChecklistManagerProps> = ({ items, onChange, onMoveItem, availableDocuments, currentDocId }) => {
  const [newItemText, setNewItemText] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [memoModalOpen, setMemoModalOpen] = useState(false);
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedMoveItemId, setSelectedMoveItemId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

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

    // 완료되지 않은 항목과 완료된 항목을 분리
    const unchecked = updated.filter(item => !item.isChecked);
    const checked = updated.filter(item => item.isChecked);

    // 완료되지 않은 항목들을 먼저 배치하고 완료된 항목들을 뒤에 배치
    onChange([...unchecked, ...checked]);
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

  const handleMoveClick = (itemId: string) => {
    setSelectedMoveItemId(itemId);
    setMoveModalOpen(true);
  };

  const handleMoveSelect = (targetDocId: string) => {
    if (selectedMoveItemId && onMoveItem) {
      onMoveItem(selectedMoveItemId, targetDocId);
    }
    setMoveModalOpen(false);
    setSelectedMoveItemId(null);
  };

  // Calculate available move targets
  const moveTargets = availableDocuments?.filter(
    d => d.id !== currentDocId && !d.isTemplate
  ) || [];
  const hasMoveTargets = moveTargets.length > 0 && !!onMoveItem;

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedItemId && draggedItemId !== itemId) {
      setDragOverItemId(itemId);
    }
  };

  const handleDragLeave = () => {
    setDragOverItemId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetItemId: string) => {
    e.preventDefault();

    if (!draggedItemId || draggedItemId === targetItemId) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }

    const draggedIndex = items.findIndex(item => item.id === draggedItemId);
    const targetIndex = items.findIndex(item => item.id === targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);

    onChange(newItems);
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  // --- Touch Support for Mobile ---
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, itemId: string) => {
    const touch = e.touches[0];
    const element = e.currentTarget;

    const longPressTimer = setTimeout(() => {
      setDraggedItemId(itemId);
      element.classList.add('dragging-touch');

      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);

    (element as any).longPressTimer = longPressTimer;
    (element as any).touchStartY = touch.clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!draggedItemId) return;

    const touch = e.touches[0];

    const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
    const itemElement = elementAtPoint?.closest('[data-checklist-item-id]');

    if (itemElement) {
      const targetId = itemElement.getAttribute('data-checklist-item-id');
      if (targetId && targetId !== draggedItemId) {
        setDragOverItemId(targetId);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const timer = (element as any).longPressTimer;

    if (timer) {
      clearTimeout(timer);
    }

    element.classList.remove('dragging-touch');

    if (draggedItemId && dragOverItemId && draggedItemId !== dragOverItemId) {
      const draggedIndex = items.findIndex(item => item.id === draggedItemId);
      const targetIndex = items.findIndex(item => item.id === dragOverItemId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newItems = [...items];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);
        onChange(newItems);
      }
    }

    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const selectedItem = selectedMemoId ? items.find(item => item.id === selectedMemoId) : null;

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
            onMemoOpen={handleMemoOpen}
            onMoveClick={handleMoveClick}
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, item.id)}
            onDragEnd={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, item.id)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            isDragging={draggedItemId === item.id}
            isDraggedOver={dragOverItemId === item.id}
            hasMoveTargets={hasMoveTargets}
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

      {/* Document Select Modal */}
      {onMoveItem && availableDocuments && currentDocId && (
        <DocumentSelectModal
          isOpen={moveModalOpen}
          documents={availableDocuments}
          currentDocId={currentDocId}
          onSelect={handleMoveSelect}
          onClose={() => {
            setMoveModalOpen(false);
            setSelectedMoveItemId(null);
          }}
        />
      )}
    </div>
  );
};
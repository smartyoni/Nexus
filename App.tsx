import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Icons } from './components/ui/Icon';
import { SplitEditor } from './components/Editor/SplitEditor';
import { DocumentDrawer } from './components/DocumentDrawer/DocumentDrawer';
import { DocumentData, ViewMode, generateId, ChecklistItem, Tab } from './types';
import { storageService } from './services/storageService';
import { migrationService } from './services/migrationService';
import { tabMigrationService } from './services/tabMigrationService';
import { tabDeduplicationService } from './services/tabDeduplicationService';
import { ConfirmModal } from './components/ui/ConfirmModal';

const MD_BREAKPOINT = 768; // Tailwind의 'md' breakpoint

const App: React.FC = () => {
  // 화면 크기 추적
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // --- Helper ---
  const createBlankDocument = (tabId: string): DocumentData => ({
    id: generateId(),
    title: '',
    checklist: [],
    updatedAt: Date.now(),
    tabId
  });

  // --- State ---
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('EDITOR');

  // Tab Management State
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Initialize with a blank document so the user can type immediately
  const [activeDocument, setActiveDocument] = useState<DocumentData | null>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'DOC', id: string } | null>(null);

  // Favorite Document State
  const [favoriteDocId, setFavoriteDocId] = useState<string | null>(null);

  // Auto-save related states
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Toast message state
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);
  const refreshMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Initial Load ---
  useEffect(() => {
    const loadData = async () => {
      // Ensure single IN-BOX tab
      await tabMigrationService.ensureSingleInboxTab();

      // Load tabs
      const loadedTabs = await storageService.getTabs();
      setTabs(loadedTabs);

      // Get IN-BOX tab ID
      const inboxTab = loadedTabs.find(t => t.isDefault === true);
      const inboxTabId = inboxTab?.id || '';

      if (inboxTabId) {
        setActiveTabId(inboxTabId);
        await storageService.setCurrentTabId(inboxTabId);
      }

      // Load documents
      const docs = await storageService.getDocuments();
      setDocuments(docs);

      // Load favorite document
      const favId = await storageService.getFavoriteDocId();
      setFavoriteDocId(favId);

      // Set active document to favorite if exists, otherwise blank
      if (favId && docs.length > 0) {
        const favDoc = docs.find(d => d.id === favId);
        if (favDoc) {
          setActiveDocument(favDoc);
        } else {
          setActiveDocument(inboxTabId ? createBlankDocument(inboxTabId) : null);
        }
      } else {
        setActiveDocument(inboxTabId ? createBlankDocument(inboxTabId) : null);
      }
    };
    loadData();
  }, []);

  // --- Refresh Data (without page reload) ---
  const refreshData = useCallback(async () => {
    console.log('🔄 Refresh started');

    // Show refresh message
    setShowRefreshMessage(true);

    // Clear any existing timeout
    if (refreshMessageTimeoutRef.current) {
      clearTimeout(refreshMessageTimeoutRef.current);
    }

    // Hide message after 2 seconds
    refreshMessageTimeoutRef.current = setTimeout(() => {
      setShowRefreshMessage(false);
    }, 2000);

    try {
      const docs = await storageService.getDocuments();
      console.log('📄 Documents loaded:', docs.length);
      setDocuments(docs);

      // Update current activeDocument if it exists
      if (activeDocument) {
        const updated = docs.find(d => d.id === activeDocument.id);
        if (updated) {
          console.log('✅ Active document updated');
          setActiveDocument(updated);
        }
      }
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    }
  }, [activeDocument]);

  // --- Auto-save with Debounce ---
  const autoSaveDocument = async (doc: DocumentData) => {
    // 빈 문서는 자동 저장 하지 않음
    if (!doc.id || (!doc.title && !doc.content && doc.checklist.length === 0)) return;

    const docString = JSON.stringify(doc);

    // 내용이 변경되지 않았으면 저장하지 않음
    if (lastSavedRef.current === docString) return;

    setIsSaving(true);

    try {
      // 기존 문서 업데이트 또는 새 문서 추가
      const exists = documents.find(d => d.id === doc.id);
      let newDocs;
      if (exists) {
        newDocs = documents.map(d => d.id === doc.id ? { ...doc, updatedAt: Date.now() } : d);
      } else {
        newDocs = [doc, ...documents];
      }

      setDocuments(newDocs);
      await storageService.saveDocuments(newDocs);
      lastSavedRef.current = docString;
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounce auto-save: activeDocument 변경 후 2초 후 저장
  useEffect(() => {
    if (!activeDocument) return;

    // 기존 타이머 취소
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // 새로운 타이머 설정 (2초 debounce)
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveDocument(activeDocument);
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [activeDocument?.title, activeDocument?.content, activeDocument?.checklist]);

  // --- Actions ---

  // 1. Create New Blank Document
  const createNewDocument = () => {
    if (activeTabId) {
      setActiveDocument(createBlankDocument(activeTabId));
      setViewMode('EDITOR');
    }
  };

  // Create New Document with initial content
  const handleCreateNewWithContent = (content: string) => {
    if (activeTabId) {
      const newDoc = {
        ...createBlankDocument(activeTabId),
        content: content.trim()
      };
      setActiveDocument(newDoc);
      setViewMode('EDITOR');
    }
  };

  // 2. Save Logic
  const handleSave = async (data: DocumentData) => {
    // Saving a Document
    const exists = documents.find(d => d.id === data.id);
    let newDocs;
    if (exists) {
      newDocs = documents.map(d => d.id === data.id ? { ...data, updatedAt: Date.now() } : d);
    } else {
      // If title is empty, provide a default
      if (!data.title.trim()) {
        data.title = '무제 (Untitled)';
      }
      newDocs = [data, ...documents];
    }
    setDocuments(newDocs);
    await storageService.saveDocuments(newDocs);
    setActiveDocument(data);
  };

  // --- Backup/Restore Logic ---

  const handleBackup = async () => {
    const backupData = await storageService.exportData();
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    link.download = `템플릿백업${year}년${month}월${day}일.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        const result = await storageService.importData(data);

        if (result.success) {
          // Update state
          const docs = await storageService.getDocuments();
          setDocuments(docs);
          alert(result.message);
        } else {
          alert(result.message);
        }
      } catch (e) {
        alert(`파일 읽기 오류: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
      }
    };
    reader.readAsText(file);
  };

  // --- Delete Logic with Modal ---

  const requestDeleteDocument = (id: string) => {
    setDeleteTarget({ type: 'DOC', id });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;

    const id = deleteTarget.id;
    const newDocs = documents.filter(d => d.id !== id);
    setDocuments(newDocs);
    await storageService.saveDocuments(newDocs);
    await storageService.deleteDocument(id);

    // 즐겨찾기 문서가 삭제되면 즐겨찾기 초기화
    if (favoriteDocId === id) {
      await storageService.clearFavoriteDocId();
      setFavoriteDocId(null);
    }

    if (activeDocument?.id === id) {
      // If we deleted the current doc, reset to blank
      setActiveDocument(createBlankDocument());
    }

    setDeleteTarget(null);
  };

  // --- Favorite Document ---
  const handleSetFavoriteDocument = async (id: string) => {
    await storageService.setFavoriteDocId(id);
    setFavoriteDocId(id);
  };

  const handleClearFavoriteDocument = async () => {
    await storageService.clearFavoriteDocId();
    setFavoriteDocId(null);
  };

  // --- Reorder Documents ---
  const handleReorderDocuments = async (reorderedDocs: DocumentData[]) => {
    setDocuments(reorderedDocs);
    await storageService.saveDocuments(reorderedDocs);
  };

  // --- Move Item to Another Document ---
  const handleMoveItem = async (itemId: string, targetDocId: string) => {
    try {
      // Templates cannot move items
      if (!activeDocument || activeDocument.isTemplate) return;

      const sourceDocId = activeDocument.id;

      // Prevent moving to same document
      if (sourceDocId === targetDocId) return;

      // Find the item to move
      const itemToMove = activeDocument.checklist.find(item => item.id === itemId);
      if (!itemToMove) return;

      // Find the target document
      const targetDoc = documents.find(d => d.id === targetDocId);
      if (!targetDoc || targetDoc.isTemplate) return;

      // Remove item from source checklist
      const updatedSourceChecklist = activeDocument.checklist.filter(
        item => item.id !== itemId
      );

      // Create moved item with new ID (preserving memo and check state)
      const movedItem: ChecklistItem = {
        ...itemToMove,
        id: generateId()
      };

      // Add item to target document's checklist
      const updatedTargetChecklist = [...targetDoc.checklist, movedItem];

      // Update source document
      const updatedSourceDoc: DocumentData = {
        ...activeDocument,
        checklist: updatedSourceChecklist,
        updatedAt: Date.now()
      };

      // Update target document
      const updatedTargetDoc: DocumentData = {
        ...targetDoc,
        checklist: updatedTargetChecklist,
        updatedAt: Date.now()
      };

      // Update documents array
      const newDocs = documents.map(d => {
        if (d.id === sourceDocId) return updatedSourceDoc;
        if (d.id === targetDocId) return updatedTargetDoc;
        return d;
      });

      // Save and update state
      setDocuments(newDocs);
      await storageService.saveDocuments(newDocs);

      // Update active document to reflect the change
      setActiveDocument(updatedSourceDoc);
    } catch (error) {
      console.error('Failed to move item:', error);
      alert('항목 이동 중 오류가 발생했습니다.');
    }
  };

  // --- Open Document Drawer ---
  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background font-sans text-gray-900">
      {/* Refresh Message Toast */}
      {showRefreshMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg font-semibold animate-bounce">
          인사이트부동산 대박
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <SplitEditor
          data={activeDocument || (activeTabId ? createBlankDocument(activeTabId) : null)}
          onSave={handleSave}
          screenWidth={screenWidth}
          mdBreakpoint={MD_BREAKPOINT}
          onCancel={() => {
            if (activeTabId) {
              setActiveDocument(createBlankDocument(activeTabId));
            }
            setViewMode('EDITOR');
          }}
          onMoveItem={handleMoveItem}
          availableDocuments={documents}
          isSaving={isSaving}
          onContentChange={(content) => {
            setActiveDocument(prev => prev ? { ...prev, content } : null);
          }}
          onRefresh={refreshData}
          onGoBack={() => setIsDrawerOpen(true)}
        />
      </main>

      {/* Document Drawer */}
      <DocumentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        documents={documents}
        activeTabId={activeTabId}
        favoriteDocId={favoriteDocId}
        onSelectDocument={(doc) => {
          setActiveDocument(doc);
          setViewMode('EDITOR');
        }}
        onCreateNew={createNewDocument}
        onCreateNewWithContent={handleCreateNewWithContent}
        onDeleteDocument={requestDeleteDocument}
        onSetFavoriteDocument={handleSetFavoriteDocument}
        onClearFavoriteDocument={handleClearFavoriteDocument}
        onReorderDocuments={handleReorderDocuments}
        onRefresh={refreshData}
      />

      {/* Global Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="문서 삭제"
        message="이 문서를 영구적으로 삭제하시겠습니까?"
        onConfirm={executeDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default App;
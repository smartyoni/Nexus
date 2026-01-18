import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Icons } from './components/ui/Icon';
import { SidebarMenu } from './components/Sidebar/SidebarMenu';
import { SplitEditor } from './components/Editor/SplitEditor';
import { DocumentData, ViewMode, generateId, ChecklistItem, DocumentCategory } from './types';
import { storageService } from './services/storageService';
import { migrationService } from './services/migrationService';
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
  const createBlankDocument = (category: DocumentCategory = '업무'): DocumentData => ({
    id: generateId(),
    title: '',
    checklist: [],
    updatedAt: Date.now(),
    category
  });

  // --- State ---
  const [documents, setDocuments] = useState<DocumentData[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(screenWidth >= MD_BREAKPOINT);
  const [viewMode, setViewMode] = useState<ViewMode>('EDITOR');

  // Initialize with a blank document so the user can type immediately
  const [activeDocument, setActiveDocument] = useState<DocumentData | null>(() => createBlankDocument());

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'DOC', id: string } | null>(null);

  // Favorite Document State
  const [favoriteDocId, setFavoriteDocId] = useState<string | null>(null);

  // Current Category State
  const [currentCategory, setCurrentCategory] = useState<DocumentCategory>('업무');

  // Auto-save related states
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // --- Initial Load ---
  useEffect(() => {
    const loadData = async () => {
      // 기존 localStorage 데이터를 Firestore로 이전 (최초 1회만)
      await migrationService.migrateToFirestore();

      // 데이터 로드
      const docs = await storageService.getDocuments();
      const favId = await storageService.getFavoriteDocId();

      // category 필드가 없는 기존 문서는 '업무'로 기본 설정
      const migratedDocs = docs.map(doc => ({
        ...doc,
        category: doc.category || '업무' as DocumentCategory
      }));

      setDocuments(migratedDocs);
      setFavoriteDocId(favId);

      // 즐겨찾기 문서가 있으면 로드
      if (favId && migratedDocs.length > 0) {
        const favDoc = migratedDocs.find(d => d.id === favId);
        if (favDoc) {
          setActiveDocument(favDoc);
        }
      }
    };
    loadData();
  }, []);

  // --- Auto-save with Debounce ---
  const autoSaveDocument = async (doc: DocumentData) => {
    // 빈 문서는 자동 저장 하지 않음
    if (!doc.id || (!doc.title && doc.checklist.length === 0)) return;

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
  }, [activeDocument?.title, activeDocument?.checklist]);

  // --- Actions ---

  // 1. Create New Blank Document
  const createNewDocument = () => {
    setActiveDocument(createBlankDocument(currentCategory));
    setViewMode('EDITOR');
    if (screenWidth < MD_BREAKPOINT) setIsSidebarOpen(false);
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

  // --- Change Document Category ---
  const handleChangeCategoryDocument = async (id: string, category: DocumentCategory) => {
    const updatedDocs = documents.map(doc =>
      doc.id === id ? { ...doc, category, updatedAt: Date.now() } : doc
    );
    setDocuments(updatedDocs);
    await storageService.saveDocuments(updatedDocs);

    // 활성 문서가 변경된 경우 업데이트
    if (activeDocument?.id === id) {
      setActiveDocument({ ...activeDocument, category });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-gray-900">
      
      {/* Sidebar Menu Overlay */}
      <SidebarMenu
        isMobileOpen={isSidebarOpen}
        isAlwaysOpen={screenWidth >= MD_BREAKPOINT}
        onClose={() => setIsSidebarOpen(false)}
        documents={documents}
        favoriteDocId={favoriteDocId}
        currentCategory={currentCategory}
        onCategoryChange={setCurrentCategory}
        onSelectDocument={(doc) => {
          setActiveDocument(doc);
          setViewMode('EDITOR');
          if (screenWidth < MD_BREAKPOINT) setIsSidebarOpen(false);
        }}
        onCreateNew={() => {
          createNewDocument();
          if (screenWidth < MD_BREAKPOINT) setIsSidebarOpen(false);
        }}
        onDeleteDocument={requestDeleteDocument}
        onBackup={handleBackup}
        onRestore={handleRestore}
        onSetFavoriteDocument={handleSetFavoriteDocument}
        onClearFavoriteDocument={handleClearFavoriteDocument}
        onReorderDocuments={handleReorderDocuments}
        onChangeCategoryDocument={handleChangeCategoryDocument}
      />

      {/* Main Content Area */}
      <main
        className="flex-1 h-full transition-all duration-300 ease-in-out"
        style={{ marginLeft: screenWidth >= MD_BREAKPOINT && isSidebarOpen ? '250px' : '0px' }}
      >
        <SplitEditor
          data={activeDocument || createBlankDocument()}
          onSave={handleSave}
          screenWidth={screenWidth}
          mdBreakpoint={MD_BREAKPOINT}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onCancel={() => {
            setActiveDocument(createBlankDocument());
            setViewMode('EDITOR');
          }}
          onMoveItem={handleMoveItem}
          availableDocuments={documents}
          isSaving={isSaving}
        />
      </main>

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
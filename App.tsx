import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Icons } from './components/ui/Icon';
import { SidebarMenu } from './components/Sidebar/SidebarMenu';
import { SplitEditor } from './components/Editor/SplitEditor';
import { DocumentData, ViewMode, generateId, ChecklistItem } from './types';
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
  const createBlankDocument = (): DocumentData => ({
    id: generateId(),
    title: '',
    checklist: [],
    updatedAt: Date.now(),
    isTemplate: false
  });

  // --- State ---
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [templates, setTemplates] = useState<DocumentData[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(screenWidth >= MD_BREAKPOINT);
  const [viewMode, setViewMode] = useState<ViewMode>('EDITOR');

  // Initialize with a blank document so the user can type immediately
  const [activeDocument, setActiveDocument] = useState<DocumentData | null>(() => createBlankDocument());

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'DOC' | 'TPL', id: string } | null>(null);

  // Track source template ID when in TEMPLATE_PREVIEW mode
  const [sourceTemplateId, setSourceTemplateId] = useState<string | null>(null);

  // Favorite Document State
  const [favoriteDocId, setFavoriteDocId] = useState<string | null>(null);

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
      const tpls = await storageService.getTemplates();
      const favId = await storageService.getFavoriteDocId();

      setDocuments(docs);
      setTemplates(tpls);
      setFavoriteDocId(favId);

      // 즐겨찾기 문서가 있으면 로드
      if (favId && docs.length > 0) {
        const favDoc = docs.find(d => d.id === favId);
        if (favDoc) {
          setActiveDocument(favDoc);
        }
      }
    };
    loadData();
  }, []);

  // --- Auto-save with Debounce ---
  const autoSaveDocument = async (doc: DocumentData) => {
    // Template은 자동 저장 하지 않음 (명시적 저장만)
    if (doc.isTemplate) return;

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
    setActiveDocument(createBlankDocument());
    setViewMode('EDITOR');
    if (screenWidth < MD_BREAKPOINT) setIsSidebarOpen(false);
  };

  // 2. Create Document From Template
  const createFromTemplate = (template: DocumentData) => {
    const newDoc: DocumentData = {
      id: generateId(),
      title: `${template.title}`,
      // Deep copy checklist to avoid reference issues
      checklist: template.checklist.map(item => ({...item, id: generateId(), isChecked: false})),
      updatedAt: Date.now(),
      isTemplate: false
    };
    setActiveDocument(newDoc);
    setViewMode('EDITOR');
  };

  // 2-1. Template Preview Mode (view and edit template, save as new document)
  const handleTemplatePreview = (template: DocumentData) => {
    const previewDoc: DocumentData = {
      id: generateId(),
      title: template.title,
      checklist: template.checklist.map(item => ({
        ...item,
        id: generateId(),
        isChecked: false
      })),
      updatedAt: Date.now(),
      isTemplate: false
    };

    setActiveDocument(previewDoc);
    setViewMode('TEMPLATE_PREVIEW');
    setSourceTemplateId(template.id);
  };

  // 2-2. Template Original Edit Mode (edit template original)
  const handleEditTemplateOriginal = (template: DocumentData) => {
    setActiveDocument(template);
    setViewMode('EDITOR');
    setSourceTemplateId(null);
  };

  // 2-3. Create New Template
  const handleCreateTemplate = () => {
    const newTemplate: DocumentData = {
      id: generateId(),
      title: '',
      checklist: [],
      updatedAt: Date.now(),
      isTemplate: true
    };
    setActiveDocument(newTemplate);
    setViewMode('EDITOR');
    setSourceTemplateId(null);
  };

  // 3. Save Logic
  const handleSave = async (data: DocumentData) => {
    if (data.isTemplate) {
      // Saving a Template (original template edit mode)
      // Provide default title if empty
      if (!data.title.trim()) {
        data.title = '무제 템플릿';
      }

      const exists = templates.find(t => t.id === data.id);
      let newTemplates;
      if (exists) {
        newTemplates = templates.map(t => t.id === data.id ? { ...data, isTemplate: true } : t);
      } else {
        newTemplates = [{ ...data, isTemplate: true }, ...templates];
      }
      setTemplates(newTemplates);
      await storageService.saveTemplates(newTemplates);
      setActiveDocument(data);

    } else if (viewMode === 'TEMPLATE_PREVIEW') {
      // Saving in Template Preview Mode → save as new document
      const newDoc: DocumentData = {
        ...data,
        id: generateId(), // Generate new ID
        isTemplate: false,
        updatedAt: Date.now()
      };

      // If title is empty, provide a default
      if (!newDoc.title.trim() && sourceTemplateId) {
        const sourceTemplate = templates.find(t => t.id === sourceTemplateId);
        newDoc.title = sourceTemplate ? `${sourceTemplate.title} (사본)` : '무제 (Untitled)';
      } else if (!newDoc.title.trim()) {
        newDoc.title = '무제 (Untitled)';
      }

      const newDocs = [newDoc, ...documents];
      setDocuments(newDocs);
      await storageService.saveDocuments(newDocs);

      // Switch to EDITOR mode after saving
      setActiveDocument(newDoc);
      setViewMode('EDITOR');
      setSourceTemplateId(null);

    } else {
      // Saving a Document (standard EDITOR mode)
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
    }
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
          const tpls = await storageService.getTemplates();
          setDocuments(docs);
          setTemplates(tpls);
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

  const requestDeleteTemplate = (id: string) => {
    setDeleteTarget({ type: 'TPL', id });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'DOC') {
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
    } else {
      const id = deleteTarget.id;
      const newTemplates = templates.filter(t => t.id !== id);
      setTemplates(newTemplates);
      await storageService.saveTemplates(newTemplates);
      await storageService.deleteTemplate(id);
      if (activeDocument?.id === id) {
        setActiveDocument(null);
      }
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

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-gray-900">
      
      {/* Sidebar Menu Overlay */}
      <SidebarMenu
        isMobileOpen={isSidebarOpen}
        isAlwaysOpen={screenWidth >= MD_BREAKPOINT}
        onClose={() => setIsSidebarOpen(false)}
        documents={documents}
        templates={templates}
        favoriteDocId={favoriteDocId}
        onSelectDocument={(doc) => {
          setActiveDocument(doc);
          setViewMode('EDITOR');
          if (screenWidth < MD_BREAKPOINT) setIsSidebarOpen(false);
        }}
        onPreviewTemplate={handleTemplatePreview}
        onCreateTemplate={handleCreateTemplate}
        onCreateNew={() => {
          createNewDocument();
          if (screenWidth < MD_BREAKPOINT) setIsSidebarOpen(false);
        }}
        onDeleteDocument={requestDeleteDocument}
        onDeleteTemplate={requestDeleteTemplate}
        onEditTemplate={handleEditTemplateOriginal}
        onBackup={handleBackup}
        onRestore={handleRestore}
        onSetFavoriteDocument={handleSetFavoriteDocument}
        onClearFavoriteDocument={handleClearFavoriteDocument}
        onReorderDocuments={handleReorderDocuments}
      />

      {/* Main Content Area */}
      <main
        className="flex-1 h-full transition-all duration-300 ease-in-out"
        style={{ marginLeft: screenWidth >= MD_BREAKPOINT && isSidebarOpen ? '250px' : '0px' }}
      >
        {viewMode === 'TEMPLATE_PREVIEW' ? (
          // Template Preview Mode (view and edit template, save as new document)
          <SplitEditor
            data={activeDocument || createBlankDocument()}
            onSave={handleSave}
            isTemplateMode={false}
            isTemplatePreview={true}
            sourceTemplateName={templates.find(t => t.id === sourceTemplateId)?.title || '템플릿'}
            screenWidth={screenWidth}
            mdBreakpoint={MD_BREAKPOINT}
            onCancel={() => {
              setViewMode('EDITOR');
              setActiveDocument(createBlankDocument());
              setSourceTemplateId(null);
            }}
            onMoveItem={handleMoveItem}
            availableDocuments={documents}
            isSaving={isSaving}
          />
        ) : (
          // Standard Editor View (for both documents and templates)
          <SplitEditor
            data={activeDocument || createBlankDocument()}
            onSave={handleSave}
            isTemplateMode={activeDocument?.isTemplate || false}
            isTemplatePreview={false}
            screenWidth={screenWidth}
            mdBreakpoint={MD_BREAKPOINT}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onCancel={() => {
              setActiveDocument(createBlankDocument());
              setViewMode('EDITOR');
            }}
            onMoveItem={activeDocument?.isTemplate ? undefined : handleMoveItem}
            availableDocuments={documents}
            isSaving={isSaving}
          />
        )}
      </main>

      {/* Global Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === 'DOC' ? '문서 삭제' : '템플릿 삭제'}
        message={deleteTarget?.type === 'DOC' ? '이 문서를 영구적으로 삭제하시겠습니까?' : '이 템플릿을 삭제하시겠습니까?'}
        onConfirm={executeDelete}
        onClose={() => setDeleteTarget(null)}
      />

    </div>
  );
};

export default App;
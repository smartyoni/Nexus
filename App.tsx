import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Icons } from './components/ui/Icon';
import { SidebarMenu } from './components/Sidebar/SidebarMenu';
import { SplitEditor } from './components/Editor/SplitEditor';
import { DocumentData, ViewMode, generateId } from './types';
import { storageService } from './services/storageService';
import { migrationService } from './services/migrationService';
import { ConfirmModal } from './components/ui/ConfirmModal';

const MD_BREAKPOINT = 768; // Tailwind의 'md' breakpoint

// Helper function to get category label
const getCategoryLabel = (category: 'task' | 'contract' | 'jangeeum' | 'dailyNote'): string => {
  const labels = {
    task: '업무',
    contract: '계약',
    jangeeum: '잔금',
    dailyNote: '일상'
  };
  return labels[category];
};

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
    content: '',
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

  // --- Initial Load ---
  useEffect(() => {
    const loadData = async () => {
      // 기존 localStorage 데이터를 Firestore로 이전 (최초 1회만)
      await migrationService.migrateToFirestore();

      // 템플릿 카테고리 마이그레이션 (최초 1회만)
      await migrationService.migrateTemplateCategories();

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

  // --- Actions ---

  // 1. Create New Blank Document (Task)
  const createNewDocument = () => {
    // Try to find task template
    const taskTemplate = templates.find(t => t.templateCategory === 'task');

    if (taskTemplate) {
      createFromTemplate(taskTemplate);
    } else {
      const newDoc = createBlankDocument();
      setActiveDocument(newDoc);
      setDocuments(prev => [newDoc, ...prev]);
      setViewMode('EDITOR');
    }

    if (screenWidth < MD_BREAKPOINT) setIsSidebarOpen(false);
  };

  // 2. Create Document From Template
  const createFromTemplate = (template: DocumentData) => {
    const newDoc: DocumentData = {
      id: generateId(),
      title: `${template.title}`,
      content: template.content,
      // Deep copy checklist to avoid reference issues
      checklist: template.checklist.map(item => ({...item, id: generateId(), isChecked: false})),
      updatedAt: Date.now(),
      isTemplate: false,
      isDailyNote: template.templateCategory === 'dailyNote',
      isContract: template.templateCategory === 'contract',
      isJangeuum: template.templateCategory === 'jangeuum'
    };
    setActiveDocument(newDoc);
    setViewMode('EDITOR');
    // 새로 생성된 문서를 documents 배열에 추가
    setDocuments(prev => [newDoc, ...prev]);
  };

  // 2-1. Template Preview Mode (view and edit template, save as new document)
  const handleTemplatePreview = (template: DocumentData) => {
    const previewDoc: DocumentData = {
      id: generateId(),
      title: template.title,
      content: template.content,
      checklist: template.checklist.map(item => ({
        ...item,
        id: generateId(),
        isChecked: false
      })),
      updatedAt: Date.now(),
      isTemplate: false,
      isDailyNote: template.templateCategory === 'dailyNote',
      isContract: template.templateCategory === 'contract',
      isJangeuum: template.templateCategory === 'jangeuum'
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
      content: '',
      checklist: [],
      updatedAt: Date.now(),
      isTemplate: true,
      templateCategory: 'task'
    };
    setActiveDocument(newTemplate);
    setViewMode('EDITOR');
    setSourceTemplateId(null);
  };

  // 2-4. Create New Daily Note
  const handleCreateDailyNote = () => {
    // Try to find daily note template
    const dailyNoteTemplate = templates.find(t => t.templateCategory === 'dailyNote');

    if (dailyNoteTemplate) {
      createFromTemplate(dailyNoteTemplate);
    } else {
      const newDoc = {
        id: generateId(),
        title: '',
        content: '',
        checklist: [],
        updatedAt: Date.now(),
        isTemplate: false,
        isDailyNote: true
      };
      setActiveDocument(newDoc);
      setDocuments(prev => [newDoc, ...prev]);
      setViewMode('EDITOR');
    }

    if (screenWidth < MD_BREAKPOINT) setIsSidebarOpen(false);
  };

  // 2-5. Create New Contract
  const handleCreateContract = () => {
    // Try to find contract template
    const contractTemplate = templates.find(t => t.templateCategory === 'contract');

    if (contractTemplate) {
      createFromTemplate(contractTemplate);
    } else {
      const newDoc = {
        id: generateId(),
        title: '',
        content: '',
        checklist: [],
        updatedAt: Date.now(),
        isTemplate: false,
        isContract: true
      };
      setActiveDocument(newDoc);
      setDocuments(prev => [newDoc, ...prev]);
      setViewMode('EDITOR');
    }

    if (screenWidth < MD_BREAKPOINT) setIsSidebarOpen(false);
  };

  // 2-6. Create New Jangeuum (Deposit)
  const handleCreateJangeuum = () => {
    // Try to find jangeuum template
    const jangeumTemplate = templates.find(t => t.templateCategory === 'jangeeum');

    if (jangeumTemplate) {
      createFromTemplate(jangeumTemplate);
    } else {
      const newDoc = {
        id: generateId(),
        title: '',
        content: '',
        checklist: [],
        updatedAt: Date.now(),
        isTemplate: false,
        isJangeuum: true
      };
      setActiveDocument(newDoc);
      setDocuments(prev => [newDoc, ...prev]);
      setViewMode('EDITOR');
    }

    if (screenWidth < MD_BREAKPOINT) setIsSidebarOpen(false);
  };

  // 3. Save Logic
  const handleSave = async (data: DocumentData) => {
    if (data.isTemplate) {
      // Saving a Template (original template edit mode)
      // Provide default title if empty
      if (!data.title.trim()) {
        data.title = '무제 템플릿';
      }

      // Set default template category
      const category = data.templateCategory || 'task';
      data.templateCategory = category;

      // Check if template with same category exists
      const existingByCategoryId = templates.find(
        t => t.templateCategory === category && t.id !== data.id
      );

      let newTemplates: DocumentData[];

      if (existingByCategoryId) {
        // Confirm replacement with user
        const confirmReplace = window.confirm(
          `이미 "${getCategoryLabel(category)}" 카테고리의 템플릿이 존재합니다.\n기존 템플릿을 교체하시겠습니까?`
        );

        if (!confirmReplace) {
          return; // Cancel operation
        }

        // Delete existing template from storage
        await storageService.deleteTemplate(existingByCategoryId.id);

        // Remove old template and add new one
        newTemplates = templates.filter(t => t.id !== existingByCategoryId.id);

        const exists = newTemplates.find(t => t.id === data.id);
        if (exists) {
          newTemplates = newTemplates.map(t => t.id === data.id ? { ...data, isTemplate: true } : t);
        } else {
          newTemplates = [{ ...data, isTemplate: true }, ...newTemplates];
        }
      } else {
        // No conflicting template, proceed with save
        const exists = templates.find(t => t.id === data.id);
        if (exists) {
          newTemplates = templates.map(t => t.id === data.id ? { ...data, isTemplate: true } : t);
        } else {
          newTemplates = [{ ...data, isTemplate: true }, ...templates];
        }
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

  const handleReorderTemplates = async (reorderedTpls: DocumentData[]) => {
    setTemplates(reorderedTpls);
    await storageService.saveTemplates(reorderedTpls);
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
        onCreateDailyNote={() => {
          handleCreateDailyNote();
          if (screenWidth < MD_BREAKPOINT) setIsSidebarOpen(false);
        }}
        onCreateContract={() => {
          handleCreateContract();
          if (screenWidth < MD_BREAKPOINT) setIsSidebarOpen(false);
        }}
        onCreateJangeuum={() => {
          handleCreateJangeuum();
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
        onReorderTemplates={handleReorderTemplates}
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
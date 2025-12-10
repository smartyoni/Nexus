import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Icons } from './components/ui/Icon';
import { SidebarMenu } from './components/Sidebar/SidebarMenu';
import { SplitEditor } from './components/Editor/SplitEditor';
import { DocumentData, ViewMode, generateId } from './types';
import { storageService } from './services/storageService';
import { ConfirmModal } from './components/ui/ConfirmModal';

const MD_BREAKPOINT = 768; // Tailwind's 'md' breakpoint

const App: React.FC = () => {
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

  // --- Initial Load ---
  useEffect(() => {
    const loadData = async () => {
      setDocuments(await storageService.getDocuments());
      setTemplates(await storageService.getTemplates());
    };
    loadData();
  }, []);

  // --- Actions ---

  // 1. Create New Blank Document
  const createNewDocument = () => {
    setActiveDocument(createBlankDocument());
    setViewMode('EDITOR');
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
      content: template.content,
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
      content: '',
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
    }
    setActiveDocument(data); // Ensure active document is updated after save
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

  const handleRestore = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        const result = await storageService.importData(data); // Await the importData

        if (result.success) {
          // Update state
          setDocuments(await storageService.getDocuments());
          setTemplates(await storageService.getTemplates());
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
      await storageService.saveDocuments(newDocs); // Await save
      if (activeDocument?.id === id) {
        // If we deleted the current doc, reset to blank
        setActiveDocument(createBlankDocument());
      }
    } else {
      const id = deleteTarget.id;
      const newTemplates = templates.filter(t => t.id !== id);
      setTemplates(newTemplates);
      await storageService.saveTemplates(newTemplates); // Await save
      if (activeDocument?.id === id) {
        setActiveDocument(null);
      }
    }
    setDeleteTarget(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-gray-900">
      
      {/* Responsive Sidebar */}
      <SidebarMenu
        isMobileOpen={isSidebarOpen}
        isAlwaysOpen={screenWidth >= MD_BREAKPOINT}
        onClose={() => setIsSidebarOpen(false)}
        documents={documents}
        templates={templates}
        onSelectDocument={(doc) => {
          setActiveDocument(doc);
          setViewMode('EDITOR');
          if (screenWidth < MD_BREAKPOINT) setIsSidebarOpen(false); // Close sidebar on mobile after selection
        }}
        onPreviewTemplate={handleTemplatePreview}
        onCreateTemplate={handleCreateTemplate}
        onCreateNew={() => {
          createNewDocument();
          if (screenWidth < MD_BREAKPOINT) setIsSidebarOpen(false); // Close sidebar on mobile after creation
        }}
        onDeleteDocument={requestDeleteDocument}
        onDeleteTemplate={requestDeleteTemplate}
        onEditTemplate={handleEditTemplateOriginal}
        onBackup={handleBackup}
        onRestore={handleRestore}
      />

      {/* Main Content Area */}
      <main 
        className={`flex-1 h-full transition-all duration-300 ease-in-out`}
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
            onCancel={() => {
              setViewMode('EDITOR');
              setActiveDocument(createBlankDocument());
              setSourceTemplateId(null);
            }}
            screenWidth={screenWidth}
            mdBreakpoint={MD_BREAKPOINT}
          />
        ) : (
          // Standard Editor View (for both documents and templates)
          <SplitEditor
            data={activeDocument || createBlankDocument()}
            onSave={handleSave}
            isTemplateMode={activeDocument?.isTemplate || false}
            isTemplatePreview={false}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onCancel={() => {
              setActiveDocument(createBlankDocument());
              setViewMode('EDITOR');
            }}
            screenWidth={screenWidth}
            mdBreakpoint={MD_BREAKPOINT}
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
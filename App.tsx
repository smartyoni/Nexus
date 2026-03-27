import React, { useEffect, useState } from 'react';
import { SplitEditor } from './components/Editor/SplitEditor';
import { AppNavbar } from './components/layout/AppNavbar';
import { DocumentList } from './components/Editor/DocumentList';
import { DocumentToC } from './components/Editor/DocumentToC';
import { useDocumentManagement } from './hooks/useDocumentManagement';

/**
 * App 오케스트레이터 (Light Theme)
 */
const App: React.FC = () => {
  const docs = useDocumentManagement();

  useEffect(() => {
    docs.initialize();
  }, []);

  // 터치 스와이프 상태
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && docs.viewMode === 'list') {
      docs.setViewMode('detail');
    }
    if (isRightSwipe && docs.viewMode === 'detail') {
      docs.setViewMode('list');
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div 
      className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans text-slate-900"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AppNavbar
        viewMode={docs.viewMode}
        onViewModeChange={docs.setViewMode}
        onAddDocument={docs.createNewDocument}
      />

      <main className="flex-1 overflow-hidden relative">
        {docs.viewMode === 'list' && (
          <DocumentList
            documents={docs.allDocuments}
            onSelect={(id) => {
              docs.selectDocument(id);
            }}
            onDelete={docs.deleteDocument}
          />
        )}

        {docs.viewMode === 'detail' && (
          docs.activeDocument ? (
            <SplitEditor
              data={docs.activeDocument}
              currentPageIndex={docs.currentPageIndex}
              scrollTarget={docs.scrollTarget}
              onSave={docs.saveDocument}
              isSaving={docs.isSaving}
              isEditing={docs.isEditing}
              setIsEditing={docs.setIsEditing}
              onContentChange={(content) => docs.updateContent(content)}
              onAddPage={docs.addPage}
              onRemovePage={docs.removePage}
              onSwitchPage={docs.switchPage}
              onPageTitleChange={docs.updatePageTitle}
              onDeleteDocument={docs.deleteDocument}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50">
              <div className="w-16 h-16 rounded-3xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-200 mb-4 border border-slate-100/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <p className="text-sm font-black text-slate-400 mb-6">선택된 문서가 없습니다</p>
              <button 
                onClick={() => docs.setViewMode('list')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[12px] font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                문서 리스트에서 선택하기
              </button>
            </div>
          )
        )}

        {docs.viewMode === 'toc' && (
          docs.activeDocument ? (
            <DocumentToC
              data={docs.activeDocument}
              currentPageIndex={docs.currentPageIndex}
              onSwitchPage={docs.switchPage}
              onViewDetail={() => docs.setViewMode('detail')}
              onNavigate={docs.scrollToTarget}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50">
              <div className="w-16 h-16 rounded-3xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-200 mb-4 border border-slate-100/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </div>
              <p className="text-sm font-black text-slate-400 mb-6">문서를 먼저 선택해주세요</p>
              <button 
                onClick={() => docs.setViewMode('list')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[12px] font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                문서 리스트 보기
              </button>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default App;

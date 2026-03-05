import React, { useEffect } from 'react';
import { SplitEditor } from './components/Editor/SplitEditor';
import { AppNavbar } from './components/layout/AppNavbar';
import { useTabManagement } from './hooks/useTabManagement';
import { useDocumentManagement } from './hooks/useDocumentManagement';

/**
 * App 오케스트레이터 (Light Theme)
 */
const App: React.FC = () => {
  const tabs = useTabManagement();
  const docs = useDocumentManagement(tabs.tabCount, tabs.activeTabIndex);

  useEffect(() => {
    tabs.initializeTabs();
    docs.initialize();
  }, []);

  const handleTabSwitch = async (index: number) => {
    if (index === tabs.activeTabIndex) return;
    await docs.saveBeforeSwitch();
    tabs.switchTab(index);
  };

  // 터치 스와이프 상태
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  // --- 키보드 및 제스처 탭 전환 ---
  const handleKeyDown = (e: KeyboardEvent) => {
    // 편집 모드이거나 입력 요소(input, textarea)에 포커스가 있을 때는 탭 전환 무시
    if (docs.isEditing || tabs.editingTabIndex !== null) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    if (e.key === 'ArrowLeft') {
      const prevIndex = tabs.activeTabIndex > 0 ? tabs.activeTabIndex - 1 : tabs.tabCount - 1;
      handleTabSwitch(prevIndex);
    } else if (e.key === 'ArrowRight') {
      const nextIndex = tabs.activeTabIndex < tabs.tabCount - 1 ? tabs.activeTabIndex + 1 : 0;
      handleTabSwitch(nextIndex);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [docs.isEditing, tabs.activeTabIndex, tabs.tabCount, tabs.editingTabIndex]);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    // 터치 대상이 편집 창이거나 텍스트 조작 중이면 무시
    if (docs.isEditing || tabs.editingTabIndex !== null) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe Left -> Next Tab
      const nextIndex = tabs.activeTabIndex < tabs.tabCount - 1 ? tabs.activeTabIndex + 1 : 0;
      handleTabSwitch(nextIndex);
    } else if (isRightSwipe) {
      // Swipe Right -> Prev Tab
      const prevIndex = tabs.activeTabIndex > 0 ? tabs.activeTabIndex - 1 : tabs.tabCount - 1;
      handleTabSwitch(prevIndex);
    }
  };

  if (docs.isLoading || tabs.isLoadingTabs) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-slate-500 text-sm font-medium tracking-wide">데이터를 불러오고 있습니다...</span>
        </div>
      </div>
    );
  }


  return (
    <div
      className="flex flex-col h-screen overflow-hidden bg-[#f8fafc] font-sans text-slate-900"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
    >
      {/* 고유 색상이 적용된 네비게이션 탭바 */}
      <AppNavbar
        tabNames={tabs.tabNames}
        activeTabIndex={tabs.activeTabIndex}
        editingTabIndex={tabs.editingTabIndex}
        editingTabName={tabs.editingTabName}
        onTabClick={handleTabSwitch}
        onTabDoubleClick={tabs.startEditingTab}
        onEditingNameChange={tabs.setEditingTabName}
        onEditingNameSave={tabs.saveEditingTabName}
        onEditingKeyDown={tabs.handleEditKeyDown}
      />

      <main className="flex-1 overflow-hidden">
        <SplitEditor
          data={docs.activeDocument || docs.getBlankDocument()}
          onSave={docs.saveDocument}
          isSaving={docs.isSaving}
          isEditing={docs.isEditing}
          setIsEditing={docs.setIsEditing}
          onContentChange={docs.updateContent}
        />
      </main>
    </div>
  );
};

export default App;

import React from 'react';

type ViewMode = 'list' | 'detail' | 'toc';

interface AppNavbarProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    onAddDocument?: () => void;
}

/**
 * 상단 네비게이션 탭바 컴포넌트 (Light Theme & Optimized sequence)
 */
export const AppNavbar: React.FC<AppNavbarProps> = ({
    viewMode,
    onViewModeChange,
    onAddDocument,
}) => {
    return (
        <nav className="flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md flex-none h-14 z-10 px-4">
            {/* Left spacing for window controls if needed */}
            <div className="w-8 h-8"></div>

            <div className="flex bg-slate-100/80 p-1 rounded-xl w-full max-w-[480px] border border-slate-200/50 gap-1">
                {/* 1. 문서리스트 */}
                <button
                    onClick={() => onViewModeChange('list')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[12px] font-black transition-all duration-200 ${viewMode === 'list'
                        ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                        : 'text-slate-500 hover:bg-white/40 hover:text-slate-700'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    문서리스트
                </button>

                {/* 2. 상세내용 */}
                <button
                    onClick={() => onViewModeChange('detail')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[12px] font-black transition-all duration-200 ${viewMode === 'detail'
                        ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                        : 'text-slate-500 hover:bg-white/40 hover:text-slate-700'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    상세내용
                </button>

                {/* 3. 목차 (ToC) */}
                <button
                    onClick={() => onViewModeChange('toc')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[12px] font-black transition-all duration-200 ${viewMode === 'toc'
                        ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                        : 'text-slate-500 hover:bg-white/40 hover:text-slate-700'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"></line><line x1="9" y1="12" x2="20" y2="12"></line><line x1="9" y1="18" x2="20" y2="18"></line><path d="M5 6v.01"></path><path d="M5 12v.01"></path><path d="M5 18v.01"></path></svg>
                    목차
                </button>

                {/* 4. 새문서작성 (+) */}
                <button
                    onClick={onAddDocument}
                    className="w-9 h-9 flex items-center justify-center bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 active:scale-95 transition-all text-lg font-bold"
                    title="새 문서 작성"
                >
                    +
                </button>
            </div>

            <div className="w-8 h-8"></div>
        </nav>
    );
};

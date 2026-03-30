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
        <nav className="flex items-center border-b border-slate-200 bg-white/90 backdrop-blur-md flex-none h-14 z-10">
            <div className="flex bg-slate-100/80 p-1 w-full border border-slate-200/50 gap-1.5">
                {/* 1. 문서리스트 */}
                <button
                    onClick={() => onViewModeChange('list')}
                    className={`flex-1 flex items-center justify-center py-1.5 px-3 rounded-lg text-[12px] font-black transition-all duration-200 ${viewMode === 'list'
                        ? 'bg-blue-100 text-blue-700 border-2 border-slate-900 shadow-sm'
                        : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
                        }`}
                >
                    문서리스트
                </button>
 
                {/* 2. 목차 (ToC) */}
                <button
                    onClick={() => onViewModeChange('toc')}
                    className={`flex-1 flex items-center justify-center py-1.5 px-3 rounded-lg text-[12px] font-black transition-all duration-200 ${viewMode === 'toc'
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-slate-900 shadow-sm'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                        }`}
                >
                    목차
                </button>
 
                {/* 3. 상세내용 */}
                <button
                    onClick={() => onViewModeChange('detail')}
                    className={`flex-1 flex items-center justify-center py-1.5 px-3 rounded-lg text-[12px] font-black transition-all duration-200 ${viewMode === 'detail'
                        ? 'bg-rose-100 text-rose-700 border-2 border-slate-900 shadow-sm'
                        : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
                        }`}
                >
                    상세내용
                </button>
            </div>
        </nav>
    );
};

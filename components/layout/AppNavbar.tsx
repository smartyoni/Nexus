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

            <div className="flex bg-slate-100/80 p-1 rounded-xl w-full max-w-[480px] border border-slate-200/50 gap-1.5">
                {/* 1. 문서리스트 */}
                <button
                    onClick={() => onViewModeChange('list')}
                    className={`flex-1 flex items-center justify-center py-1.5 px-3 rounded-lg text-[12px] font-black transition-all duration-200 ${viewMode === 'list'
                        ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                        : 'text-slate-500 hover:bg-white/40 hover:text-slate-700'
                        }`}
                >
                    문서리스트
                </button>

                {/* 2. 목차 (ToC) */}
                <button
                    onClick={() => onViewModeChange('toc')}
                    className={`flex-1 flex items-center justify-center py-1.5 px-3 rounded-lg text-[12px] font-black transition-all duration-200 ${viewMode === 'toc'
                        ? 'bg-green-100 text-green-700 shadow-sm border border-green-200'
                        : 'text-slate-500 hover:bg-white/40 hover:text-slate-700'
                        }`}
                >
                    목차
                </button>

                {/* 3. 상세내용 */}
                <button
                    onClick={() => onViewModeChange('detail')}
                    className={`flex-1 flex items-center justify-center py-1.5 px-3 rounded-lg text-[12px] font-black transition-all duration-200 ${viewMode === 'detail'
                        ? 'bg-pink-100 text-pink-700 shadow-sm border border-pink-200'
                        : 'text-slate-500 hover:bg-white/40 hover:text-slate-700'
                        }`}
                >
                    상세내용
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

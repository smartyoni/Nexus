import React from 'react';

interface AppNavbarProps {
    tabNames: string[];
    activeTabIndex: number;
    editingTabIndex: number | null;
    editingTabName: string;
    onTabClick: (index: number) => void;
    onTabDoubleClick: (index: number) => void;
    onEditingNameChange: (value: string) => void;
    onEditingNameSave: () => void;
    onEditingKeyDown: (e: React.KeyboardEvent) => void;
}

// 탭별 고유 색상 정의 (Light Theme용)
const TAB_COLORS = [
    { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'bg-indigo-500', input: 'text-indigo-700' },
    { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'bg-emerald-500', input: 'text-emerald-700' },
    { text: 'text-rose-600', bg: 'bg-rose-50', border: 'bg-rose-500', input: 'text-rose-700' },
    { text: 'text-amber-600', bg: 'bg-amber-50', border: 'bg-amber-500', input: 'text-amber-700' },
];

/**
 * 상단 네비게이션 탭바 컴포넌트 (Light Theme & Unique Colors)
 */
export const AppNavbar: React.FC<AppNavbarProps> = ({
    tabNames,
    activeTabIndex,
    editingTabIndex,
    editingTabName,
    onTabClick,
    onTabDoubleClick,
    onEditingNameChange,
    onEditingNameSave,
    onEditingKeyDown,
}) => {
    return (
        <nav className="flex border-b border-slate-200 bg-white flex-none shadow-sm z-10">
            {tabNames.map((name, index) => {
                const isActive = activeTabIndex === index;
                const color = TAB_COLORS[index % TAB_COLORS.length];

                return (
                    <button
                        key={index}
                        onClick={() => onTabClick(index)}
                        onDoubleClick={() => onTabDoubleClick(index)}
                        className={`flex-1 relative py-4 text-xs font-bold tracking-tight transition-all duration-200 border-r last:border-r-0 border-slate-100 ${isActive
                                ? `${color.text} ${color.bg}`
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {editingTabIndex === index ? (
                            <input
                                type="text"
                                value={editingTabName}
                                onChange={(e) => onEditingNameChange(e.target.value)}
                                onBlur={onEditingNameSave}
                                onKeyDown={onEditingKeyDown}
                                className={`w-full bg-transparent text-center ${color.input} text-xs font-bold outline-none px-1`}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <span className="truncate block px-1">{name}</span>
                        )}
                        {isActive && (
                            <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${color.border}`} />
                        )}
                    </button>
                );
            })}
        </nav>
    );
};

import React, { useEffect, useState, useRef } from 'react';
import { DocumentData } from '../../types';
import { TextEditor } from './TextEditor';

interface SplitEditorProps {
    data: DocumentData;
    onSave: (data: DocumentData) => void;
    isSaving?: boolean;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    onContentChange?: (content: string) => void;
}

/**
 * 문서 에디터 컴포넌트 (영역 최대화 버전)
 */
export const SplitEditor: React.FC<SplitEditorProps> = ({
    data,
    onSave,
    isSaving = false,
    isEditing,
    setIsEditing,
    onContentChange,
}) => {
    const [content, setContent] = useState(data.content || '');
    const latestContentRef = useRef(data.content || '');
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    useEffect(() => {
        setContent(data.content || '');
        latestContentRef.current = data.content || '';
    }, [data.id, data.content]);


    const handleContentChange = (newContent: string) => {
        setContent(newContent);
        latestContentRef.current = newContent;
        onContentChange?.(newContent);
    };

    const handleReset = () => {
        const resetContent = '';
        setContent(resetContent);
        onContentChange?.(resetContent);
        onSave({ ...data, content: resetContent, updatedAt: Date.now() });
        setIsResetModalOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-white relative group">
            {/* 플로팅 상태 표시기 (최소화된 디자인) */}
            <div className="absolute top-4 right-6 z-20 flex items-center gap-3 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-40">
                {isSaving && (
                    <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm border border-emerald-100">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-subtle" />
                        저장됨
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-hidden" onDoubleClick={() => {
                // 상위 컨테이너의 onDoubleClick은 더 이상 상태를 토글하지 않고 무시함
                // (이중 저장 로직 방지. 실제 편집/보기 전환 및 저장은 하위 TextEditor 내부에서 완벽하게 통제함)
            }}>
                <TextEditor
                    content={content}
                    onChange={handleContentChange}
                    isEditing={isEditing}
                    onEditingChange={(editing) => {
                        if (!editing && isEditing) {
                            // 보기 모드로 빠져나갈 때, 상태 클로저 문제를 피하기 위해 
                            // 무조건 최신 ref 값을 참조하여 파이어베이스에 저장합니다.
                            onSave({ ...data, content: latestContentRef.current, updatedAt: Date.now() });
                        }
                        setIsEditing(editing);
                    }}
                />
            </div>

            {/* 고정 푸터 영역 (매우 컴팩트한 세그먼트 탭 형식) */}
            <div className="flex-none bg-[#f8fafc]/80 backdrop-blur-md border-t border-slate-200/40 p-3 sm:p-4 flex justify-center items-center z-20">
                <div className="bg-slate-200/60 p-0.5 rounded-xl flex items-center w-full max-w-[320px] sm:w-auto shadow-inner-sm border border-slate-300/20">
                    <button
                        onClick={() => setIsResetModalOpen(true)}
                        className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 text-slate-500 hover:text-rose-600 hover:bg-white/50"
                        title="초기화"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        <span className="hidden xs:inline">초기화</span>
                    </button>

                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 hover:bg-white/50"
                        title="새로고침"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M21 13a9 9 0 1 1-3-7.7L21 8"></path></svg>
                        <span className="hidden xs:inline">새로고침</span>
                    </button>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(content);
                        }}
                        className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 text-slate-500 hover:text-emerald-600 hover:bg-white/50"
                        title="복사"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        <span className="hidden xs:inline">복사</span>
                    </button>

                    {/* 구분선 (매우 가늘게) */}
                    <div className="w-[1px] h-3 bg-slate-300/60 mx-1" />

                    {/* 저장 버튼 (편집 모드일 때만 강조됨) */}
                    {isEditing && (
                        <button
                            onClick={() => onSave({ ...data, content: latestContentRef.current, updatedAt: Date.now() })}
                            className="flex-1 sm:flex-none px-5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 mr-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                            저장하기
                        </button>
                    )}

                    <button
                        onClick={() => {
                            if (isEditing) {
                                onSave({ ...data, content: latestContentRef.current, updatedAt: Date.now() });
                            }
                            setIsEditing(!isEditing);
                        }}
                        className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 ${isEditing
                            ? 'bg-white text-slate-600 border border-slate-200/50'
                            : 'text-slate-600 hover:bg-white/50'
                            }`}
                    >
                        {isEditing ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                보기 모드
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                메모 수정
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 초기화 확인 모달 */}
            {isResetModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up border border-slate-100">
                        <div className="p-6">
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">메모 초기화</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                내용을 초기화합니다.<br />
                                <span className="text-slate-400 mt-1 inline-block">Enter 키를 누르면 즉시 삭제됩니다.</span>
                            </p>
                        </div>
                        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                            <button
                                onClick={() => setIsResetModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleReset();
                                }}
                                onClick={handleReset}
                                className="px-4 py-2 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg shadow-sm shadow-rose-500/20 transition-all active:scale-95 flex items-center gap-1.5"
                            >
                                초기화하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

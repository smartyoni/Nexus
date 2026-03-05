import React, { useEffect, useRef, useState } from 'react';

interface TextEditorProps {
    content: string;
    onChange: (content: string) => void;
    isEditing: boolean;
    onEditingChange: (editing: boolean) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ content, onChange, isEditing, onEditingChange }) => {
    const contentEditableRef = useRef<HTMLDivElement>(null);
    const lastSavedContentRef = useRef(content);

    useEffect(() => {
        lastSavedContentRef.current = content;
        if (contentEditableRef.current) {
            if (contentEditableRef.current.innerText !== content) {
                contentEditableRef.current.innerText = content;
            }
        }
    }, [content, isEditing]);

    useEffect(() => {
        if (isEditing && contentEditableRef.current) {
            contentEditableRef.current.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            if (sel) {
                range.selectNodeContents(contentEditableRef.current);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }, [isEditing]);

    const handleBlur = () => {
        if (!contentEditableRef.current) return;
        const text = contentEditableRef.current.innerText || '';
        if (text !== lastSavedContentRef.current) {
            onChange(text);
            lastSavedContentRef.current = text;
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Tab key for bullet point insertion
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertText', false, '• ');
        }

        if (e.ctrlKey || e.metaKey) {
            const formattingKeys = ['b', 'i', 'u'];
            if (formattingKeys.includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        }
    };

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

    const handleContextMenu = (e: React.MouseEvent) => {
        if (isEditing) {
            // 편집 모드에서 우클릭 시: 현재 내용 저장하고 보기 모드로 전환
            e.preventDefault();
            if (contentEditableRef.current) {
                const text = contentEditableRef.current.innerText || '';
                onChange(text);
                lastSavedContentRef.current = text;
            }
            onEditingChange(false);
            return;
        }
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (!isEditing) {
            onEditingChange(true);
        } else {
            // 편집 모드에서 더블클릭 시: 전체 텍스트 선택
            if (contentEditableRef.current) {
                const range = document.createRange();
                const sel = window.getSelection();
                if (sel) {
                    range.selectNodeContents(contentEditableRef.current);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }
    };

    const [isFocused, setIsFocused] = useState(false);
    const isExtension = process.env.BUILD_TARGET === 'extension';

    const SYMBOLS = ['•', '-', '?', '※'];

    const handleSymbolClick = (e: React.MouseEvent, symbol: string) => {
        e.preventDefault(); // 포커스 해제 방지
        if (contentEditableRef.current) {
            document.execCommand('insertText', false, symbol);
            // 최신 텍스트 상위에 전달
            const text = contentEditableRef.current.innerText || '';
            onChange(text);
            lastSavedContentRef.current = text;
        }
    };

    return (
        <div
            className="flex-1 overflow-y-auto overflow-x-hidden bg-white p-4 sm:px-6 sm:py-5 relative h-full selection:bg-indigo-100 selection:text-indigo-700 seamless-editor-container"
            onContextMenu={handleContextMenu}
            onDoubleClick={handleDoubleClick}
        >
            {isEditing ? (
                <div
                    ref={contentEditableRef}
                    contentEditable
                    suppressContentEditableWarning
                    onFocus={() => setIsFocused(true)}
                    onBlur={(e) => {
                        setIsFocused(false);
                        handleBlur();
                    }}
                    onInput={() => {
                        // 실시간 타이핑 내용 추출 버퍼 (리렌더링 최소화)
                        if (contentEditableRef.current) {
                            const text = contentEditableRef.current.innerText || '';
                            onChange(text);
                            lastSavedContentRef.current = text;
                        }
                    }}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    className="outline-none min-h-full whitespace-pre-wrap break-words text-slate-800 text-[12px] leading-relaxed font-sans border-none focus:ring-0 shadow-none appearance-none pb-16 sm:pb-0"
                    style={{ wordWrap: 'break-word', overflowWrap: 'break-word', outline: 'none' }}
                />
            ) : (
                <pre
                    className="whitespace-pre-wrap text-slate-700 text-[12px] leading-relaxed font-sans break-words border-none m-0 p-0"
                    style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                >
                    {content || (
                        <span className="text-slate-300 italic font-light">이곳에 자유롭게 메모를 작성하세요...</span>
                    )}
                </pre>
            )}

            {/* 모바일 기호 입력창 (모바일 PWA 환경 + 편집 모드 + 포커스 시에만 나타남) */}
            {isEditing && isFocused && !isExtension && (
                <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[60] bg-slate-50/95 backdrop-blur-md border-t border-slate-200 p-2 flex justify-around items-center shadow-[0_-4px_12px_rgba(0,0,0,0.05)] animate-slide-up">
                    {SYMBOLS.map((s) => (
                        <button
                            key={s}
                            onMouseDown={(e) => handleSymbolClick(e, s)}
                            className="w-12 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 text-lg font-bold shadow-sm active:scale-90 active:bg-indigo-50 active:text-indigo-600 transition-all"
                        >
                            {s}
                        </button>
                    ))}
                    <button
                        onMouseDown={handleContextMenu}
                        className="w-12 h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md active:scale-90 active:bg-indigo-700 transition-all ml-1"
                        title="수정 종료"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                </div>
            )}

            {/* 컨텍스트 메뉴 (Light Theme) */}
            {contextMenu && (
                <div
                    className="fixed z-[100] bg-white border border-slate-200 shadow-xl py-1 min-w-[160px] rounded-xl overflow-hidden animate-fade-in"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200 flex items-center gap-3 font-semibold"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditingChange(true);
                            setContextMenu(null);
                        }}
                    >
                        <span className="text-indigo-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </span>
                        메모 수정하기
                    </button>
                </div>
            )}
        </div>
    );
};

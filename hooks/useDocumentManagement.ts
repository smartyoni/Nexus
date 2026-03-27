import { useState, useCallback, useEffect } from 'react';
import { DocumentData } from '../types';
import { storageService } from '../services/storageService';

type ViewMode = 'list' | 'detail' | 'toc';

export const useDocumentManagement = () => {
    const [allDocuments, setAllDocuments] = useState<DocumentData[]>([]);
    const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [scrollTarget, setScrollTarget] = useState<{ pageIndex: number; lineIndex: number; timestamp: number } | null>(null);

    // 현재 활성 문서
    const activeDocument = allDocuments.find(d => d.id === activeDocumentId) || null;

    // --- 초기화 ---
    const initialize = useCallback(async () => {
        setIsLoading(true);
        try {
            const docs = await storageService.getDocuments();
            
            // --- Sort by order (asc) or updatedAt (desc) ---
            const sortedDocsForState = [...docs].sort((a, b) => {
                const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
                const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
                if (orderA !== orderB) return orderA - orderB;
                return b.updatedAt - a.updatedAt;
            });

            // --- Migration/Initialization: Assign order if missing ---
            const needsOrder = docs.some(d => d.order === undefined);
            if (needsOrder) {
                const updatedDocs = sortedDocsForState.map((d, index) => ({
                    ...d,
                    order: d.order ?? (index + 1) * 1000
                }));
                await storageService.saveDocuments(updatedDocs);
                setAllDocuments(updatedDocs);
            } else {
                setAllDocuments(sortedDocsForState);
            }
            if (docs.length > 0 && !activeDocumentId) {
                setActiveDocumentId(docs[0].id);
            }
        } finally {
            setIsLoading(false);
        }
    }, [activeDocumentId]);

    // --- 문서 저장 ---
    const saveDocument = useCallback(async (doc: DocumentData) => {
        setIsSaving(true);
        try {
            await storageService.saveDocuments([doc]);
            setAllDocuments(prev => {
                const exists = prev.find(d => d.id === doc.id);
                if (exists) {
                    return prev.map(d => d.id === doc.id ? doc : d);
                }
                return [doc, ...prev];
            });
        } finally {
            setIsSaving(false);
        }
    }, []);

    // --- 문서 삭제 ---
    const deleteDocument = useCallback(async (id: string) => {
        await storageService.deleteDocument(id);
        setAllDocuments(prev => prev.filter(d => d.id !== id));
        if (activeDocumentId === id) {
            setActiveDocumentId(null);
            setViewMode('list');
        }
    }, [activeDocumentId]);

    // --- 내용 업데이트 (메모리 내) ---
    const updateContent = useCallback((content: string) => {
        if (!activeDocument) return;
        const newPages = [...(activeDocument.pages || [])];
        newPages[currentPageIndex] = content;
        
        const updatedDoc = {
            ...activeDocument,
            pages: newPages,
            content: newPages[0] || '', // 검색 등을 위한 대표 컨텐츠
            updatedAt: Date.now()
        };
        
        setAllDocuments(prev => prev.map(d => d.id === activeDocument.id ? updatedDoc : d));
    }, [activeDocument, currentPageIndex]);

    // --- 페이지 제목 업데이트 ---
    const updatePageTitle = useCallback((title: string) => {
        if (!activeDocument) return;
        const newTitles = [...(activeDocument.pageTitles || [])];
        if (newTitles.length === 0 && activeDocument.pages) {
            // 초기화가 안되어있으면 빈 배열로 채움
            activeDocument.pages.forEach(() => newTitles.push(''));
        }
        newTitles[currentPageIndex] = title;
        
        const updatedDoc = {
            ...activeDocument,
            pageTitles: newTitles,
            updatedAt: Date.now()
        };
        
        setAllDocuments(prev => prev.map(d => d.id === activeDocument.id ? updatedDoc : d));
    }, [activeDocument, currentPageIndex]);

    const addPage = useCallback(() => {
        if (!activeDocument) return;
        const newPages = [...(activeDocument.pages || [activeDocument.content || '']), ''];
        const newPageTitles = [...(activeDocument.pageTitles || []), ''];
        const updatedDoc = { ...activeDocument, pages: newPages, pageTitles: newPageTitles };
        const newDocs = allDocuments.map(d => d.id === activeDocument.id ? updatedDoc : d);
        setAllDocuments(newDocs);
        setCurrentPageIndex(newPages.length - 1);
    }, [activeDocument, allDocuments]);

    const removePage = useCallback((index: number) => {
        if (!activeDocument || !activeDocument.pages || activeDocument.pages.length <= 1) return;
        const newPages = activeDocument.pages.filter((_, i) => i !== index);
        const newPageTitles = (activeDocument.pageTitles || []).filter((_, i) => i !== index);
        const updatedDoc = {
            ...activeDocument,
            pages: newPages,
            pageTitles: newPageTitles,
            content: newPages[0] || ''
        };
        const newDocs = allDocuments.map(d => d.id === activeDocument.id ? updatedDoc : d);
        setAllDocuments(newDocs);
        setCurrentPageIndex(Math.max(0, index - 1));
    }, [activeDocument, allDocuments]);

    const switchPage = useCallback((index: number) => {
        if (activeDocument?.pages && index >= 0 && index < activeDocument.pages.length) {
            setCurrentPageIndex(index);
        }
    }, [activeDocument]);

    const createNewDocument = useCallback(() => {
        const newDoc: DocumentData = {
            id: `doc_${Date.now()}`,
            title: '',
            content: '',
            pages: [''],
            updatedAt: Date.now(),
            tabId: 'main', // 기본 tabId 부여
            order: allDocuments.length > 0 ? Math.min(...allDocuments.map(d => d.order ?? 999999)) - 1000 : 1000
        };
        setActiveDocumentId(newDoc.id);
        setViewMode('detail');
        setCurrentPageIndex(0);
        setIsEditing(true);
        // 저장은 사용자가 입력 후 '저장' 버튼을 누를 때 수행하거나, 즉시 저장 가능
        saveDocument(newDoc);
    }, [saveDocument]);

    // --- 문서 선택 ---
    const selectDocument = useCallback((id: string) => {
        setActiveDocumentId(id);
        setViewMode('toc');
        setCurrentPageIndex(0);
    }, []);

    const scrollToTarget = useCallback((pageIndex: number, lineIndex: number) => {
        setCurrentPageIndex(pageIndex);
        setScrollTarget({ pageIndex, lineIndex, timestamp: Date.now() });
        setViewMode('detail');
    }, []);

    // --- 빈 문서 가져오기 ---
    const getBlankDocument = useCallback(
        () => ({
            id: `doc_blank_${Date.now()}`,
            title: '',
            content: '',
            pages: [''],
            updatedAt: Date.now()
        }),
        []
    );

    const reorderDocuments = useCallback(async (newOrderDocs: DocumentData[]) => {
        // 인메모리 업데이트 (즉시 반응성)
        const updatedDocs = newOrderDocs.map((doc, index) => ({
            ...doc,
            order: (index + 1) * 1000
        }));
        setAllDocuments(updatedDocs);
        
        // 데이터베이스 배치 저장
        await storageService.saveDocuments(updatedDocs);
    }, []);

    return {
        // 상태
        allDocuments,
        activeDocument,
        activeDocumentId,
        currentPageIndex,
        viewMode,
        isLoading,
        isSaving,
        isEditing,
        scrollTarget,

        // 액션
        setViewMode,
        setIsEditing,
        setCurrentPageIndex,
        initialize,
        saveDocument,
        deleteDocument,
        updateContent,
        updatePageTitle,
        getBlankDocument,
        createNewDocument,
        selectDocument,
        addPage,
        removePage,
        switchPage,
        scrollToTarget,
        reorderDocuments,
    };
};

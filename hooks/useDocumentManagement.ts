import { useState, useRef, useEffect, useCallback } from 'react';
import { DocumentData } from '../types';
import { storageService } from '../services/storageService';

// 탭별 문서 ID 생성 유틸리티
const getTabDocId = (tabIndex: number) => `tab_doc_${tabIndex}`;

// 빈 문서 생성 유틸리티
const createBlankDocument = (tabIndex: number): DocumentData => ({
    id: getTabDocId(tabIndex),
    title: '',
    content: '',
    updatedAt: Date.now(),
    tabId: `tab_${tabIndex}`
});

/**
 * 4개 탭의 문서 로딩, 자동 저장(디바운스), 데이터 초기화 로직을 담당하는 훅
 */
export const useDocumentManagement = (
    tabCount: number,
    activeTabIndex: number
) => {
    const [tabDocuments, setTabDocuments] = useState<(DocumentData | null)[]>(
        Array(tabCount).fill(null)
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const lastSavedRef = useRef<string>('');

    // 현재 활성 문서
    const activeDocument = tabDocuments[activeTabIndex];


    // --- 실시간 데이터 구독 ---
    useEffect(() => {
        setIsLoading(true);

        // Firestore onSnapshot: 다른 기기에서 데이터가 바뀌면 즉시 반영
        const unsubscribe = storageService.subscribeToDocuments((allDocs) => {
            const docs: (DocumentData | null)[] = Array(tabCount).fill(null);
            for (let i = 0; i < tabCount; i++) {
                const docId = getTabDocId(i);
                const found = allDocs.find(d => d.id === docId);
                docs[i] = found || createBlankDocument(i);
            }
            setTabDocuments(docs);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [tabCount]);


    // 하위 호환을 위한 initialize (App.tsx에서 직접 호출 시 사용)
    const initialize = useCallback(async () => {
        // 실시간 구독으로 대체되었으므로 빈 함수 유지
    }, []);

    // --- 명시적 저장 ---
    const saveDocument = useCallback(async (data: DocumentData) => {
        const updatedDoc = { ...data, updatedAt: Date.now() };
        const newDocs = [...tabDocuments];
        newDocs[activeTabIndex] = updatedDoc;
        setTabDocuments(newDocs);

        const allDocs = newDocs.filter(Boolean) as DocumentData[];
        await storageService.saveDocuments(allDocs);
        lastSavedRef.current = JSON.stringify(updatedDoc);
        setIsEditing(false);
    }, [tabDocuments, activeTabIndex]);

    // --- 탭 전환 시 현재 문서 저장 ---
    const saveBeforeSwitch = useCallback(async () => {
        if (activeDocument) {
            const updatedDoc = { ...activeDocument, updatedAt: Date.now() };
            const newDocs = [...tabDocuments];
            newDocs[activeTabIndex] = updatedDoc;
            setTabDocuments(newDocs);

            const allDocs = newDocs.filter(Boolean) as DocumentData[];
            await storageService.saveDocuments(allDocs);
        }
        setIsEditing(false);
        lastSavedRef.current = '';
    }, [activeDocument, tabDocuments, activeTabIndex]);

    // --- 콘텐츠 변경 핸들러 ---
    const updateContent = useCallback((content: string) => {
        const newDocs = [...tabDocuments];
        newDocs[activeTabIndex] = activeDocument
            ? { ...activeDocument, content }
            : { ...createBlankDocument(activeTabIndex), content };
        setTabDocuments(newDocs);
    }, [tabDocuments, activeTabIndex, activeDocument]);

    // --- 빈 문서 가져오기 ---
    const getBlankDocument = useCallback(
        () => createBlankDocument(activeTabIndex),
        [activeTabIndex]
    );

    return {
        // 상태
        tabDocuments,
        activeDocument,
        isLoading,
        isSaving,
        isEditing,

        // 액션
        setIsEditing,
        initialize,
        saveDocument,
        saveBeforeSwitch,
        updateContent,
        getBlankDocument,
    };
};

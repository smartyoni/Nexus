import React, { useState, useCallback, useEffect } from 'react';
import { storageService } from '../services/storageService';

// 탭 설정 상수
const TAB_COUNT = 1;
const DEFAULT_TAB_NAMES = ['상세내용'];
const ACTIVE_TAB_KEY = 'app_active_tab';

/**
 * 탭 이름 관리, 활성 탭 전환, 탭 이름 인라인 편집을 담당하는 훅
 */
export const useTabManagement = () => {
    const [tabNames, setTabNames] = useState<string[]>(DEFAULT_TAB_NAMES);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [editingTabIndex, setEditingTabIndex] = useState<number | null>(null);
    const [editingTabName, setEditingTabName] = useState('');
    const [isLoadingTabs, setIsLoadingTabs] = useState(true);

    // 저장된 활성 탭 인덱스 로드 (로컬 스토리지 전용)
    const loadActiveTabIndex = useCallback((): number => {
        const saved = localStorage.getItem(ACTIVE_TAB_KEY);
        const idx = saved ? parseInt(saved, 10) : 0;
        return Math.min(idx, TAB_COUNT - 1);
    }, []);

    // 실시간 탭 이름 구독 (Firebase onSnapshot)
    useEffect(() => {
        setIsLoadingTabs(true);

        // 활성 탭 인덱스는 로컬에서 즉시 불러옴
        const activeIdx = loadActiveTabIndex();
        setActiveTabIndex(activeIdx);

        // Firebase onSnapshot으로 탭 이름 실시간 수신
        const unsubscribe = storageService.subscribeToTabNames((names) => {
            if (names && Array.isArray(names) && names.length === TAB_COUNT) {
                setTabNames(names);
            } else {
                setTabNames([...DEFAULT_TAB_NAMES]);
            }
            setIsLoadingTabs(false);
        });

        return () => unsubscribe();
    }, [loadActiveTabIndex]);

    // 파이어베이스에 탭 이름 비동기 저장
    const saveTabNames = useCallback(async (names: string[]) => {
        try {
            await storageService.saveTabNames(names);
        } catch (error) {
            console.error('Failed to save tab names:', error);
        }
    }, []);

    // 하위 호환: App.tsx의 initializeTabs 호출을 위한 빈 함수 유지
    const initializeTabs = useCallback(async () => {
        // 실시간 구독으로 대체됨 — 아무것도 할 필요가 없음
    }, []);

    // 탭 전환
    const switchTab = useCallback((index: number) => {
        setActiveTabIndex(index);
        setEditingTabIndex(null);
        localStorage.setItem(ACTIVE_TAB_KEY, String(index));
    }, []);

    // 더블클릭으로 탭 이름 편집 시작
    const startEditingTab = useCallback((index: number) => {
        setEditingTabIndex(index);
        setEditingTabName(tabNames[index]);
    }, [tabNames]);

    // 탭 이름 저장
    const saveEditingTabName = useCallback(async () => {
        if (editingTabIndex !== null) {
            const newNames = [...tabNames];
            newNames[editingTabIndex] = editingTabName.trim() || `탭 ${editingTabIndex + 1}`;
            setTabNames(newNames);
            setEditingTabIndex(null);

            // 파이어베이스에 저장 → onSnapshot이 다른 기기에 자동 반영
            await saveTabNames(newNames);
        }
    }, [editingTabIndex, editingTabName, tabNames, saveTabNames]);

    // 탭 이름 편집 중 키 입력 처리
    const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveEditingTabName();
        } else if (e.key === 'Escape') {
            setEditingTabIndex(null);
        }
    }, [saveEditingTabName]);

    return {
        // 상태
        tabNames,
        activeTabIndex,
        editingTabIndex,
        editingTabName,
        tabCount: TAB_COUNT,
        isLoadingTabs,

        // 액션
        initializeTabs,
        switchTab,
        startEditingTab,
        saveEditingTabName,
        handleEditKeyDown,
        setEditingTabName,
    };
};

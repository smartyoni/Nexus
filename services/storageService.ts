import { DocumentData, Tab } from '../types';
import { firestoreService } from './firestoreService';
import { storageService as localStorageService } from './localStorageService';

// Firestore 사용 여부 (true = Firestore 사용, false = localStorage 사용)
const USE_FIRESTORE = true;

export const storageService = {
  getDocuments: async (): Promise<DocumentData[]> => {
    if (USE_FIRESTORE) {
      try {
        return await firestoreService.getDocuments();
      } catch (error) {
        console.error('Firestore error, falling back to localStorage', error);
        return localStorageService.getDocuments();
      }
    }
    return localStorageService.getDocuments();
  },

  saveDocuments: async (docs: DocumentData[]): Promise<void> => {
    if (USE_FIRESTORE) {
      try {
        for (const doc of docs) {
          await firestoreService.saveDocument(doc);
        }
        localStorageService.saveDocuments(docs);
      } catch (error) {
        console.error('Failed to save to Firestore', error);
        localStorageService.saveDocuments(docs);
      }
    } else {
      localStorageService.saveDocuments(docs);
    }
  },

  exportData: async () => {
    if (USE_FIRESTORE) {
      return await firestoreService.exportData();
    }
    return localStorageService.exportData();
  },

  importData: async (data: any) => {
    if (USE_FIRESTORE) {
      return await firestoreService.importData(data);
    }
    return localStorageService.importData(data);
  },

  deleteDocument: async (id: string): Promise<void> => {
    if (USE_FIRESTORE) {
      try {
        await firestoreService.deleteDocument(id);
      } catch (error) {
        console.error('Failed to delete document from Firestore', error);
      }
    }
  },

  getFavoriteDocId: async (): Promise<string | null> => {
    if (USE_FIRESTORE) {
      try {
        return await firestoreService.getFavoriteDocId();
      } catch (error) {
        console.error('Firestore error, falling back to localStorage', error);
        return localStorageService.getFavoriteDocId();
      }
    }
    return localStorageService.getFavoriteDocId();
  },

  setFavoriteDocId: async (id: string): Promise<void> => {
    if (USE_FIRESTORE) {
      try {
        await firestoreService.setFavoriteDocId(id);
        localStorageService.setFavoriteDocId(id);
      } catch (error) {
        console.error('Failed to save favorite doc to Firestore', error);
        localStorageService.setFavoriteDocId(id);
      }
    } else {
      localStorageService.setFavoriteDocId(id);
    }
  },

  clearFavoriteDocId: async (): Promise<void> => {
    if (USE_FIRESTORE) {
      try {
        await firestoreService.clearFavoriteDocId();
        localStorageService.clearFavoriteDocId();
      } catch (error) {
        console.error('Failed to clear favorite doc from Firestore', error);
        localStorageService.clearFavoriteDocId();
      }
    } else {
      localStorageService.clearFavoriteDocId();
    }
  },

  getTabs: async (): Promise<Tab[]> => {
    if (USE_FIRESTORE) {
      try {
        return await firestoreService.getTabs();
      } catch (error) {
        console.error('Firestore error, falling back to localStorage', error);
        return localStorageService.getTabs();
      }
    }
    return localStorageService.getTabs();
  },

  getTabNames: async (): Promise<string[] | null> => {
    if (USE_FIRESTORE) {
      try {
        return await firestoreService.getTabNames();
      } catch (error) {
        console.error('Firestore error, falling back to localStorage for tab names', error);
        return localStorageService.getTabNames();
      }
    }
    return localStorageService.getTabNames();
  },

  saveTabNames: async (names: string[]): Promise<void> => {
    if (USE_FIRESTORE) {
      try {
        await firestoreService.saveTabNames(names);
        localStorageService.saveTabNames(names);
      } catch (error) {
        console.error('Failed to save tab names to Firestore', error);
        localStorageService.saveTabNames(names);
      }
    } else {
      localStorageService.saveTabNames(names);
    }
  },

  saveTabs: async (tabs: Tab[]): Promise<void> => {
    if (USE_FIRESTORE) {
      try {
        for (const tab of tabs) {
          await firestoreService.saveTab(tab);
        }
        localStorageService.saveTabs(tabs);
      } catch (error) {
        console.error('Failed to save tabs to Firestore', error);
        localStorageService.saveTabs(tabs);
      }
    } else {
      localStorageService.saveTabs(tabs);
    }
  },

  saveTab: async (tab: Tab): Promise<void> => {
    if (USE_FIRESTORE) {
      try {
        await firestoreService.saveTab(tab);
        const tabs = localStorageService.getTabs();
        const index = tabs.findIndex(t => t.id === tab.id);
        if (index >= 0) {
          tabs[index] = tab;
        } else {
          tabs.push(tab);
        }
        localStorageService.saveTabs(tabs);
      } catch (error) {
        console.error('Failed to save tab to Firestore', error);
        const tabs = localStorageService.getTabs();
        const index = tabs.findIndex(t => t.id === tab.id);
        if (index >= 0) {
          tabs[index] = tab;
        } else {
          tabs.push(tab);
        }
        localStorageService.saveTabs(tabs);
      }
    } else {
      const tabs = localStorageService.getTabs();
      const index = tabs.findIndex(t => t.id === tab.id);
      if (index >= 0) {
        tabs[index] = tab;
      } else {
        tabs.push(tab);
      }
      localStorageService.saveTabs(tabs);
    }
  },

  deleteTab: async (id: string): Promise<void> => {
    if (USE_FIRESTORE) {
      try {
        await firestoreService.deleteTab(id);
      } catch (error) {
        console.error('Failed to delete tab from Firestore', error);
      }
    }
    const tabs = localStorageService.getTabs();
    localStorageService.saveTabs(tabs.filter(t => t.id !== id));
  },

  getCurrentTabId: async (): Promise<string | null> => {
    if (USE_FIRESTORE) {
      try {
        return await firestoreService.getCurrentTabId();
      } catch (error) {
        console.error('Firestore error, falling back to localStorage', error);
        return localStorageService.getCurrentTabId();
      }
    }
    return localStorageService.getCurrentTabId();
  },

  setCurrentTabId: async (id: string): Promise<void> => {
    if (USE_FIRESTORE) {
      try {
        await firestoreService.setCurrentTabId(id);
        localStorageService.setCurrentTabId(id);
      } catch (error) {
        console.error('Failed to save current tab id to Firestore', error);
        localStorageService.setCurrentTabId(id);
      }
    } else {
      localStorageService.setCurrentTabId(id);
    }
  },

  // 실시간 구독: 메모 본문 변경 수신 (onSnapshot)
  subscribeToDocuments: (callback: (docs: import('../types').DocumentData[]) => void): (() => void) => {
    if (USE_FIRESTORE) {
      return firestoreService.subscribeToDocuments(callback);
    }
    // localStorage는 실시간 구독 미지원 → 아무것도 안하는 구독 해제 함수 반환
    return () => { };
  },

  // 실시간 구독: 탭 이름 변경 수신 (onSnapshot)
  subscribeToTabNames: (callback: (names: string[] | null) => void): (() => void) => {
    if (USE_FIRESTORE) {
      return firestoreService.subscribeToTabNames(callback);
    }
    return () => { };
  },
};

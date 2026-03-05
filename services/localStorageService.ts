import { DocumentData, Tab } from '../types';

const STORAGE_KEY_DOCS = 'tm_documents';
const STORAGE_KEY_FAVORITE_DOC = 'tm_favorite_doc_id';
const STORAGE_KEY_TABS = 'tm_tabs';
const STORAGE_KEY_CURRENT_TAB_ID = 'tm_current_tab_id';

export const storageService = {
  getDocuments: (): DocumentData[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DOCS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load documents", e);
      return [];
    }
  },

  saveDocuments: (docs: DocumentData[]) => {
    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(docs));
  },

  exportData: () => {
    const documents = storageService.getDocuments();
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      documents
    };
  },

  importData: (data: any) => {
    try {
      // Validate structure
      if (!data.version || !Array.isArray(data.documents)) {
        throw new Error('Invalid backup file format');
      }

      // Save to localStorage
      storageService.saveDocuments(data.documents);
      return { success: true, message: '데이터가 복원되었습니다.' };
    } catch (e) {
      console.error("Failed to import data", e);
      return { success: false, message: `복원 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}` };
    }
  },

  getFavoriteDocId: (): string | null => {
    try {
      return localStorage.getItem(STORAGE_KEY_FAVORITE_DOC);
    } catch (e) {
      console.error("Failed to load favorite doc id", e);
      return null;
    }
  },

  setFavoriteDocId: (id: string): void => {
    localStorage.setItem(STORAGE_KEY_FAVORITE_DOC, id);
  },

  clearFavoriteDocId: (): void => {
    localStorage.removeItem(STORAGE_KEY_FAVORITE_DOC);
  },

  getTabNames: (): string[] | null => {
    try {
      const data = localStorage.getItem('app_tab_names');
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length === 4) {
          return parsed;
        }
      }
      return null;
    } catch (e) {
      console.error("Failed to load tab names", e);
      return null;
    }
  },

  saveTabNames: (names: string[]): void => {
    localStorage.setItem('app_tab_names', JSON.stringify(names));
  },

  getTabs: (): Tab[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TABS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load tabs", e);
      return [];
    }
  },

  saveTabs: (tabs: Tab[]): void => {
    localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(tabs));
  },

  getCurrentTabId: (): string | null => {
    try {
      return localStorage.getItem(STORAGE_KEY_CURRENT_TAB_ID);
    } catch (e) {
      console.error("Failed to load current tab id", e);
      return null;
    }
  },

  setCurrentTabId: (id: string): void => {
    localStorage.setItem(STORAGE_KEY_CURRENT_TAB_ID, id);
  }
};

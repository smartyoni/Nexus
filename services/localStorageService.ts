import { DocumentData } from '../types';

const STORAGE_KEY_DOCS = 'tm_documents';
const STORAGE_KEY_TEMPLATES = 'tm_templates';
const STORAGE_KEY_FAVORITE_DOC = 'tm_favorite_doc_id';

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

  getTemplates: (): DocumentData[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      // If no templates exist, return a default one
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to load templates", e);
      return [];
    }
  },

  saveTemplates: (templates: DocumentData[]) => {
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
  },

  exportData: () => {
    const documents = storageService.getDocuments();
    const templates = storageService.getTemplates();
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      documents,
      templates
    };
  },

  importData: (data: any) => {
    try {
      // Validate structure
      if (!data.version || !Array.isArray(data.documents) || !Array.isArray(data.templates)) {
        throw new Error('Invalid backup file format');
      }

      // Save to localStorage
      storageService.saveDocuments(data.documents);
      storageService.saveTemplates(data.templates);
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
  }
};

import { DocumentData } from '../types';
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

  getTemplates: async (): Promise<DocumentData[]> => {
    if (USE_FIRESTORE) {
      try {
        return await firestoreService.getTemplates();
      } catch (error) {
        console.error('Firestore error, falling back to localStorage', error);
        return localStorageService.getTemplates();
      }
    }
    return localStorageService.getTemplates();
  },

  saveTemplates: async (templates: DocumentData[]): Promise<void> => {
    if (USE_FIRESTORE) {
      try {
        for (const template of templates) {
          await firestoreService.saveTemplate(template);
        }
        localStorageService.saveTemplates(templates);
      } catch (error) {
        console.error('Failed to save to Firestore', error);
        localStorageService.saveTemplates(templates);
      }
    } else {
      localStorageService.saveTemplates(templates);
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

  deleteTemplate: async (id: string): Promise<void> => {
    if (USE_FIRESTORE) {
      try {
        await firestoreService.deleteTemplate(id);
      } catch (error) {
        console.error('Failed to delete template from Firestore', error);
      }
    }
  }
};

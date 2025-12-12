import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { DocumentData } from '../types';

// Firestore 컬렉션 이름
const COLLECTION_DOCS = 'documents';
const COLLECTION_TEMPLATES = 'templates';

// 사용자 ID (현재는 단일 사용자 가정)
const USER_ID = 'default_user';

export const firestoreService = {
  // 문서 가져오기
  getDocuments: async (): Promise<DocumentData[]> => {
    try {
      const docsRef = collection(db, `users/${USER_ID}/${COLLECTION_DOCS}`);
      const q = query(docsRef, orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as DocumentData[];
    } catch (e) {
      console.error("Failed to load documents from Firestore", e);
      return [];
    }
  },

  // 문서 저장하기
  saveDocument: async (document: DocumentData): Promise<void> => {
    try {
      const docRef = doc(db, `users/${USER_ID}/${COLLECTION_DOCS}`, document.id);
      await setDoc(docRef, {
        ...document,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.error("Failed to save document to Firestore", e);
      throw e;
    }
  },

  // 문서 삭제하기
  deleteDocument: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, `users/${USER_ID}/${COLLECTION_DOCS}`, id);
      await deleteDoc(docRef);
    } catch (e) {
      console.error("Failed to delete document from Firestore", e);
      throw e;
    }
  },

  // 템플릿 가져오기
  getTemplates: async (): Promise<DocumentData[]> => {
    try {
      const templatesRef = collection(db, `users/${USER_ID}/${COLLECTION_TEMPLATES}`);
      const q = query(templatesRef, orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as DocumentData[];
    } catch (e) {
      console.error("Failed to load templates from Firestore", e);
      return [];
    }
  },

  // 템플릿 저장하기
  saveTemplate: async (template: DocumentData): Promise<void> => {
    try {
      const templateRef = doc(db, `users/${USER_ID}/${COLLECTION_TEMPLATES}`, template.id);
      await setDoc(templateRef, {
        ...template,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.error("Failed to save template to Firestore", e);
      throw e;
    }
  },

  // 템플릿 삭제하기
  deleteTemplate: async (id: string): Promise<void> => {
    try {
      const templateRef = doc(db, `users/${USER_ID}/${COLLECTION_TEMPLATES}`, id);
      await deleteDoc(templateRef);
    } catch (e) {
      console.error("Failed to delete template from Firestore", e);
      throw e;
    }
  },

  // 백업용 데이터 내보내기
  exportData: async () => {
    const documents = await firestoreService.getDocuments();
    const templates = await firestoreService.getTemplates();
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      documents,
      templates
    };
  },

  // 백업 데이터 복원하기
  importData: async (data: any) => {
    try {
      if (!data.version || !Array.isArray(data.documents) || !Array.isArray(data.templates)) {
        throw new Error('Invalid backup file format');
      }

      for (const doc of data.documents) {
        await firestoreService.saveDocument(doc);
      }

      for (const template of data.templates) {
        await firestoreService.saveTemplate(template);
      }

      return { success: true, message: '데이터가 복원되었습니다.' };
    } catch (e) {
      console.error("Failed to import data to Firestore", e);
      return {
        success: false,
        message: `복원 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`
      };
    }
  }
};

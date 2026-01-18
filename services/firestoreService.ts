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
const COLLECTION_SETTINGS = 'settings';

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

  // 백업용 데이터 내보내기
  exportData: async () => {
    const documents = await firestoreService.getDocuments();
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      documents
    };
  },

  // 백업 데이터 복원하기
  importData: async (data: any) => {
    try {
      if (!data.version || !Array.isArray(data.documents)) {
        throw new Error('Invalid backup file format');
      }

      for (const doc of data.documents) {
        await firestoreService.saveDocument(doc);
      }

      return { success: true, message: '데이터가 복원되었습니다.' };
    } catch (e) {
      console.error("Failed to import data to Firestore", e);
      return {
        success: false,
        message: `복원 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`
      };
    }
  },

  // 즐겨찾기 문서 ID 가져오기
  getFavoriteDocId: async (): Promise<string | null> => {
    try {
      const settingsRef = doc(db, `users/${USER_ID}/${COLLECTION_SETTINGS}`, 'favorite');
      const snapshot = await getDocs(collection(db, `users/${USER_ID}/${COLLECTION_SETTINGS}`));
      const favDoc = snapshot.docs.find(d => d.id === 'favorite');
      return favDoc ? (favDoc.data().favoriteDocId || null) : null;
    } catch (e) {
      console.error("Failed to get favorite doc id from Firestore", e);
      return null;
    }
  },

  // 즐겨찾기 문서 ID 설정하기
  setFavoriteDocId: async (id: string): Promise<void> => {
    try {
      const settingsRef = doc(db, `users/${USER_ID}/${COLLECTION_SETTINGS}`, 'favorite');
      await setDoc(settingsRef, { favoriteDocId: id });
    } catch (e) {
      console.error("Failed to set favorite doc id in Firestore", e);
      throw e;
    }
  },

  // 즐겨찾기 문서 ID 삭제하기
  clearFavoriteDocId: async (): Promise<void> => {
    try {
      const settingsRef = doc(db, `users/${USER_ID}/${COLLECTION_SETTINGS}`, 'favorite');
      await setDoc(settingsRef, { favoriteDocId: null });
    } catch (e) {
      console.error("Failed to clear favorite doc id in Firestore", e);
      throw e;
    }
  }
};

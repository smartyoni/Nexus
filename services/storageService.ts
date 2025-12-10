import { collection, getDocs, addDoc, setDoc, deleteDoc, doc, query, orderBy, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { DocumentData } from '../types'; // Adjust path as types.ts is in root

const documentsCollection = collection(db, 'documents');
const templatesCollection = collection(db, 'templates');

export const storageService = {
  getDocuments: async (): Promise<DocumentData[]> => {
    try {
      const q = query(documentsCollection, orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data() as DocumentData, id: doc.id }));
    } catch (e) {
      console.error("Failed to load documents from Firestore", e);
      return [];
    }
  },

  saveDocuments: async (docs: DocumentData[]) => {
    const batch = writeBatch(db);
    const existingDocsSnapshot = await getDocs(documentsCollection);
    const existingDocIds = new Set(existingDocsSnapshot.docs.map(d => d.id));

    for (const docData of docs) {
      const docRef = docData.id ? doc(documentsCollection, docData.id) : null;
      if (docRef && existingDocIds.has(docData.id)) {
        // Update existing document
        batch.set(docRef, docData);
        existingDocIds.delete(docData.id); // Mark as updated
      } else {
        // Add new document
        const newDocRef = doc(documentsCollection); // Firestore generates ID
        batch.set(newDocRef, { ...docData, id: newDocRef.id }); // Assign generated ID back to data
      }
    }

    // Delete documents that are no longer in the provided docs array
    for (const id of existingDocIds) {
      batch.delete(doc(documentsCollection, id));
    }

    await batch.commit();
  },

  getTemplates: async (): Promise<DocumentData[]> => {
    try {
      const q = query(templatesCollection, orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data() as DocumentData, id: doc.id }));
    } catch (e) {
      console.error("Failed to load templates from Firestore", e);
      return [];
    }
  },

  saveTemplates: async (templates: DocumentData[]) => {
    const batch = writeBatch(db);
    const existingTemplatesSnapshot = await getDocs(templatesCollection);
    const existingTemplateIds = new Set(existingTemplatesSnapshot.docs.map(d => d.id));

    for (const templateData of templates) {
      const templateRef = templateData.id ? doc(templatesCollection, templateData.id) : null;
      if (templateRef && existingTemplateIds.has(templateData.id)) {
        // Update existing template
        batch.set(templateRef, templateData);
        existingTemplateIds.delete(templateData.id); // Mark as updated
      } else {
        // Add new template
        const newTemplateRef = doc(templatesCollection); // Firestore generates ID
        batch.set(newTemplateRef, { ...templateData, id: newTemplateRef.id }); // Assign generated ID back to data
      }
    }

    // Delete templates that are no longer in the provided templates array
    for (const id of existingTemplateIds) {
      batch.delete(doc(templatesCollection, id));
    }

    await batch.commit();
  },

  exportData: async () => {
    const documents = await storageService.getDocuments();
    const templates = await storageService.getTemplates();
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      documents,
      templates
    };
  },

  importData: async (data: any) => {
    try {
      // Validate structure
      if (!data.version || !Array.isArray(data.documents) || !Array.isArray(data.templates)) {
        throw new Error('Invalid backup file format');
      }

      // Clear existing data (optional, but good for clean import)
      const existingDocsSnapshot = await getDocs(documentsCollection);
      const existingTemplatesSnapshot = await getDocs(templatesCollection);
      const deleteBatch = writeBatch(db);
      existingDocsSnapshot.forEach(doc => deleteBatch.delete(doc.ref));
      existingTemplatesSnapshot.forEach(doc => deleteBatch.delete(doc.ref));
      await deleteBatch.commit();

      // Import new data
      const importBatch = writeBatch(db);
      for (const docData of data.documents) {
        importBatch.set(doc(documentsCollection, docData.id), docData);
      }
      for (const templateData of data.templates) {
        importBatch.set(doc(templatesCollection, templateData.id), templateData);
      }
      await importBatch.commit();

      return { success: true, message: '데이터가 성공적으로 복원되었습니다.' };
    } catch (e) {
      console.error("Failed to import data to Firestore", e);
      return { success: false, message: `복원 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}` };
    }
  }
};


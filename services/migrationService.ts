import { storageService as localStorageService } from './localStorageService';
import { firestoreService } from './firestoreService';

const MIGRATION_KEY = 'tm_migration_completed';

export const migrationService = {
  // localStorage에서 Firestore로 데이터 이전 (최초 1회만 실행)
  migrateToFirestore: async (): Promise<boolean> => {
    const completed = localStorage.getItem(MIGRATION_KEY);
    if (completed === 'true') {
      console.log('Migration already completed');
      return true;
    }

    try {
      console.log('Starting migration from localStorage to Firestore...');

      const documents = localStorageService.getDocuments();
      const templates = localStorageService.getTemplates();

      console.log(`Found ${documents.length} documents and ${templates.length} templates`);

      for (const doc of documents) {
        await firestoreService.saveDocument(doc);
        console.log(`Migrated document: ${doc.title}`);
      }

      for (const template of templates) {
        await firestoreService.saveTemplate(template);
        console.log(`Migrated template: ${template.title}`);
      }

      localStorage.setItem(MIGRATION_KEY, 'true');
      console.log('Migration completed successfully!');

      return true;
    } catch (error) {
      console.error('Migration failed:', error);
      return false;
    }
  }
};

import { storageService as localStorageService } from './localStorageService';
import { firestoreService } from './firestoreService';
import { storageService } from './storageService';
import { DocumentData } from '../types';

const MIGRATION_KEY = 'tm_migration_completed';
const TEMPLATE_CATEGORY_MIGRATION_KEY = 'tm_template_category_migrated';

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
  },

  // 템플릿 카테고리 마이그레이션 (최초 1회만 실행)
  // - templateCategory가 없는 템플릿은 'task'로 설정
  // - 같은 카테고리의 중복 템플릿이 있으면 최신 것만 유지
  migrateTemplateCategories: async (): Promise<void> => {
    const completed = localStorage.getItem(TEMPLATE_CATEGORY_MIGRATION_KEY);
    if (completed === 'true') {
      console.log('Template category migration already completed');
      return;
    }

    try {
      console.log('Starting template category migration...');

      const templates = await storageService.getTemplates();

      // 1. templateCategory 기본값 설정
      const templatesWithCategory = templates.map(t => ({
        ...t,
        templateCategory: t.templateCategory || ('task' as const)
      }));

      // 2. 카테고리별로 그룹화
      const categoryMap = new Map<string, DocumentData[]>();
      templatesWithCategory.forEach(t => {
        const category = t.templateCategory!;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, []);
        }
        categoryMap.get(category)!.push(t);
      });

      // 3. 각 카테고리에서 최신 템플릿만 유지
      const migratedTemplates: DocumentData[] = [];
      const deletedTemplateIds: string[] = [];

      categoryMap.forEach((templateList) => {
        if (templateList.length === 1) {
          migratedTemplates.push(templateList[0]);
        } else {
          // 여러 개면 updatedAt이 가장 최신인 것만 유지
          const latest = templateList.reduce((prev, current) =>
            current.updatedAt > prev.updatedAt ? current : prev
          );
          migratedTemplates.push(latest);

          // 삭제될 템플릿 ID 기록
          const deleted = templateList.filter(t => t.id !== latest.id);
          deletedTemplateIds.push(...deleted.map(d => d.id));
        }
      });

      // 4. 삭제될 템플릿이 있으면 Firestore에서 삭제
      for (const deletedId of deletedTemplateIds) {
        try {
          await storageService.deleteTemplate(deletedId);
          console.log(`Deleted duplicate template: ${deletedId}`);
        } catch (error) {
          console.warn(`Failed to delete template ${deletedId}:`, error);
        }
      }

      // 5. 저장
      await storageService.saveTemplates(migratedTemplates);
      localStorage.setItem(TEMPLATE_CATEGORY_MIGRATION_KEY, 'true');

      console.log(
        `Template category migration completed: ${templates.length} -> ${migratedTemplates.length} templates`
      );
      if (deletedTemplateIds.length > 0) {
        console.log(`Deleted ${deletedTemplateIds.length} duplicate templates`);
      }
    } catch (error) {
      console.error('Template category migration failed:', error);
    }
  }
};

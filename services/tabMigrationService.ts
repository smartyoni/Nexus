import { Tab, generateId } from '../types';
import { storageService } from './storageService';

const MIGRATION_FLAG = 'tm_tab_migration_complete';

export const tabMigrationService = {
  // Check if migration has already been done
  isMigrationComplete: (): boolean => {
    try {
      return localStorage.getItem(MIGRATION_FLAG) === 'true';
    } catch (e) {
      return false;
    }
  },

  // Perform migration from category system to tab system
  migrateToTabSystem: async (): Promise<void> => {
    // Only migrate once
    if (tabMigrationService.isMigrationComplete()) {
      // 플래그는 있지만 실제 탭이 없는 경우 복구
      const tabs = await storageService.getTabs();
      const hasDefaultTab = tabs.some(t => t.isDefault === true);

      if (!hasDefaultTab) {
        console.warn('Migration flag exists but no default tab found. Recreating...');
        await tabMigrationService.createDefaultInboxTab();
      }
      return;
    }

    try {
      // 1. Delete all existing documents
      await storageService.saveDocuments([]);

      // 2. Clear favorite
      await storageService.clearFavoriteDocId();

      // 3. Create 4 fixed tabs
      const baseTime = Date.now();
      const defaultTabs: Tab[] = [
        {
          id: generateId(),
          name: 'IN-BOX',
          isDefault: true,
          createdAt: baseTime
        },
        {
          id: generateId(),
          name: '탭1',
          isDefault: false,
          createdAt: baseTime + 1
        },
        {
          id: generateId(),
          name: '탭2',
          isDefault: false,
          createdAt: baseTime + 2
        },
        {
          id: generateId(),
          name: '탭3',
          isDefault: false,
          createdAt: baseTime + 3
        }
      ];

      // 4. Save default tabs
      await storageService.saveTabs(defaultTabs);

      // 5. Set IN-BOX as active tab
      await storageService.setCurrentTabId(defaultTabs[0].id);

      // 6. Mark migration as complete
      localStorage.setItem(MIGRATION_FLAG, 'true');

      console.log('Tab migration completed successfully with 4 fixed tabs');
    } catch (error) {
      console.error('Tab migration failed:', error);
      // Still mark as complete to prevent infinite retries
      localStorage.setItem(MIGRATION_FLAG, 'true');
    }
  },

  // 복구: 기본 4개 탭 생성
  createDefaultInboxTab: async (): Promise<void> => {
    try {
      const tabs = await storageService.getTabs();

      // 이미 isDefault=true인 탭이 있는지 확인
      if (tabs.some(t => t.isDefault === true)) {
        console.log('Default IN-BOX tab already exists');
        return;
      }

      const baseTime = Date.now();
      const defaultTabs: Tab[] = [
        {
          id: generateId(),
          name: 'IN-BOX',
          isDefault: true,
          createdAt: baseTime
        },
        {
          id: generateId(),
          name: '탭1',
          isDefault: false,
          createdAt: baseTime + 1
        },
        {
          id: generateId(),
          name: '탭2',
          isDefault: false,
          createdAt: baseTime + 2
        },
        {
          id: generateId(),
          name: '탭3',
          isDefault: false,
          createdAt: baseTime + 3
        }
      ];

      await storageService.saveTabs(defaultTabs);
      await storageService.setCurrentTabId(defaultTabs[0].id);

      console.log('Default 4 tabs recreated');
    } catch (error) {
      console.error('Failed to recreate default tabs:', error);
    }
  },

  // 새로 추가: IN-BOX 탭 하나만 보장
  ensureSingleInboxTab: async (): Promise<void> => {
    try {
      const tabs = await storageService.getTabs();

      // IN-BOX 탭이 있는지 확인
      let inboxTab = tabs.find(t => t.isDefault === true);

      if (!inboxTab) {
        // IN-BOX 탭 생성
        inboxTab = {
          id: generateId(),
          name: 'IN-BOX',
          isDefault: true,
          createdAt: Date.now()
        };

        await storageService.saveTabs([inboxTab]);
        await storageService.setCurrentTabId(inboxTab.id);
        console.log('Created single IN-BOX tab');
      } else if (tabs.length > 1) {
        // IN-BOX 외 다른 탭이 있으면 제거 (문서는 모두 IN-BOX로 이동)
        console.log(`Found ${tabs.length} tabs. Keeping only IN-BOX...`);

        // 다른 탭의 문서를 모두 IN-BOX로 이동
        const documents = await storageService.getDocuments();
        const migratedDocs = documents.map(doc => ({
          ...doc,
          tabId: inboxTab!.id,
          updatedAt: Date.now()
        }));

        await storageService.saveDocuments(migratedDocs);
        await storageService.saveTabs([inboxTab]);
        await storageService.setCurrentTabId(inboxTab.id);

        console.log(`Migrated all documents to IN-BOX and removed ${tabs.length - 1} extra tabs`);
      }
    } catch (error) {
      console.error('Failed to ensure single IN-BOX tab:', error);
    }
  }
};
